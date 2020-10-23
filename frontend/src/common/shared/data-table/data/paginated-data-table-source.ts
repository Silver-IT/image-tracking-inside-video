import {BehaviorSubject, combineLatest, merge, Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {FormControl, FormGroup} from '@angular/forms';
import {PageEvent} from '@angular/material/paginator';
import {Sort} from '@angular/material/sort';
import {DataSource, SelectionModel} from '@angular/cdk/collections';
import {DataTableSourceConfig} from '@common/shared/data-table/data/data-table-source-config';
import {arrayToObject} from '@common/core/utils/array-to-object';
import {DataTableFilter} from '@common/shared/data-table/filter-panel/data-table-filters';
import {PaginationResponse} from '@common/core/types/pagination/pagination-response';
import {PaginationParams} from '@common/core/types/pagination/pagination-params';

export class PaginatedDataTableSource<T> implements DataSource<T> {
    public initiated = false;
    private pagination$ = new BehaviorSubject<PaginationResponse<T>>(null);
    private userParamsChange$ = new BehaviorSubject<object>({});
    public selectedRows = new SelectionModel<T>(true, []);
    public searchControl = new FormControl();
    public filterForm = new FormGroup({});
    public nextPageLoader$ = new BehaviorSubject<{page: number}>(null);
    public virtualSort$ = new BehaviorSubject<Partial<Sort>>({});
    public paginationParams: PaginationParams = {};
    public activeFilters$: Observable<DataTableFilter[]> = this.filterForm.valueChanges.pipe(map((value: object) => {
        return Object.entries(value)
            // remove non active filters
            .filter(entry => entry[1] != null)
            // map filter column to display name
            .map(entry => this.config.filters.find(f => f.column === entry[0]));
    }));

    set data(data: T[]) {
        this.pagination$.next({...this.pagination$.value, data});
    }

    get data(): T[] {
        return this.pagination$.value ? this.pagination$.value.data : [];
    }

    get paginatedOnce$(): Observable<boolean> {
        return this.config.dataPaginator.paginatedOnce$.pipe(filter(val => !!val), take(1));
    }

    get noResults$() {
        // check if paginated at least once or if
        // data has been set via "setData" method
        return combineLatest([
            this.config.dataPaginator.noResults$,
            this.pagination$,
        ]).pipe(map(([noResults, paginationResponse]) => {
            return noResults && (paginationResponse && !paginationResponse.data.length);
        }));
    }

    get loading$() {
        return this.config.dataPaginator.loading$;
    }

    get totalCount$(): Observable<number|null> {
        return this.pagination$.pipe(map(p => p ? p.total : null));
    }

    constructor(public config: DataTableSourceConfig<T>) {
        if (this.config.filters) {
            this.config.filters.forEach(f => {
                const control = new FormControl(f.defaultValue || null);
                this.filterForm.addControl(f.column, control);
            });
            this.applyFiltersFromQueryParams();
        }
        if (config.dataPaginator && config.dontUpdateQueryParams) {
            config.dataPaginator.dontUpdateQueryParams = true;
        }
    }

    public anyRowsSelected() {
        return this.selectedRows.hasValue();
    }

    public allRowsSelected(): boolean {
        return this.selectedRows.selected.length &&
            this.selectedRows.selected.length === this.pagination$.value.data.length;
    }

    public toggleAllRows() {
        this.allRowsSelected() ?
            this.deselectAllItems() :
            this.pagination$.value.data.forEach(row => this.selectedRows.select(row));
    }

    public deselectAllItems() {
        this.selectedRows.clear();
    }

    public getSelectedItems(): number[] {
        return this.selectedRows.selected.map(item => item['id']);
    }

    public setSelectedItems(items: T[]) {
        this.deselectAllItems();
        this.selectedRows.select(...items);
    }
    
    public removeFilter(column: string) {
        this.filterForm.get(column).setValue(null);
    }

    public updateConfig(config: DataTableSourceConfig<T>) {
        this.config = {...this.config, ...config};
        return this;
    }

    /**
     * Merge specified params with current
     * pagination params and reload data.
     */
    public reload(params: object = {}) {
        this.userParamsChange$.next(params);
        if ( ! this.initiated) {
            this.init();
        }
    }
    
    public canLoadNextPage() {
        return this.pagination$.value &&
            this.getCurrentPage() < this.pagination$.value.last_page;
    }

    public loadNextPage() {
        this.nextPageLoader$.next({page: this.getCurrentPage() + 1});
    }

    /**
     * Reset current pagination params to initial
     * state and reload data using specified params
     */
    public reset(params?: object) {
        this.searchControl.reset();
        this.resetSort();
        this.resetMatPaginator();
        this.deselectAllItems();
        this.reload(params);
    }

    public init(config?: DataTableSourceConfig<T>) {
        if (this.initiated) return this;
        if (config) this.updateConfig(config);
        const sortChange = this.config.matSort ?
            merge(this.config.matSort.sortChange, this.config.matSort.initialized) :
            this.virtualSort$;
        const pageChange = this.config.matPaginator ?
            merge(this.config.matPaginator.page, this.config.matPaginator.initialized) :
            this.nextPageLoader$;
        const searchChange = this.searchControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            map(query => {
                return {query};
            })
        );
        const filterChange = this.filterForm.valueChanges.pipe(map((value: object) => {
            // remove "undefined" values from filters object
            Object.keys(value).forEach(key => {
                if (value[key] == null) {
                    delete value[key];
                // return only ID if whole model is bound to form
                } else if (value[key].id) {
                    value[key] = value[key].id;
                }
            });
            return value;
        }));

        combineLatest([sortChange, pageChange, searchChange, filterChange, this.userParamsChange$])
            .pipe(
                // prevent double trigger when resetting all filters at the same time
                debounceTime(0),
                map(params => this.transformParams(params as any)),
            )
            .subscribe(params => {
                this.config.dataPaginator.paginate(params, this.config.uri, this.config.initialData);
            });

        this.config.dataPaginator.pagination$.subscribe(pagination => {
            // material paginator current page is zero-based while laravel starts from one
            if (this.config.matPaginator) {
                this.config.matPaginator.pageIndex = pagination.current_page - 1;
                this.config.matPaginator.pageSize = pagination.per_page;
                this.config.matPaginator.length = pagination.data.length ? pagination.total : 0;
            }

            // append data instead of overriding with next page data (infinite scroll).
            // if page did not change, we can assume that it was filter or sort
            // change and we should use only new data, even on infinite scroll
            if (this.config.appendData && pagination.current_page !== this.getCurrentPage()) {
                const currentData = this.pagination$.value ? this.pagination$.value.data : [];
                pagination = {...pagination, data: [...currentData, ...pagination.data]};
            }

            this.pagination$.next(pagination);
        });

        // angular does not fire "valueChanges" on form control if default
        // value is not provided, so need to trigger it manually here otherwise
        // changes pipeline will not fire until search control value changes
        // # https://github.com/angular/angular/issues/14542
        this.searchControl.setValue(null);
        this.filterForm.patchValue({});

        this.initiated = true;
        return this;
    }

    public getCurrentPage(): number {
        return this.pagination$.value ? this.pagination$.value.current_page : undefined;
    }

    private transformParams(originalParams: (PageEvent & Sort)[]) {
        const params = arrayToObject(originalParams);

        // have mat paginator
        if (this.config.matPaginator) {
            // pageIndex can be 0, need to check for undefined or null only
            params.page = params.pageIndex != null ? params.pageIndex + 1 : undefined;
            params.per_page = params.pageSize;
        }

        if (params.active) {
            params.orderBy = params.active;
            params.orderDir = params.direction;
        }

        // remove "undefined" and renamed values from object
        const keysToRemove = ['pageIndex', 'pageSize', 'active', 'direction', 'previousPageIndex', 'length'];
        Object.keys(params)
            .forEach(key => {
                if (keysToRemove.indexOf(key) > -1 || params[key] == null) {
                    delete params[key];
                }
            });

        // merge static params specified by users, they will
        // not change and should be sent with every request
        this.paginationParams = {...this.config.staticParams, ...params};
        return this.paginationParams;
    }

    private resetSort() {
        if ( ! this.config.matSort || ! this.config.matSort.active) return;
        this.config.matSort.sort({
            id: '',
            start: 'desc',
            disableClear: false
        });
    }

    private resetMatPaginator() {
        if ( ! this.config.matPaginator) return;
        this.config.matPaginator.length = 0;
        this.config.matPaginator._changePageSize(15);
        this.config.matPaginator.firstPage();
    }

    public connect(): Observable<T[]> {
        return this.pagination$.pipe(
            filter(p => !!p), // skip first "null" on behaviour subject
            map(p => p ? p.data : [])
        );
    }

    public disconnect() {
        this.config.dataPaginator.destroy();
        this.pagination$.complete();
    }

    private applyFiltersFromQueryParams() {
        const queryParams = this.config.dataPaginator.currentQueryParams();
        const queryValues = {};
        Object.keys(this.filterForm.controls).forEach(filterName => {
            let queryValue = queryParams[filterName];
            if (queryValue) {
                if (queryValue === 'false') {
                    queryValue = false;
                } else if (queryValue === 'true') {
                    queryValue = true;
                }
                queryValues[filterName] = queryValue;
            }
        });
        if (Object.keys(queryValues).length) {
            setTimeout(() => {
                this.filterForm.patchValue(queryValues);
            });
        }
    }
}
