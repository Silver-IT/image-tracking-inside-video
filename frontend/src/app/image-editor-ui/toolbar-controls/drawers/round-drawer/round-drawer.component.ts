import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {RoundToolService} from '../../../../image-editor/tools/round/round-tool.service';

@Component({
    selector: 'round-drawer',
    templateUrl: './round-drawer.component.html',
    styleUrls: ['./round-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class RoundDrawerComponent implements OnDestroy, OnInit {
    public radius = 50;

    constructor(
        public activeObject: ActiveObjectService,
        public roundTool: RoundToolService,
    ) {}

    ngOnInit() {
        this.roundTool.showPreview();
    }

    ngOnDestroy() {
        this.roundTool.hidePreview();
    }
}
