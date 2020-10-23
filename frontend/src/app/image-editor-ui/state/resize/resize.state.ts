import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {ResizeToolService} from '../../../image-editor/tools/resize/resize-tool.service';
import {SetResizeDimensions} from './resize.actions';
import {Toast} from '@common/core/ui/toast.service';
import {Injectable} from '@angular/core';

interface ResizeStateModel {
    dirty: boolean;
    resized: boolean;
    width: number;
    height: number;
    usePercentages: boolean;
}

const RESIZE_STATE_DEFAULTS: ResizeStateModel = {
    dirty: false,
    resized: false,
    width: null,
    height: null,
    usePercentages: false,
};

@State<ResizeStateModel>({
    name: 'resize',
    defaults: RESIZE_STATE_DEFAULTS
})
@Injectable()
export class ResizeState extends BaseToolState<ResizeStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.RESIZE;

    @Selector()
    static dirty(state: ResizeStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
        protected resizeTool: ResizeToolService,
        protected toast: Toast,
    ) {
        super();
    }

    @Action(SetResizeDimensions)
    setResizeDimensions(ctx: StateContext<ResizeStateModel>, action: SetResizeDimensions) {
        ctx.patchState({...action.params, dirty: true});
    }

    applyChanges(ctx: StateContext<ResizeStateModel>) {
        const {width, height, usePercentages} = ctx.getState();
        this.store.dispatch(new CloseForePanel());
        this.resizeTool.apply(width, height, usePercentages);
        this.toast.open('Photo resized.');
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.RESIZE);
        }
        ctx.patchState(RESIZE_STATE_DEFAULTS);
    }

   cancelChanges(ctx: StateContext<ResizeStateModel>) {
       this.store.dispatch(new CloseForePanel());
       ctx.patchState(RESIZE_STATE_DEFAULTS);
   }

    resetState(ctx: StateContext<ResizeStateModel>) {
        ctx.setState(RESIZE_STATE_DEFAULTS);
    }
}
