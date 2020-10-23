import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {gradientPresets} from '../../../../image-editor/tools/gradient-presets';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {FillToolService} from '../../../../image-editor/tools/fill/fill-tool.service';

@Component({
    selector: 'gradient-controls-drawer',
    templateUrl: './gradient-controls-drawer.component.html',
    styleUrls: ['./gradient-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GradientControlsDrawerComponent {
    public defaultGradients = gradientPresets;

    constructor(
        public activeObject: ActiveObjectService,
        private settings: Settings,
        private sanitizer: DomSanitizer,
        private fillTool: FillToolService,
    ) {}

    public getGradientBgStyle(index: number): SafeStyle {
        return this.sanitizer.bypassSecurityTrustStyle(
            'url(' + this.getGradientUrl(index) + ')'
        );
    }

    private getGradientUrl(index: number): string {
        return this.settings.getAssetUrl('images/gradients/' + index + '.png', true);
    }

    public fillWithGradient(index: number) {
        this.fillTool.withGradient(index);
    }
}
