import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {FillToolService} from '../../../../image-editor/tools/fill/fill-tool.service';
import {ImportToolService} from '../../../../image-editor/tools/import/import-tool.service';

@Component({
    selector: 'texture-controls-drawer',
    templateUrl: './texture-controls-drawer.component.html',
    styleUrls: ['./texture-controls-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TextureControlsDrawerComponent {
    public defaultTextures = Array.from(Array(28).keys());

    constructor(
        public activeObject: ActiveObjectService,
        private settings: Settings,
        private sanitizer: DomSanitizer,
        private fillTool: FillToolService,
        private importTool: ImportToolService,
    ) {}

    public getTextureBgStyle(index: number): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(
            'url(' + this.getTextureUrl(index) + ')'
        );
    }

    private getTextureUrl(index: number): string {
        return this.settings.getAssetUrl('images/textures/' + index + '.png', true);
    }

    public fillWithPattern(index: number) {
        this.fillTool.withPattern(this.getTextureUrl(index));
    }

    public openUploadDialog() {
        this.importTool.importAndGetData().then(data => {
            this.fillTool.withPattern(data);
        });
    }
}
