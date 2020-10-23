import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {Modal} from '../../core/ui/dialogs/modal.service';
import {ConfirmModalComponent} from '../../core/ui/confirm-modal/confirm-modal.component';
import {Settings} from '../../core/config/settings.service';
import {FileEntry} from '../../uploads/types/file-entry';
import {CurrentUser} from '../../auth/current-user';
import {UploadsApiService} from '../../uploads/uploads-api.service';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Paginator} from '@common/shared/paginator.service';
import {FILE_ENTRY_INDEX_FILTERS} from '@common/admin/file-entry-index/file-entry-index-filters';

@Component({
    selector: 'file-entry-index',
    templateUrl: './file-entry-index.component.html',
    styleUrls: ['./file-entry-index.component.scss'],
    providers: [Paginator],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileEntryIndexComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;

    public dataSource: PaginatedDataTableSource<FileEntry>;

    constructor(
        public paginator: Paginator<FileEntry>,
        public currentUser: CurrentUser,
        public settings: Settings,
        private uploads: UploadsApiService,
        private modal: Modal,
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<FileEntry>({
            uri: 'uploads',
            dataPaginator: this.paginator,
            matSort: this.matSort,
            filters: FILE_ENTRY_INDEX_FILTERS,
        });
    }

    ngOnDestroy() {
        this.paginator.destroy();
    }

    /**
     * Delete currently selected entries.
     */
    public deleteSelectedEntries() {
        const entryIds = this.dataSource.getSelectedItems();
        this.uploads.delete({entryIds, deleteForever: true}).subscribe(() => {
            this.dataSource.reset();
        });
    }

    /**
     * Ask entry to confirm deletion of selected tags
     * and delete selected tags if entry confirms.
     */
    public maybeDeleteSelectedEntries() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Entries',
            body:  'Are you sure you want to delete selected entries?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedEntries();
        });
    }
}
