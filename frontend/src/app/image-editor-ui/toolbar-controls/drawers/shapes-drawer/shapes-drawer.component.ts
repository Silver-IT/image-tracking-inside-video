import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {BasicShape} from '../../../../image-editor/tools/shapes/default-shapes';
import {Select, Store} from '@ngxs/store';
import {ShapesState} from '../../../state/shapes/shapes.state';
import {Observable} from 'rxjs';
import {AddShape} from '../../../state/shapes/shapes.actions';

@Component({
    selector: 'shapes-drawer',
    templateUrl: './shapes-drawer.component.html',
    styleUrls: ['./shapes-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class ShapesDrawerComponent {
    @Select(ShapesState.dirty) dirty$: Observable<boolean>;
    public shapes: BasicShape[];

    constructor(
        private config: Settings,
        private store: Store,
    ) {
        this.shapes = this.config.get('pixie.tools.shapes.items');
    }

    public addShape(shape: string) {
        this.store.dispatch(new AddShape(shape));
    }
}
