import {Component, HostBinding, Input, ViewEncapsulation} from '@angular/core';
import {HistoryToolService} from '../../image-editor/history/history-tool.service';
import {ActiveObjectService} from '../../image-editor/canvas/active-object/active-object.service';
import {EditorControlsService} from '../toolbar-controls/editor-controls.service';
import {ObjectListService} from '../../image-editor/objects/object-list.service';
import {Select, Store} from '@ngxs/store';
import {HistoryState} from '../state/history/history.state';
import {DrawerName} from '../toolbar-controls/drawers/drawer-name.enum';
import {EditorState} from '../../image-editor/state/editor-state';
import {Observable} from 'rxjs';
import {ObjectNames} from '../../image-editor/objects/object-names.enum';
import {OpenPanel} from '../../image-editor/state/editor-state-actions';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';

@Component({
    selector: 'floating-object-controls',
    templateUrl: './floating-object-controls.component.html',
    styleUrls: ['./floating-object-controls.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FloatingObjectControlsComponent {
    @Select(HistoryState.canUndo) canUndo$: Observable<boolean>;
    @Select(HistoryState.canRedo) canRedo$: Observable<boolean>;
    @Select(EditorState.activeObjId) activeObjId$: Observable<string>;
    @Select(EditorState.dirty) dirty$: Observable<boolean>;
    @Input() @HostBinding('class.mobile-mode') mobileMode = false;

    constructor(
        public history: HistoryToolService,
        public activeObject: ActiveObjectService,
        public controls: EditorControlsService,
        public breakpoints: BreakpointsService,
        private objects: ObjectListService,
        private store: Store,
    ) {}

    public deleteObject() {
        const obj = this.activeObject.get();
        if ( !obj) return;
        this.activeObject.delete();
        this.history.add({name: `Deleted: ${obj.name}`, icon: 'delete-custom'});
    }

    /**
     * Open drawer for adding more of current active object.
     */
    public openObjectDrawer() {
        switch (this.activeObject.get().name) {
            case ObjectNames.shape.name:
                this.controls.openPanel(DrawerName.SHAPES);
                break;
            case ObjectNames.sticker.name:
                this.controls.openPanel(DrawerName.STICKERS);
                break;
            case ObjectNames.text.name:
                this.controls.openPanel(DrawerName.TEXT);
                break;
        }
    }

    public openObjSettingsPanel() {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
    }

    public bringActiveObjectToFront() {
        this.activeObject.bringToFront();
        this.objects.syncObjects();
    }
}
