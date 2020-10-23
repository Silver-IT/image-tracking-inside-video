import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {MarkAsDirty, OpenStickerCategory} from './stickers.actions';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {StickerCategory} from '../../../image-editor/tools/shapes/default-stickers';
import {Injectable} from '@angular/core';

interface StickersStateModel {
    dirty: boolean;
    activeCategory: StickerCategory;
}

const STICKER_STATE_DEFAULTS = {
    dirty: false,
    activeCategory: null,
};

@State<StickersStateModel>({
    name: 'stickers',
    defaults: STICKER_STATE_DEFAULTS
})
@Injectable()
export class StickersState extends BaseToolState<StickersStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.STICKERS;

    @Selector()
    static dirty(state: StickersStateModel) {
        return state.dirty;
    }

    @Selector()
    static activeCategory(state: StickersStateModel) {
        return state.activeCategory;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
    ) {
        super();
    }

    @Action(MarkAsDirty)
    markAsDirty(ctx: StateContext<StickersStateModel>) {
        ctx.patchState({dirty: true});
    }

    @Action(OpenStickerCategory)
    openStickerCategory(ctx: StateContext<StickersStateModel>, action: OpenStickerCategory) {
        ctx.patchState({activeCategory: action.category});
    }

    applyChanges(ctx: StateContext<StickersStateModel>) {
        this.store.dispatch(new OpenPanel(DrawerName.OBJECT_SETTINGS));
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.STICKERS);
        }
        ctx.patchState(STICKER_STATE_DEFAULTS);
    }

    cancelChanges(ctx: StateContext<StickersStateModel>) {
        if ( ! ctx.getState().activeCategory) {
            this.store.dispatch(new CloseForePanel());
        }
        if (ctx.getState().dirty) {
            this.history.reload();
        }
        ctx.patchState(STICKER_STATE_DEFAULTS);
    }

    resetState(ctx: StateContext<StickersStateModel>) {
        ctx.setState(STICKER_STATE_DEFAULTS);
    }
}
