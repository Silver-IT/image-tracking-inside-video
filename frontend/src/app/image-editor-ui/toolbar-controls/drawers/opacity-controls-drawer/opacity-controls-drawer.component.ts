import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';

@Component({
    selector: 'opacity-controls-drawer',
    templateUrl: './opacity-controls-drawer.component.html',
    styleUrls: ['./opacity-controls-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpacityControlsDrawer {
    constructor(public activeObject: ActiveObjectService) {}
}
