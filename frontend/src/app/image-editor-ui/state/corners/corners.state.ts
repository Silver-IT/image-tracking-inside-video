import {Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {RoundToolService} from '../../../image-editor/tools/round/round-tool.service';
import {Injectable} from '@angular/core';

interface CornersStateModel {
    dirty: boolean;
}

const CORNER_STATE_DEFAULTS = {
    dirty: true,
};

@State<CornersStateModel>({
    name: 'corners',
    defaults: CORNER_STATE_DEFAULTS
})
@Injectable()
export class CornersState extends BaseToolState<CornersStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.CORNERS;

    @Selector()
    static dirty(state: CornersStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected actions$: Actions,
        protected history: HistoryToolService,
        protected roundTool: RoundToolService,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<CornersStateModel>) {
        this.store.dispatch(new CloseForePanel());
        this.roundTool.apply(this.roundTool.getPreviewRadius()).then(() => {
            this.history.add(HistoryNames.CORNERS);
        });
        ctx.patchState(CORNER_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<CornersStateModel>) {
        this.store.dispatch(new CloseForePanel());
        ctx.patchState(CORNER_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<CornersStateModel>) {
        ctx.setState(CORNER_STATE_DEFAULTS);
    }
}
