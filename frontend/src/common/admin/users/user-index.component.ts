import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CrupdateUserModalComponent} from './crupdate-user-modal/crupdate-user-modal.component';
import {MatSort} from '@angular/material/sort';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Paginator} from '@common/shared/paginator.service';
import {User} from '@common/core/types/models/User';
import {Users} from '@common/auth/users.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Settings} from '@common/core/config/settings.service';
import {Toast} from '@common/core/ui/toast.service';
import {HttpErrors} from '@common/core/http/errors/http-errors.enum';
import {Role} from '@common/core/types/models/Role';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {Permission} from '@common/core/types/models/permission';
import {USER_INDEX_FILTERS} from '@common/admin/users/user-index-filters';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';

@Component({
    selector: 'user-index',
    templateUrl: './user-index.component.html',
    styleUrls: ['./user-index.component.scss'],
    providers: [Paginator],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserIndexComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<User>;

    constructor(
        public paginator: Paginator<User>,
        private userService: Users,
        private modal: Modal,
        public currentUser: CurrentUser,
        public settings: Settings,
        private toast: Toast,
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<User>({
            uri: 'users',
            dataPaginator: this.paginator,
            matSort: this.matSort,
            filters: USER_INDEX_FILTERS,
        });
    }

    ngOnDestroy() {
        this.paginator.destroy();
    }

    public deleteSelectedUsers() {
        const ids = this.dataSource.selectedRows.selected.map(user => user.id);
        this.userService.delete(ids).subscribe(() => {
            this.dataSource.reset();
            this.toast.open('Deleted selected users');
        }, (errResponse: BackendErrorResponse) => {
            this.toast.open(errResponse.message || HttpErrors.Default);
        });
    }

    public makeRolesList(roles: Role[]): string {
        return roles.slice(0, 3).map(role => role.name).join(', ');
    }

    public makePermissionsList(permissions: Permission[]): string {
        return permissions.slice(0, 3).map(p => p.name).join(', ');
    }

    /**
     * Ask user to confirm deletion of selected tags
     * and delete selected tags if user confirms.
     */
    public maybeDeleteSelectedUsers() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Users',
            body:  'Are you sure you want to delete selected users?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedUsers();
        });
    }

    /**
     * Show modal for editing user if user is specified
     * or for creating a new user otherwise.
     */
    public showCrupdateUserModal(user?: User) {
        this.modal.open(
            CrupdateUserModalComponent,
            {user},
            'crupdate-user-modal-container'
        ).beforeClosed().subscribe(data => {
            if ( ! data) return;
            this.dataSource.reset();
        });
    }
}
