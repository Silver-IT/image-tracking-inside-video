import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {MarkAsDirty} from './transform.actions';
import {Injectable} from '@angular/core';

interface TransformStateModel {
    dirty: boolean;
}

const TRANSFORM_STATE_DEFAULTS: TransformStateModel = {
    dirty: false,
};

@State<TransformStateModel>({
    name: 'transform',
    defaults: TRANSFORM_STATE_DEFAULTS
})
@Injectable()
export class TransformState extends BaseToolState<TransformStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.TRANSFORM;

    @Selector()
    static dirty(state: TransformStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<TransformStateModel>) {
        ctx.patchState({dirty: true});
    }

    applyChanges(ctx: StateContext<TransformStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.TRANSFORM);
        }
        ctx.patchState(TRANSFORM_STATE_DEFAULTS);
    }

   cancelChanges(ctx: StateContext<TransformStateModel>) {
       this.store.dispatch(new CloseForePanel());
       if (ctx.getState().dirty) {
           this.history.reload();
       }
       ctx.patchState(TRANSFORM_STATE_DEFAULTS);
   }

    resetState(ctx: StateContext<TransformStateModel>) {
        ctx.setState(TRANSFORM_STATE_DEFAULTS);
    }
}
