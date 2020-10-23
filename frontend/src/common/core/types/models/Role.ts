import { User } from './User';
import {Permission} from '@common/core/types/models/permission';

export class Role {
    id: number;
    name: string;
    permissions?: Permission[];
    default: boolean;
    guests: boolean;
    created_at?: string;
    updated_at?: string;
    users?: User[];

    constructor(params: Object = {}) {
        for (const name in params) {
            this[name] = params[name];
        }
    }
}
