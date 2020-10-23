import {Permission} from '@common/core/types/models/permission';

export class Plan {
    id: number;
    name: string;
    amount: number;
    currency: string;
    currency_symbol = '$';
    interval: 'day'|'week'|'month'|'year' = 'month';
    interval_count = 1;
    parent_id: number = null;
    parent?: Plan;
    permissions: Permission[];
    recommended = false;
    show_permissions = false;
    free = false;
    hidden = false;
    position = 0;
    features: string[] = [];
    available_space: number;

    constructor(params: Object = {}) {
        for (const name in params) {
            this[name] = params[name];
        }
    }
}
