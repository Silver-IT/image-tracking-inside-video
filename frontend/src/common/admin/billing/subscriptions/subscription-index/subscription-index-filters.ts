import {DataTableFilter} from '@common/shared/data-table/filter-panel/data-table-filters';

export const SUBSCRIPTION_INDEX_FILTERS: DataTableFilter[] = [
    {
        name: 'status',
        column: 'cancelled',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'active', value: false},
            {name: 'cancelled', value: true},
        ]
    },
    {
        name: 'gateway',
        column: 'gateway',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'paypal', value: 'paypal'},
            {name: 'stripe', value: 'stripe'},
        ]
    },
    {
        name: 'subscribed between',
        column: 'created_at',
        type: 'date',
    },
];
