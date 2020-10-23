import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import { MatButtonToggleChange } from '@angular/material/button-toggle';

@Component({
    selector: 'text-controls-drawer',
    templateUrl: './text-controls-drawer.component.html',
    styleUrls: ['./text-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextControlsDrawerComponent {
    constructor(
        public activeObject: ActiveObjectService,
    ) {}

    public setTextStyle(e: MatButtonToggleChange) {
        this.activeObject.form.patchValue({
            underline: e.value.indexOf('underline') > -1,
            linethrough: e.value.indexOf('linethrough') > -1,
            fontStyle: e.value.indexOf('italic') > -1 ? 'italic' : 'normal',
        });
    }
}
