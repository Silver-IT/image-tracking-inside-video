import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {MarkAsDirty, OpenObjectSettingsPanel} from './objects.actions';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {ActiveObjectService} from '../../../image-editor/canvas/active-object/active-object.service';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {Injectable} from '@angular/core';

export interface ObjectsStateModel {
    dirty: boolean;
    activePanel: string;
}

@State<ObjectsStateModel>({
    name: DrawerName.OBJECT_SETTINGS,
    defaults: {
        dirty: false,
        activePanel: null,
    }
})
@Injectable()
export class ObjectsState extends BaseToolState<ObjectsStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.OBJECT_SETTINGS;

    @Selector()
    static dirty(state: ObjectsStateModel) {
        return state.dirty;
    }

    @Selector()
    static activePanel(state: ObjectsStateModel) {
        return state.activePanel;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected activeObject: ActiveObjectService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(OpenObjectSettingsPanel)
    openObjectSettingsPanel(ctx: StateContext<ObjectsStateModel>, action: OpenObjectSettingsPanel) {
        ctx.patchState({activePanel: action.panel});
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<ObjectsStateModel>) {
        ctx.patchState({dirty: true});
    }

    cancelChanges(ctx: StateContext<ObjectsStateModel>) {
        if (ctx.getState().activePanel) {
            ctx.patchState({activePanel: null});
        } else {
            this.store.dispatch(new CloseForePanel());
            this.activeObject.deselect();
        }

        if (ctx.getState().dirty) {
            this.history.reload();
        }

        ctx.patchState({dirty: false});
    }

    applyChanges(ctx: StateContext<ObjectsStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.OBJECT_STYLE);
        }
        ctx.patchState({dirty: false, activePanel: null});
        this.activeObject.deselect();
    }

    resetState(ctx: StateContext<ObjectsStateModel>) {
        ctx.setState({
            dirty: false,
            activePanel: null,
        });
    }
}
