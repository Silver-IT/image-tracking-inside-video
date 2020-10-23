import { MatPaginatorIntl } from '@angular/material/paginator';
import {Translations} from '@common/core/translations/translations.service';
import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class DataTableIntlService extends MatPaginatorIntl {
    itemsPerPageLabel = this.i18n.t('Items per page');
    nextPageLabel     = this.i18n.t('Next page');
    previousPageLabel = this.i18n.t('Previous page');

    constructor(protected i18n: Translations) {
        super();
    }

    getRangeLabel = (page: number, pageSize: number, length: number) => {
        const of = this.i18n.t('of');
        if (length == 0 || pageSize == 0) { return `0 ${of} ${length}`; }

        length = Math.max(length, 0);

        const startIndex = page * pageSize;

        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ?
            Math.min(startIndex + pageSize, length) :
            startIndex + pageSize;

        return `${startIndex + 1} - ${endIndex} ${of} ${length}`;
    }
}
