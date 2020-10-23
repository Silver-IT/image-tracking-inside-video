import {State, Action, Selector, StateContext, Store, NgxsOnInit, Actions} from '@ngxs/store';
import {AddText} from './text.actions';
import {TextToolService} from '../../../image-editor/tools/text/text-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {Injectable} from '@angular/core';

export interface TextStateModel {
    dirty: boolean;
}

const TEXT_STATE_DEFAULTS = {
    dirty: false,
};

@State<TextStateModel>({
    name: 'text',
    defaults: TEXT_STATE_DEFAULTS,
})
@Injectable()
export class TextState extends BaseToolState<TextStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.TEXT;

    @Selector()
    public static dirty(state: TextStateModel) {
        return state.dirty;
    }

    constructor(
        private textTool: TextToolService,
        private store: Store,
        private history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(AddText)
    public add(ctx: StateContext<TextStateModel>, action: AddText) {
        this.textTool.add(action.text);
        ctx.setState({dirty: true});
    }

    applyChanges(ctx: StateContext<TextStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.TEXT);
        }
        ctx.patchState(TEXT_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<TextStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.reload();
        }
        ctx.patchState(TEXT_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<TextStateModel>) {
        ctx.setState(TEXT_STATE_DEFAULTS);
    }
}
