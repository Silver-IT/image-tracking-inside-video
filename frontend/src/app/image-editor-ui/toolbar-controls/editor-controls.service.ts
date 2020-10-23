import {Injectable} from '@angular/core';
import {Store} from '@ngxs/store';
import {CloseForePanel, OpenPanel} from '../../image-editor/state/editor-state-actions';
import {DrawerName} from './drawers/drawer-name.enum';

@Injectable()
export class EditorControlsService {
    constructor(private store: Store) {}

    public openPanel(name: DrawerName) {
        this.store.dispatch(new OpenPanel(name));
    }

    public closeCurrentPanel() {
        this.store.dispatch(new CloseForePanel());
    }
}
