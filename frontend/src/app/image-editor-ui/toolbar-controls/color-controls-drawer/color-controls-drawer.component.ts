import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';

@Component({
    selector: 'color-controls-drawer',
    templateUrl: './color-controls-drawer.component.html',
    styleUrls: ['./color-controls-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class ColorControlsDrawerComponent {
    @Input() controlName: 'fill'|'backgroundColor';
    constructor(public activeObject: ActiveObjectService) {}
}
