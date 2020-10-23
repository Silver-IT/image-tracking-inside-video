import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {CanvasService} from '../../../../image-editor/canvas/canvas.service';
import {Store} from '@ngxs/store';
import {MarkAsDirty} from '../../../state/background/background.actions';

@Component({
    selector: 'canvas-background-drawer',
    templateUrl: './canvas-background-drawer.component.html',
    styleUrls: ['./canvas-background-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class CanvasBackgroundDrawerComponent implements OnInit {
    public colorControl = new FormControl();

    constructor(
        private store: Store,
        private canvas: CanvasService,
    ) {}

    ngOnInit() {
        this.colorControl.valueChanges.subscribe(color => {
            if ( ! color) return;
            this.canvas.fabric().setBackgroundColor(color);
            this.canvas.render();
            this.store.dispatch(new MarkAsDirty());
        });
    }
}
