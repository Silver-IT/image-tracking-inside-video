import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Select, Store} from '@ngxs/store';
import {Observable} from 'rxjs';
import {EditorState} from '../../../../image-editor/state/editor-state';
import {DrawerName} from '../drawer-name.enum';
import {Settings} from '@common/core/config/settings.service';

@Component({
    selector: 'custom-drawer',
    templateUrl: './custom-drawer.component.html',
    styleUrls: ['./custom-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class CustomDrawerComponent {
    @Select(EditorState.activePanel) panelName$: Observable<DrawerName>;
    public items: {name: string, thumbnail: string, action: Function}[] = [];

    constructor(
        private config: Settings,
        private store: Store
    ) {
        // const activePanel = this.store.selectSnapshot(EditorState.activePanel);
        const activePanel = 'overlays';
        this.items = this.config.get('pixie.ui.nav.customPanels', {})[activePanel];
    }
}
