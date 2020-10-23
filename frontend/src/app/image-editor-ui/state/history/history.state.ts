import {State, Action, Selector, StateContext, createSelector} from '@ngxs/store';
import {HistoryItem} from '../../../image-editor/history/history-item.interface';
import {AddHistoryItem, ReplaceCurrentItem, ResetHistory, UpdatePointerById} from './history.actions';
import {Injectable} from '@angular/core';

export interface HistoryStateModel {
    items: HistoryItem[];
    pointer: number;
}

@State<HistoryStateModel>({
    name: 'history',
    defaults: {
        items: [],
        pointer: 0,
    }
})
@Injectable()
export class HistoryState {
    @Selector()
    public static canUndo({pointer}: HistoryStateModel) {
        return  pointer - 1 > -1;
    }

    @Selector()
    public static canRedo({items, pointer}: HistoryStateModel) {
        return items.length > (pointer + 1);
    }

    @Selector()
    public static items(state: HistoryStateModel) {
        return state.items;
    }

    @Selector()
    public static activeItemId(state: HistoryStateModel) {
        return state.items[state.pointer].id;
    }

    static item(which: 'previous'|'next'|'current') {
        return createSelector([HistoryState], (state: HistoryStateModel) => {
            let index = state.pointer;
            switch (which) {
                case 'previous':
                    index = state.pointer - 1;
                    break;
                case 'next':
                    index = state.pointer + 1;
                    break;
                default:
                    index = state.pointer;
            }
            return state.items[index];
        });
    }

    @Action(AddHistoryItem)
    addItem(ctx: StateContext<HistoryStateModel>, {item}: AddHistoryItem) {
        const stateUntilCurrentPointer = ctx.getState().items.slice(0, ctx.getState().pointer + 1);
        const newItems = [...stateUntilCurrentPointer, item];
        ctx.patchState({
            items: newItems,
            pointer: newItems.length - 1
        });
    }

    @Action(ReplaceCurrentItem)
    replaceCurrentItem(ctx: StateContext<HistoryStateModel>, action: ReplaceCurrentItem) {
        const items = ctx.getState().items.slice();
        items[ctx.getState().pointer] = action.item;
        ctx.patchState({items});
    }

    @Action(UpdatePointerById)
    updatePointerById(ctx: StateContext<HistoryStateModel>, {id}: UpdatePointerById) {
        const index = ctx.getState().items.findIndex(item => item.id === id);
        ctx.patchState({pointer: index});
    }

    @Action(ResetHistory)
    resetHistory(ctx: StateContext<HistoryStateModel>) {
        ctx.patchState({
            items: [],
            pointer: 0
        });
    }
}
