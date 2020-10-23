import {Injectable} from '@angular/core';
import {HttpCacheClient} from '../../http/http-cache-client';
import {CustomPage} from '../../types/models/CustomPage';
import {BackendResponse} from '../../types/backend-response';
import {PaginatedBackendResponse} from '../../types/pagination/paginated-backend-response';
import {PaginationParams} from '@common/core/types/pagination/pagination-params';

export const CUSTOM_PAGE_URI = 'page';

@Injectable({
    providedIn: 'root',
})
export class Pages {
    constructor(private http: HttpCacheClient) {}

    public getAll(params: PaginationParams = {}): PaginatedBackendResponse<CustomPage> {
        return this.http.getWithCache(`${CUSTOM_PAGE_URI}`, params);
    }

    public get(id: number): BackendResponse<{page: CustomPage}> {
        return this.http.getWithCache(`${CUSTOM_PAGE_URI}/${id}`);
    }

    public create(params: Partial<CustomPage>): BackendResponse<{page: CustomPage}> {
        return this.http.post(`${CUSTOM_PAGE_URI}`, params);
    }

    public update(id: number, params: Partial<CustomPage>): BackendResponse<{page: CustomPage}> {
        return this.http.put(`${CUSTOM_PAGE_URI}/${id}`, params);
    }

    public delete(ids: number[]) {
        return this.http.delete(`${CUSTOM_PAGE_URI}/${ids}`);
    }
}
