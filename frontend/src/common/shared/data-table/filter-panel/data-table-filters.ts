import {ComponentType} from '@angular/cdk/portal';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';

export interface DataTableFilter {
    name: string;
    column: string;
    defaultValue?: string;
    condition?: DataTableFilterCondition;
    type: 'date' | 'select' | 'user-select' | 'custom' | 'hidden';
    component?: ComponentType<any>;
    options?: DataTableFilterOption[];
}

export interface DataTableFilterOption {
    name: string;
    displayName?: string;
    value?: boolean | number | string;
}

export type DataTableFilterCondition = string | ((dataSource: PaginatedDataTableSource<any>) => boolean);
