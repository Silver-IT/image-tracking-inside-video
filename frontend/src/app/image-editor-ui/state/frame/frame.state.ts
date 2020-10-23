import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {MarkAsDirty, OpenFrameControls} from './frame.actions';
import {Injectable} from '@angular/core';

interface FrameStateModel {
    dirty: boolean;
    controlsOpen: boolean;
}

const FRAME_STATE_DEFAULTS: FrameStateModel = {
    dirty: false,
    controlsOpen: false
};

@State<FrameStateModel>({
    name: 'frame',
    defaults: FRAME_STATE_DEFAULTS
})
@Injectable()
export class FrameState extends BaseToolState<FrameStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.FRAME;

    @Selector()
    static dirty(state: FrameStateModel) {
        return state.dirty;
    }

    @Selector()
    static controlsOpen(state: FrameStateModel) {
        return state.controlsOpen;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<FrameStateModel>) {
        ctx.patchState({dirty: true});
    }

    @Action(OpenFrameControls)
    openFrameControls(ctx: StateContext<FrameStateModel>) {
        ctx.patchState({controlsOpen: true});
    }

    applyChanges(ctx: StateContext<FrameStateModel>) {
        this.store.dispatch(new CloseForePanel());

        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.FRAME);
        }

        ctx.patchState(FRAME_STATE_DEFAULTS);
    }

   cancelChanges(ctx: StateContext<FrameStateModel>) {
        if (ctx.getState().dirty) {
           this.history.reload();
        }

        if (ctx.getState().controlsOpen) {
            ctx.patchState({controlsOpen: false});
        } else {
            this.store.dispatch(new CloseForePanel());
            ctx.patchState(FRAME_STATE_DEFAULTS);
        }
   }

    resetState(ctx: StateContext<FrameStateModel>) {
        ctx.setState(FRAME_STATE_DEFAULTS);
    }
}
