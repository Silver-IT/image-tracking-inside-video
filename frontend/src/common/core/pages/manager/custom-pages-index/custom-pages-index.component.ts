import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MatSort} from '@angular/material/sort';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Paginator} from '@common/shared/paginator.service';
import {CustomPage} from '@common/core/types/models/CustomPage';
import {CUSTOM_PAGE_URI, Pages} from '@common/core/pages/shared/pages.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Settings} from '@common/core/config/settings.service';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {CUSTOM_PAGE_CONFIG_TOKEN, CustomPageManagerConfig} from '@common/core/pages/manager/custom-page-config';
import {Router} from '@angular/router';

@Component({
    selector: 'custom-pages-index',
    templateUrl: './custom-pages-index.component.html',
    styleUrls: ['./custom-pages-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [Paginator],
})
export class CustomPagesIndexComponent implements OnInit {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<CustomPage>;

    constructor(
        public paginator: Paginator<CustomPage>,
        private pages: Pages,
        private modal: Modal,
        public currentUser: CurrentUser,
        private settings: Settings,
        private router: Router,
        @Inject(CUSTOM_PAGE_CONFIG_TOKEN) public config: CustomPageManagerConfig[],
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<CustomPage>({
            uri: CUSTOM_PAGE_URI,
            dataPaginator: this.paginator,
            matSort: this.matSort,
            staticParams: {
                type: this.config[0].type,
                userId: this.filterByUserId() ? this.currentUser.get('id') : null,
            }
        });
    }

    public maybeDeleteSelectedPages() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Pages',
            body:  'Are you sure you want to delete selected pages?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedPages();
        });
    }

    public deleteSelectedPages() {
        const ids = this.dataSource.getSelectedItems();
        this.pages.delete(ids).subscribe(() => {
            this.dataSource.reset();
        });
    }

    public getPageUrl(page: CustomPage): string {
        return this.settings.getBaseUrl() + 'pages/' + page.id + '/' + page.slug;
    }

    public insideAdmin(): boolean {
        return this.router.url.indexOf('admin') > -1;
    }

    public viewName(name: string) {
        return name.replace(/_/g, ' ');
    }

    public filterByUserId(): boolean {
        return this.config[0].filterByUserId;
    }
}
