import {Injectable} from '@angular/core';
import {AppHttpClient} from '@common/core/http/app-http-client.service';
import {PaginatedBackendResponse} from '@common/core/types/pagination/paginated-backend-response';
import {BackendResponse} from '@common/core/types/backend-response';
import {CustomDomain} from './custom-domain';
import {PaginationParams} from '@common/core/types/pagination/pagination-params';

const BASE_URI = 'custom-domain';

@Injectable({
    providedIn: 'root'
})
export class CustomDomainService {
    constructor(private http: AppHttpClient) {
    }

    public index(params: (PaginationParams & {userId?: number}) = {}): PaginatedBackendResponse<CustomDomain> {
        return this.http.get(`${BASE_URI}`, params);
    }

    public create(params: {host: string}): BackendResponse<{ domain: CustomDomain }> {
        return this.http.post(BASE_URI, params);
    }

    public update(id: number, params: {host?: string, resource_type?: string, resource_id?: number}): BackendResponse<{ domain: CustomDomain }> {
        return this.http.put(`${BASE_URI}/${id}`, params);
    }

    public delete(ids: number[]): BackendResponse<void> {
        return this.http.delete(`${BASE_URI}/${ids}`);
    }

    public validate(host: string): BackendResponse<{result: 'connected'|null}> {
        return this.http.post(`${BASE_URI}/validate/2BrM45vvfS/api`, {host});
    }

    public authorizeCrupdate(params: {host: string, domainId?: number}): BackendResponse<{serverIp: string}> {
        return this.http.post(`${BASE_URI}/authorize/store`, params);
    }
}
