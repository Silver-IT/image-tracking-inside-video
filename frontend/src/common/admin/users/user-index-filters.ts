import {DataTableFilter} from '@common/shared/data-table/filter-panel/data-table-filters';

export const USER_INDEX_FILTERS: DataTableFilter[] = [
    {
        name: 'subscribed',
        column: 'subscribed',
        condition: 'billing.enable',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'subscribed', value: true},
            {name: 'not subscribed', value: false},
        ]
    },
    {
        name: 'status',
        column: 'email_verified_at',
        type: 'select',
        options: [
            {name: 'any'},
            {name: 'email confirmed', value: true},
            {name: 'email not confirmed', value: false},
        ]
    },
    {
        name: 'created between',
        column: 'created_at',
        type: 'date',
    },
];
