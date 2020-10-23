import {Component, ElementRef, ViewChild, ViewEncapsulation} from '@angular/core';
import {ColorpickerPanelComponent} from 'common/core/ui/color-picker/colorpicker-panel.component';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';
import {BOTTOM_POSITION} from '@common/core/ui/overlay-panel/positions/bottom-position';

@Component({
    selector: 'shadow-controls-drawer',
    templateUrl: './shadow-controls-drawer.component.html',
    styleUrls: ['./shadow-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ShadowControlsDrawer {
    @ViewChild('colorPickerButton', { read: ElementRef }) colorPickerButton: ElementRef;

    constructor(
        private overlayPanel: OverlayPanel,
        public activeObject: ActiveObjectService,
    ) {}

    public openColorPicker() {
        this.overlayPanel.open(ColorpickerPanelComponent, {position: BOTTOM_POSITION, origin: this.colorPickerButton})
            .valueChanged().subscribe(color => {
                this.activeObject.form.get('shadow.color').patchValue(color);
            });
    }
}

