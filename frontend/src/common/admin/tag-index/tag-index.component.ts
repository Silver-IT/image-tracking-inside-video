import {Component, OnInit, ViewChild} from '@angular/core';
import {CrupdateTagModalComponent} from './crupdate-tag-modal/crupdate-tag-modal.component';
import {MatSort} from '@angular/material/sort';
import {Paginator} from '@common/shared/paginator.service';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Tag} from '@common/core/types/models/Tag';
import {TagsService} from '@common/core/services/tags.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {DataTableFilter} from '@common/shared/data-table/filter-panel/data-table-filters';
import {Settings} from '@common/core/config/settings.service';

@Component({
    selector: 'tags',
    templateUrl: './tag-index.component.html',
    providers: [Paginator]
})
export class TagIndexComponent implements OnInit {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<Tag>;

    constructor(
        private tags: TagsService,
        public paginator: Paginator<Tag>,
        private modal: Modal,
        public currentUser: CurrentUser,
        private settings: Settings,
    ) { }

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<Tag>({
            uri: 'tags',
            dataPaginator: this.paginator,
            matSort: this.matSort,
            filters: this.getFilters(),
        });
    }

    public deleteSelectedTags() {
        this.tags.delete(this.dataSource.getSelectedItems()).subscribe(() => {
            this.dataSource.reset();
        });
    }

    public maybeDeleteSelectedTags() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Tags',
            body:  'Are you sure you want to delete selected tags?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedTags();
        });
    }

    public showCrupdateTagModal(tag?: Tag) {
        this.modal.show(CrupdateTagModalComponent, {tag})
            .afterClosed().subscribe(newTag => {
                if ( ! newTag) return;
                this.dataSource.reset();
            });
    }

    private getFilters(): DataTableFilter[] {
        const types = this.settings.get('vebto.admin.tagTypes');
        if (types) {
            return [
                {
                    name: 'type',
                    column: 'type',
                    type: 'select',
                    options: [
                        {name: 'any'},
                        ...types.map(t => {
                            return {name: t.name};
                        }),
                    ]
                }
            ];
        }
    }
}
