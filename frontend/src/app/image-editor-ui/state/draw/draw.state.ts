import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {CloseBrushControls, MarkAsDirty, OpenBrushControls} from './draw.actions';
import {Injectable} from '@angular/core';

interface DrawStateModel {
    dirty: boolean;
    brushControlsOpen: boolean;
}

const DRAW_STATE_DEFAULTS: DrawStateModel = {
    dirty: false,
    brushControlsOpen: false,
};

@State<DrawStateModel>({
    name: 'draw',
    defaults: DRAW_STATE_DEFAULTS
})
@Injectable()
export class DrawState extends BaseToolState<DrawStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.DRAW;

    @Selector()
    static dirty(state: DrawStateModel) {
        return state.dirty;
    }

    @Selector()
    static brushControlsOpen(state: DrawStateModel) {
        return state.brushControlsOpen;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<DrawStateModel>) {
        ctx.patchState({dirty: true});
    }

    @Action(OpenBrushControls)
    openBrushControls(ctx: StateContext<DrawStateModel>) {
        ctx.patchState({brushControlsOpen: true});
    }

    @Action(CloseBrushControls)
    closeBrushControls(ctx: StateContext<DrawStateModel>) {
        ctx.patchState({brushControlsOpen: false});
    }

    applyChanges(ctx: StateContext<DrawStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.DRAW);
        }
        ctx.patchState(DRAW_STATE_DEFAULTS);
    }

   cancelChanges(ctx: StateContext<DrawStateModel>) {
       if ( ! ctx.getState().brushControlsOpen) {
           this.store.dispatch(new CloseForePanel());
       }

       if (ctx.getState().dirty) {
           this.history.reload();
       }

       ctx.patchState(DRAW_STATE_DEFAULTS);
   }

    resetState(ctx: StateContext<DrawStateModel>) {
        ctx.setState(DRAW_STATE_DEFAULTS);
    }
}
