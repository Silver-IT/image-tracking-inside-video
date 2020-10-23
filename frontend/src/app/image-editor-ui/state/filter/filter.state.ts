import {Action, Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {OpenFilterControls, RemoveFilter, ApplyFilter, SetAppliedFilters} from './filter.actions';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {FilterToolService} from '../../../image-editor/tools/filter/filter-tool.service';
import {Injectable} from '@angular/core';

interface FilterStateModel {
    dirty: boolean;
    activeFilters: string[];
    selectedFilter: string;
}

@State<FilterStateModel>({
    name: 'filter',
    defaults: {
        dirty: false,
        activeFilters: [],
        selectedFilter: null,
    }
})
@Injectable()
export class FilterState extends BaseToolState<FilterStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.FILTER;

    @Selector()
    static activeFilters(state: FilterStateModel) {
        return state.activeFilters;
    }

    @Selector()
    static selectedFilter(state: FilterStateModel) {
        return state.selectedFilter;
    }

    @Selector()
    static dirty(state: FilterStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
        protected filterTool: FilterToolService,
    ) {
        super();
    }

    @Action(ApplyFilter)
    toggleFilter(ctx: StateContext<FilterStateModel>, action: ApplyFilter) {
        ctx.patchState({
            dirty: true,
            activeFilters: [...ctx.getState().activeFilters, action.filter]
        });
    }

    @Action(RemoveFilter)
    removeFilter(ctx: StateContext<FilterStateModel>, action: RemoveFilter) {
        const activeFilters = ctx.getState().activeFilters.filter(f => f !== action.filter);
        ctx.patchState({dirty: true, activeFilters});
    }

    @Action(OpenFilterControls)
    openFilterControls(ctx: StateContext<FilterStateModel>, action: OpenFilterControls) {
        ctx.patchState({selectedFilter: action.filter});
    }

    @Action(SetAppliedFilters)
    setAppliedFilters(ctx: StateContext<FilterStateModel>, {filters}: SetAppliedFilters) {
        ctx.patchState({activeFilters: filters});
    }

    applyChanges(ctx: StateContext<FilterStateModel>) {
        this.store.dispatch(new CloseForePanel());
        if (ctx.getState().dirty) {
            this.history.add(HistoryNames.FILTER);
        }
        ctx.patchState({dirty: false, selectedFilter: null});
    }

    cancelChanges(ctx: StateContext<FilterStateModel>) {
        const selectedFilter = ctx.getState().selectedFilter;

        // if filter is selected reset all options for that filter to default
        // otherwise all currently applied filter will get removed on "cancel"
        if (selectedFilter) {
            const filter = this.filterTool.getByName(selectedFilter);
            Object.keys(filter.options).forEach(optionName => {
                this.filterTool.applyValue(selectedFilter, optionName, filter.options[optionName].current);
            });
            ctx.patchState({selectedFilter: null});

        // close whole filter drawer only if not filter is currently selected
        } else {
            this.store.dispatch(new CloseForePanel());
            if (ctx.getState().dirty) {
                this.history.reload();
            }
            ctx.patchState({dirty: false, selectedFilter: null});
        }
    }

    resetState(ctx: StateContext<FilterStateModel>) {
        ctx.setState({
            dirty: false,
            activeFilters: [],
            selectedFilter: null,
        });
    }
}
