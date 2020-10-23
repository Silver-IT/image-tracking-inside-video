import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {FileEntry} from './types/file-entry';
import {UploadedFile} from './uploaded-file';
import {makeUploadPayload} from '../core/utils/make-upload-payload';
import {AppHttpClient} from '../core/http/app-http-client.service';
import {transformAngularUploadEvent, UploadEvent} from '@common/uploads/utils/upload-progress-event';
import {map} from 'rxjs/operators';
import {HttpEvent} from '@angular/common/http';
import {ChunkedUploadService} from '@common/uploads/chunked/chunked-upload.service';
import {Settings} from '@common/core/config/settings.service';
import {UploadApiConfig} from '@common/uploads/types/upload-api-config';

export interface UploadFileResponse {
    status?: string;
    fileEntry: FileEntry;
    queueItemId?: string;
}

@Injectable({
    providedIn: 'root',
})
export class UploadsApiService {
    constructor(
        private http: AppHttpClient,
        private chunkedUpload: ChunkedUploadService,
        private settings: Settings,
    ) {}

    public getFileContents(file: FileEntry): Observable<string> {
        return this.http.get('uploads/' + file.id, null, {responseType: 'text'});
    }

    public delete(params: {entryIds?: number[], paths?: string[], deleteForever: boolean}) {
        return this.http.delete('uploads', params);
    }

    public upload(file: UploadedFile, config: UploadApiConfig = {}): Observable<UploadEvent> {
        if (file.relativePath) {
            config.httpParams.relativePath = file.relativePath;
        }
        if (this.settings.get('uploads.chunk') && file.size > this.chunkedUpload.sliceSize) {
            return this.chunkedUpload.start(file, config.httpParams);
        } else {
            const now = Date.now();
            return this.http.postWithProgress(
                config.uri || 'uploads',
                makeUploadPayload(file.native, config.httpParams),
            ).pipe(map((e: HttpEvent<UploadFileResponse>) => transformAngularUploadEvent(e, now)));
        }
    }
}
