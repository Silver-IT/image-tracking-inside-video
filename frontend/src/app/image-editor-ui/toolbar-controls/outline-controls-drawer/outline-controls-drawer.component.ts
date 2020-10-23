import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';

@Component({
    selector: 'outline-controls-drawer',
    templateUrl: './outline-controls-drawer.component.html',
    styleUrls: ['./outline-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OutlineControlsDrawerComponent {
    constructor(public activeObject: ActiveObjectService) {}
}
