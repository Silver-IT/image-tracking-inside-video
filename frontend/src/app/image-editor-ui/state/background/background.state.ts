import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {MarkAsDirty} from './background.actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {Injectable} from '@angular/core';

interface BackgroundStateModel {
    dirty: boolean;
}

const BACKGROUND_STATE_DEFAULTS = {
    dirty: true,
};

@State<BackgroundStateModel>({
    name: 'background',
    defaults: BACKGROUND_STATE_DEFAULTS
})
@Injectable()
export class BackgroundState extends BaseToolState<BackgroundStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.BACKGROUND;

    @Selector()
    static dirty(state: BackgroundStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected actions$: Actions,
        protected history: HistoryToolService,
    ) {
        super();
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<BackgroundStateModel>) {
        ctx.patchState({dirty: true});
    }

    applyChanges(ctx: StateContext<BackgroundStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.BACKGROUND);
        }
        ctx.patchState(BACKGROUND_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<BackgroundStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.reload();
        }
        ctx.patchState(BACKGROUND_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<BackgroundStateModel>) {
        ctx.setState(BACKGROUND_STATE_DEFAULTS);
    }
}
