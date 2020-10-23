import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {FormControl, FormGroup} from '@angular/forms';
import {CanvasService} from '../../../image-editor/canvas/canvas.service';
import {ImportToolService} from '../../../image-editor/tools/import/import-tool.service';
import {BehaviorSubject} from 'rxjs';
import {SampleImage} from './sample-image';

@Component({
    selector: 'open-sample-image-panel',
    templateUrl: './open-sample-image-panel.component.html',
    styleUrls: ['./open-sample-image-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class OpenSampleImagePanelComponent {
    public newCanvasForm = new FormGroup({
        width: new FormControl(800),
        height: new FormControl(600),
    });

    public newCanvasFormVisible$ = new BehaviorSubject(false);
    public sampleImages: SampleImage[];

    constructor(
        public importTool: ImportToolService,
        private config: Settings,
        private panelRef: OverlayPanelRef<OpenSampleImagePanelComponent>,
        private canvas: CanvasService,
    ) {
        this.sampleImages = this.config.get('pixie.ui.openImageDialog.sampleImages');
    }

    public openUploadDialog() {
        this.importTool.openUploadDialog({openAsBackground: true}).then(() => this.close());
    }

    public openSample(sample: SampleImage) {
        if (typeof sample.action === 'function') {
            sample.action();
        } else {
            const sampleUrl = this.getSampleUrl(sample);
            if (sampleUrl.endsWith('.json')) {
                this.importTool.loadStateFromUrl(sampleUrl).then(() => this.close());
            } else {
                this.importTool.openBackgroundImage(sampleUrl)
                    .then(() => this.close());
            }
        }
    }

    public createNewCanvas() {
        const width = this.newCanvasForm.get('width').value,
            height = this.newCanvasForm.get('height').value;

        this.config.set('pixie.blankCanvasSize', {width, height});
        this.canvas.openNew(width, height).then(() => this.close());
    }

    public close() {
        this.panelRef.close();
    }

    public getSampleUrl(image: SampleImage, useThumbnail = false) {
        const url = (image.thumbnail && useThumbnail) ? image.thumbnail : image.url;
        // prefix relative link with base url, if needed
        if (url.indexOf('//') === -1) {
            return this.config.getAssetUrl(url, true);
        } else {
            return url;
        }
    }
}
