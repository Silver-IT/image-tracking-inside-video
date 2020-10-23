import {Injectable} from '@angular/core';
import {ImportToolService} from './tools/import/import-tool.service';
import {SerializedCanvas} from './history/serialized-canvas';
import {DEFAULT_CONFIG, PixieConfig} from './default-settings';
import {Store} from '@ngxs/store';
import {
    ApplyChanges,
    CancelChanges,
    CloseEditor,
    OpenEditor,
    OpenPanel,
    ResetToolState
} from './state/editor-state-actions';
import {delay, pairwise, take} from 'rxjs/operators';
import {OpenSampleImagePanelService} from '../image-editor-ui/panels/open-sample-image-panel/open-sample-image-panel.service';
import {HistoryToolService} from './history/history-tool.service';
import {DrawerName} from '../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';
import {EditorState} from './state/editor-state';
import {IEvent, Image} from 'fabric/fabric-impl';
import {CanvasService} from './canvas/canvas.service';
import {Toast, ToastConfig} from '@common/core/ui/toast.service';
import {EditorControlsService} from '../image-editor-ui/toolbar-controls/editor-controls.service';
import {Settings} from '@common/core/config/settings.service';
import * as Dot from 'dot-object';
import merge from 'deepmerge';
import {HttpClient} from '@angular/common/http';
import {lowerFirst} from '@common/core/utils/lower-first';
import {ToolsService} from './tools/tools.service';
import {ThemeService} from '@common/core/theme.service';
import {animationFrameScheduler} from 'rxjs';

/**
 * This class should not be imported into any other tools or services.
 */
@Injectable({
    providedIn: 'root'
})
export class ImageEditorService {
    constructor(
        protected importTool: ImportToolService,
        protected canvas: CanvasService,
        protected history: HistoryToolService,
        protected store: Store,
        protected openSampleImagePanel: OpenSampleImagePanelService,
        protected toast: Toast,
        protected editorControls: EditorControlsService,
        protected settings: Settings,
        protected httpClient: HttpClient,
        protected tools: ToolsService,
        protected themes: ThemeService,
    ) {}

    /**
     * Open specified image and then editor.
     */
    public openEditorWithImage(data: string|HTMLImageElement, asMainImage: boolean = true) {
        this.openFile(data, 'png', asMainImage).then(() => this.open());
    }

    /**
     * Open specified photo as main canvas image.
     */
    public openMainImage(data: string|HTMLImageElement) {
        this.openFile(data, 'png', true);
    }

    public openFile(data: string|HTMLImageElement, extension: string = 'png', asMainImage: boolean = false) {
        return asMainImage ?
            this.importTool.openBackgroundImage(data) :
            this.importTool.openFile(data, extension);
    }

    public newCanvas(width: number, height: number) {
        return this.canvas.openNew(width, height);
    }

    /**
     * Load canvas state from specified json data or url.
     */
    public loadState(stateOrUrl: string|SerializedCanvas) {
        this.canvas.state.contentLoadingState$.next({name: 'state', loading: true});
        let promise: Promise<any>;
        if (typeof stateOrUrl === 'string' && (stateOrUrl.endsWith('.json') || stateOrUrl.startsWith('http'))) {
            promise = this.importTool.loadStateFromUrl(stateOrUrl);
        } else {
            promise = this.importTool.loadState(stateOrUrl);
        }

        return promise.then(() => {
            this.canvas.state.contentLoadingState$.next({name: 'state', loading: false});
        });
    }

    public loadStateFromUrl(url: string) {
        this.importTool.loadStateFromUrl(url);
    }

    /**
     * Get current canvas state as json string.
     */
    public getState(customProps?: string[]) {
        return JSON.stringify(this.history.getCurrentCanvasState(customProps));
    }

    /**
     * Open editor if it's currently closed.
     * New configuration can also be optionally specified.
     */
    public open(config?: PixieConfig) {
        if (config) {
            this.setConfig(config);
        }
        // wait for next render cycle so we get proper editor height for fitting to screen
        this.store.dispatch(new OpenEditor()).pipe(delay(0, animationFrameScheduler)).subscribe(() => {
            this.canvas.zoom.fitToScreen();
            this.history.addInitial();
            if (this.canvas.state.isEmpty() && this.settings.get('pixie.ui.openImageDialog.show')) {
                this.openSampleImagePanel.open();
            }
        });
    }

    /**
     * Close editor if it's currently open.
     */
    public close() {
        return this.store.dispatch(new CloseEditor());
    }

    /**
     * Apply any pending changes from currently open or specified panel.
     * This is identical to clicking "apply" button in the editor.
     */
    public applyChanges(panel?: DrawerName) {
        panel = panel || this.store.selectSnapshot(EditorState.activePanel) || DrawerName.OBJECT_SETTINGS;
        this.store.dispatch(new ApplyChanges(panel));
    }

