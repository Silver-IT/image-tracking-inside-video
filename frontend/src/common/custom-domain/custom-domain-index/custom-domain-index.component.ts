import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Paginator} from '@common/shared/paginator.service';
import { MatSort } from '@angular/material/sort';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Settings} from '@common/core/config/settings.service';
import {Toast} from '@common/core/ui/toast.service';
import {getFaviconFromUrl} from '@common/core/utils/get-favicon-from-url';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {HttpErrors} from '@common/core/http/errors/http-errors.enum';
import {CustomDomain} from '../custom-domain';
import {CrupdateCustomDomainModalComponent} from '../crupdate-custom-domain-modal/crupdate-custom-domain-modal.component';
import {CustomDomainService} from '../custom-domain.service';
import {Router} from '@angular/router';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';

@Component({
    selector: 'custom-domain-index',
    templateUrl: './custom-domain-index.component.html',
    styleUrls: ['./custom-domain-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [Paginator],
})
export class CustomDomainIndexComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<CustomDomain>;

    constructor(
        public paginator: Paginator<CustomDomain>,
        private domains: CustomDomainService,
        private modal: Modal,
        public currentUser: CurrentUser,
        public settings: Settings,
        private toast: Toast,
        private router: Router,
    ) {}

    ngOnInit() {
        // filter link overlays by current user ID if we are not in admin
        const staticParams = !this.insideAdmin() ?
            {userId: this.currentUser.get('id')} :
            {};
        this.dataSource = new PaginatedDataTableSource<CustomDomain>({
            uri: 'custom-domain',
            dataPaginator: this.paginator,
            matSort: this.matSort,
            staticParams,
        });
    }

    ngOnDestroy() {
        this.paginator.destroy();
    }

    public maybeDeleteSelectedDomains() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Domains',
            body:  'Are you sure you want to delete selected domains?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedDomains();
        });
    }

    public deleteSelectedDomains() {
        const ids = this.dataSource.selectedRows.selected.map(d => d.id);
        this.domains.delete(ids).subscribe(() => {
            this.dataSource.reset();
            this.toast.open('Custom domains deleted');
        }, (errResponse: BackendErrorResponse) => {
            this.toast.open(errResponse.message || HttpErrors.Default);
        });
    }

    public showCrupdateCustomDomainModal(domain?: CustomDomain) {
        this.modal.open(
            CrupdateCustomDomainModalComponent,
            {domain},
            'crupdate-custom-domain-modal-container'
        ).beforeClosed().subscribe(data => {
            if ( ! data) return;
            this.dataSource.reset();
        });
    }

    public favicon(url: string) {
        return getFaviconFromUrl('https://' + url);
    }

    public insideAdmin(): boolean {
        return this.router.url.indexOf('admin') > -1;
    }
}
