import { Injectable } from '@angular/core';
import { AppHttpClient } from '../../core/http/app-http-client.service';
import { PaginatedBackendResponse } from '../../core/types/pagination/paginated-backend-response';
import { BackendResponse } from '@common/core/types/backend-response';
import { Plan } from '@common/core/types/models/Plan';
import { PaginationParams } from '@common/core/types/pagination/pagination-params';

export const PLANS_BASE_URI = 'billing-plan';

@Injectable({
    providedIn: 'root'
})
export class Plans {
    constructor(private http: AppHttpClient) {}

    public all(params?: PaginationParams): PaginatedBackendResponse<Plan> {
        return this.http.get(PLANS_BASE_URI, params);
    }

    public get(id: number): BackendResponse<{plan: Plan}> {
        return this.http.get(`${PLANS_BASE_URI}/${id}`);
    }

    public create(params: object): BackendResponse<{plan: Plan}> {
        return this.http.post(PLANS_BASE_URI, params);
    }

    public update(id: number, params: object): BackendResponse<{plan: Plan}> {
        return this.http.put(`${PLANS_BASE_URI}/${id}`, params);
    }

    public delete(params: {ids: number[]}): BackendResponse<void> {
        return this.http.delete(`${PLANS_BASE_URI}/${params.ids}`);
    }

    public sync(): BackendResponse<void> {
        return this.http.post(`${PLANS_BASE_URI}/sync`);
    }
}
