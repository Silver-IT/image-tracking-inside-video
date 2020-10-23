import {Injectable} from '@angular/core';
import {HistoryToolService} from '../../history/history-tool.service';
import {CanvasService} from '../../canvas/canvas.service';
import {Toast} from 'common/core/ui/toast.service';
import {Settings} from 'common/core/config/settings.service';
import {Image} from 'fabric/fabric-impl';
import {FrameToolService} from '../frame/frame-tool.service';
import {CropZoneService} from '../crop/crop-zone.service';
import {ImportToolValidator} from './import-tool-validator';
import {UploadInputTypes} from '@common/uploads/upload-input-config';
import {UploadedFile} from '@common/uploads/uploaded-file';
import {openUploadWindow} from '@common/uploads/utils/open-upload-window';
import {SerializedCanvas} from '../../history/serialized-canvas';
import {Store} from '@ngxs/store';
import {ShapesToolService} from '../shapes/shapes-tool.service';
import {ObjectNames} from '../../objects/object-names.enum';
import {HttpClient} from '@angular/common/http';

interface OpenUploadDialogOptions {
    type?: 'image'|'state';
    openAsBackground?: boolean;
}

@Injectable()
export class ImportToolService {
    constructor(
        private history: HistoryToolService,
        private canvas: CanvasService,
        private toast: Toast,
        private config: Settings,
        private frame: FrameToolService,
        private cropzone: CropZoneService,
        private validator: ImportToolValidator,
        private store: Store,
        private shapeTool: ShapesToolService,
        private http: HttpClient,
    ) {}

    /**
     * Open upload dialog, import selected file and open it in editor.
     */
    public openUploadDialog(options: OpenUploadDialogOptions = {type: 'image'}): Promise<any> {
        const accept = this.getUploadAcceptString(options.type);
        return openUploadWindow({extensions: accept}).then(files => {
            return this.loadFile(files[0], options);
        });
    }

    public loadFile(uploadedFile: UploadedFile, options: OpenUploadDialogOptions = {type: 'image'}): Promise<Image|void> {
        return this.validateAndGetData(uploadedFile).then(file => {
            this.executeOnFileOpenCallback(uploadedFile, options);
            if (options.openAsBackground && file.extension !== 'json') {
                return this.openBackgroundImage(file.data);
            } else {
                this.canvas.state.contentLoadingState$.next({name: file.extension === 'json' ? 'state' : 'overlayImage', loading: true});
                return this.openFile(file.data, file.extension).then(response => {
                    this.canvas.state.contentLoadingState$.next({
                        name: file.extension === 'json' ? 'state' : 'overlayImage', loading: false
                    });
                    return response;
                });
            }
        }, () => {});
    }

    /**
     * Open upload dialog, import file and return files data.
     */
    public importAndGetData(): Promise<string> {
        return new Promise(resolve => {
            openUploadWindow({types: [UploadInputTypes.image]}).then(files => {
                this.validateAndGetData(files[0]).then(file => resolve(file.data));
            });
        });
    }

    /**
     * File specified file and if it passes, return files data.
     */
    public validateAndGetData(file: UploadedFile): Promise<{ data: string, extension: string }> {
        const validation = this.validator.validate(file),
        extension = file.extension;

        return new Promise((resolve, reject) => {
            if (validation.failed) {
                return reject();
            }

            this.readFile(file, extension).then(data => resolve({data, extension}));
        });
    }

    public resetEditor(params: {preserveHistory?: boolean} = {}): Promise<any> {
        // reset UI
        this.canvas.fabric().clear();
        this.frame.remove();
        this.cropzone.remove();
        if ( ! params.preserveHistory) {
            this.history.clear();
        }

        // remove previous image and canvas size
        this.config.setMultiple({
            'pixie.image': null,
            'pixie.blankCanvasSize': null,
        });

        return new Promise(resolve => setTimeout(() => resolve()));
    }

    public openFile(data: string|HTMLImageElement, extension: string = 'png', fitToScreen = this.config.get('pixie.tools.import.fitOverlayToScreen')): Promise<Image|void> {
        if (data instanceof HTMLImageElement) data = data.src;
        if (extension === 'json') {
            return this.loadState(data);
        } else if (extension === 'svg') {
            return this.shapeTool.addSvgSticker(data, ObjectNames.image, fitToScreen);
        } else {
            return this.canvas.openImage(data, fitToScreen);
        }
    }

    public loadStateFromUrl(url: string): Promise<any> {
        return this.http.get(url).toPromise().then((state: SerializedCanvas) => {
            return this.loadState(state);
        });
    }

    public loadState(data: string|SerializedCanvas): Promise<void> {
        return this.resetEditor().then(() => {
            return this.history.addFromJson(data);
        });
    }

    /**
     * Open specified data or image as background image.
     */
    public openBackgroundImage(data: string|HTMLImageElement, options: {resetEditor?: boolean} = {resetEditor: true}): Promise<Image> {
        const promise = options.resetEditor ? this.resetEditor({preserveHistory: true}) : new Promise(resolve => resolve());
        return promise.then(() => {
            if (data instanceof HTMLImageElement) data = data.src;
            return this.canvas.loadMainImage(data, options.resetEditor);
        });
    }

    /**
     * Read specified file and get its data.
     */
    private readFile(file: UploadedFile, extension: string): Promise<string> {
        const reader = new FileReader();

        return new Promise(resolve => {
            reader.addEventListener('load', () => {
                resolve(reader.result as string);
            });

            if (extension === 'json') {
                reader.readAsText(file.native);
            } else {
                reader.readAsDataURL(file.native);
            }
        });
    }

    private getUploadAcceptString(type: 'image'|'state'|'all' = 'all'): string[] {
        const validExtensions = this.config.get('pixie.tools.import.validExtensions');
        if (validExtensions) {
            return validExtensions;
        }
        switch (type) {
            case 'image':
                return ['image/*'];
            case 'state':
                return ['.json', 'application/json'];
            case 'all':
            default:
                return ['image/*', '.json', 'application/json'];
        }
    }

    private executeOnFileOpenCallback(file: UploadedFile, options: OpenUploadDialogOptions) {
        const callback = this.config.get('pixie.onFileOpen') as Function;
        if (callback) callback(file, options);
    }
}