    /**
     * Cancel any pending changes from currently open or specified panel.
     * This is identical to clicking "cancel" button in the editor.
     */
    public cancelChanges(panel?: DrawerName) {
        panel = panel || this.store.selectSnapshot(EditorState.activePanel) || DrawerName.OBJECT_SETTINGS;
        this.store.dispatch(new CancelChanges(panel));
    }

    /**
     * Open specified editor panel.
     * (Filter, crop, resize etc.)
     */
    public openPanel(name: DrawerName) {
        this.store.dispatch(new OpenPanel(name));
    }

    /**
     * Listen to specified canvas event.
     * (List of all available events can be found in the documentation)
     */
    public on(event: string, callback: (e: IEvent) => void) {
        return this.canvas.fabric().on(event, callback);
    }

    /**
     * Check if some modifications were made to image,
     * but "apply" button was not clicked yet.
     */
    public isDirty() {
        return this.store.selectSnapshot(EditorState.dirty);
    }

    /**
     * Get tool by specified name.
     */
    public getTool(name: string) {
        return this.tools.get(name);
    }

    /**
     * Get tool by specified name.
     */
    public get(name: string) {
        return this.getTool(name);
    }

    /**
     * Get current position for navigation toolbar.
     */
    public getControlsPosition() {
        return this.store.selectSnapshot(EditorState.navPosition);
    }

    /**
     * Display specified notification message on the screen.
     */
    public notify(message: string, config?: ToastConfig) {
        return this.toast.open(message, config);
    }

    /**
     * Fully reset editor and canvas state and
     * optionally override specified configuration.
     */
    public resetEditor(key: string|PixieConfig, value?: any) {
        return new Promise(resolve => {
            // reset fabric and UI
            this.importTool.resetEditor();

            // set new config, if provided
            if (key) this.setConfig(key, value);

            this.store.dispatch([
                new ResetToolState(),
            ]);

            // re-init canvas
            this.loadInitialContent().then(() => {
                this.editorControls.closeCurrentPanel();
                if (key) {
                    this.history.addInitial();
                }
                resolve();
            });
        });
    }

    /**
     * Fully reset and open editor.
     */
    public resetAndOpenEditor(key: string|PixieConfig, value?: any) {
        return this.resetEditor(key, value).then(() => this.open());
    }

    /**
     * Override specified configuration.
     * Accepts configuration object or key value pair using dot notation.
     */
    public setConfig(key: string|PixieConfig, value?: any) {
        // set config if key and value is provided
        if (typeof key === 'string' && typeof value !== 'undefined') {
            const prefixedKey = key.indexOf('vebto.') > -1 ? key : 'pixie.' + key;
            this.settings.set(prefixedKey, value);

            // set config if config object is provided
        } else if (typeof key === 'object') {
            const config = {pixie: key};

            if (config.pixie['sentry_public']) {
                this.settings.set('logging.sentry_public', config.pixie['sentry_public']);
            }
            this.settings.merge(config);
        }
    }

    /**
     * Get default configuration without any custom overrides.
     */
    public getDefaultConfig(key: string): any {
        return Dot.pick(key, DEFAULT_CONFIG);
    }

    /**
     * Get built in http service for making http requests.
     */
    public http(): HttpClient {
        return this.httpClient;
    }

    /**
     * @hidden
     */
    public loadInitialContent(): Promise<Image|{width: number, height: number}|void> {
        let image = this.settings.get('pixie.image'), promise;
        if (image instanceof HTMLImageElement) image = image.src;
        const size = this.settings.get('pixie.blankCanvasSize'),
            state = this.settings.get('pixie.state');
        if (image) {
            if (image.endsWith('.json') || image.startsWith('{"canvas')) {
                promise = this.loadState(image);
            } else {
                promise = this.canvas.loadMainImage(image);
            }
        } else if (state && !state) {
            promise = this.loadState(state);
        } else if (size) {
            promise = this.canvas.openNew(size.width, size.height);
        }
        return (promise || Promise.resolve()).then(() => {
            this.canvas.state.loaded.next(true);
            if (this.canvas.state.isEmpty() && this.settings.get('pixie.ui.openImageDialog.show')) {
                this.openSampleImagePanel.open();
            }
        });
    }

    /**
     * @hidden
     */
    public static mergeConfig(userConfig: PixieConfig) {
        const merged = merge(DEFAULT_CONFIG, userConfig || {});
        return ImageEditorService.replaceDefaultConfigItems(merged, userConfig);
    }

    /**
     * Remove default items if "replaceDefault" is true in user config.
     * @hidden
     */
    public static replaceDefaultConfigItems(config: object, userConfig: object) {
        for (const key in config) {
            if (key.startsWith('replaceDefault') && config[key]) {
                // "replaceDefaultSamples" => "samples" or just "items"
                const iterablesKey = lowerFirst((key.replace('replaceDefault', '') || 'items'));
                config[iterablesKey] = userConfig ? userConfig[iterablesKey] : [];
            } else if (typeof config[key] === 'object') {
                ImageEditorService.replaceDefaultConfigItems(config[key], userConfig && userConfig[key]);
            }
        }

        return config;
    }
}
