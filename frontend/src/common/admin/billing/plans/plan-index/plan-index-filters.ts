import {DataTableFilter} from '@common/shared/data-table/filter-panel/data-table-filters';

export const PLAN_INDEX_FILTERS: DataTableFilter[] = [
    {
        name: 'currency',
        column: 'currency',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'USD', value: 'USD'},
            {name: 'EUR', value: 'EUR'},
            {name: 'Pound Sterling', value: 'GBP'},
            {name: 'Canadian Dollar', value: 'CAD'},
        ]
    },
    {
        name: 'interval',
        column: 'interval',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'day', value: 'day'},
            {name: 'week', value: 'week'},
            {name: 'month', value: 'month'},
            {name: 'year', value: 'year'},
        ]
    },
    {
        name: 'type',
        column: 'parent_id',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'parent', value: false},
            {name: 'child', value: true}
        ]
    },
    {
        name: 'recommended',
        column: 'recommended',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'yes', value: true},
            {name: 'no', value: false}
        ]
    },
];
