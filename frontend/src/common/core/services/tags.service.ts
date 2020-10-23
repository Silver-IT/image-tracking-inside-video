import {Injectable} from '@angular/core';
import {AppHttpClient} from '../../core/http/app-http-client.service';
import {PaginatedBackendResponse} from '../../core/types/pagination/paginated-backend-response';
import {Tag} from '@common/core/types/models/Tag';
import {BackendResponse} from '@common/core/types/backend-response';

export const TAGS_BASE_URI = 'tags';

@Injectable({
    providedIn: 'root'
})
export class TagsService {
    constructor(private http: AppHttpClient) {
    }

    public index(params?: object): PaginatedBackendResponse<Tag> {
        return this.http.get(TAGS_BASE_URI, params);
    }

    public create(params: Partial<Tag>): BackendResponse<{tag: Tag}> {
        return this.http.post(TAGS_BASE_URI, params);
    }

    public update(id: number, params: Partial<Tag>): BackendResponse<{tag: Tag}> {
        return this.http.put(`${TAGS_BASE_URI}/${id}`, params);
    }

    public delete(tagIds: number[]): BackendResponse<void> {
        return this.http.delete(`${TAGS_BASE_URI}/${tagIds}`);
    }

}
