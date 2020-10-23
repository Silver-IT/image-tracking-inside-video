import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import {TransformToolService} from '../../../../image-editor/tools/transform/transform-tool.service';
import {Store} from '@ngxs/store';
import {MarkAsDirty} from '../../../state/transform/transform.actions';

@Component({
    selector: 'transform-drawer',
    templateUrl: './transform-drawer.component.html',
    styleUrls: ['./transform-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class TransformDrawerComponent {
    constructor(
        private store: Store,
        private transformTool: TransformToolService,
    ) {}

    public rotateLeft() {
        this.transformTool.rotate('basic', -90);
        this.markAsDirty();
    }

    public rotateRight() {
        this.transformTool.rotate('basic', 90);
        this.markAsDirty();
    }

    public skew(e: MatSliderChange) {
        this.transformTool.rotate('skew', e.value);
    }

    public flipHorizontal() {
        this.transformTool.flip('horizontal');
        this.markAsDirty();
    }

    public flipVertical() {
        this.transformTool.flip('vertical');
        this.markAsDirty();
    }

    public markAsDirty() {
        this.store.dispatch(new MarkAsDirty());
    }
}
