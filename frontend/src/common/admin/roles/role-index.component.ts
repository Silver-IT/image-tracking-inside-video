import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {CurrentUser} from '../../auth/current-user';
import {MatSort} from '@angular/material/sort';
import {User} from '../../core/types/models/User';
import {Role} from '../../core/types/models/Role';
import {RoleService} from './role.service';
import {Toast} from '../../core/ui/toast.service';
import {Modal} from '../../core/ui/dialogs/modal.service';
import {ConfirmModalComponent} from '../../core/ui/confirm-modal/confirm-modal.component';
import {CrupdateRoleModalComponent} from './crupdate-role-modal/crupdate-role-modal.component';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Paginator} from '@common/shared/paginator.service';
import {BehaviorSubject} from 'rxjs';
import {FindUserModalComponent} from '@common/auth/find-user-modal/find-user-modal.component';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';

@Component({
    selector: 'role-index',
    templateUrl: './role-index.component.html',
    styleUrls: ['./role-index.component.scss'],
    providers: [Paginator],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleIndexComponent implements OnInit {
    @ViewChild(MatSort, { static: true }) matSort: MatSort;

    public dataSource: PaginatedDataTableSource<User>;
    public roles$ = new BehaviorSubject<Role[]>([]);
    public selectedRole$ = new BehaviorSubject<Role>(new Role());

    constructor(
        private roleApi: RoleService,
        private toast: Toast,
        private modal: Modal,
        public paginator: Paginator<User>,
        public currentUser: CurrentUser,
        public breakpoints: BreakpointsService,
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<User>({
            uri: 'users',
            dataPaginator: this.paginator,
            matSort: this.matSort,
            delayInit: true,
        });
        this.refreshRoles();
    }

    public selectRole(role: Role) {
        if (this.selectedRole$.value.id !== role.id) {
            this.selectedRole$.next(role);
            this.refreshRoleUsers(role);
            this.dataSource.selectedRows.clear();
        }
    }

    public refreshRoles() {
        return new Promise(resolve => {
            this.roleApi.getRoles().subscribe(response => {
                this.roles$.next(response.pagination.data);
                if (this.roles$.value.length) {
                    // if no role is currently selected, select first
                    if ( ! this.selectedRole$.value.id) {
                        this.selectRole(this.roles$.value[0]);

                    // if role is selected, try to re-select it with the one returned from server
                    } else {
                        const role = this.roles$.value.find(r => r.id === this.selectedRole$.value.id);
                        if (role) {
                            this.selectedRole$.next(role);
                        }
                    }
                }
                resolve();
            });
        });
    }

    public refreshRoleUsers(role: Role) {
        this.dataSource.reload({role_id: role.id});
    }

    public showAssignUsersModal() {
        this.modal.open(FindUserModalComponent)
            .afterClosed()
            .subscribe((user: User) => {
                if (user) {
                    this.roleApi.addUsers(this.selectedRole$.value.id, [user.email]).subscribe(() => {
                        this.toast.open('User assigned to role');
                        this.refreshRoleUsers(this.selectedRole$.value);
                    });
                }
            });
    }

    public showCrupdateRoleModal(role?: Role) {
        this.modal.show(CrupdateRoleModalComponent, {role}).afterClosed().subscribe(data => {
            if ( ! data) return;
            this.refreshRoles();
        });
    }

    public maybeDeleteRole(role: Role) {
        this.modal.open(ConfirmModalComponent, {
            title: 'Delete Role',
            body:  'Are you sure you want to delete this role?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteRole(role);
        });
    }

    public deleteRole(role: Role) {
        this.roleApi.delete(role.id).subscribe(() => {
            this.selectedRole$.next(new Role());
            this.refreshRoles().then(() => {
                this.refreshRoleUsers(this.selectedRole$.value);
            });
        });
    }

    public maybeDetachUsers() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Remove users from role',
            body:  'Are you sure you want to remove selected users from this role?',
            ok:    'Remove'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.removeUsersFromSelectedRole();
        });
    }

    public removeUsersFromSelectedRole() {
        const ids = this.dataSource.selectedRows.selected.map(user => user.id);
        this.roleApi.removeUsers(this.selectedRole$.value.id, ids).subscribe(() => {
            this.refreshRoleUsers(this.selectedRole$.value);
            this.dataSource.selectedRows.clear();
            this.toast.open('Users removed from role.');
        });
    }

    public canAssignUsers() {
        return this.selectedRole$.value.id && !this.dataSource.selectedRows.hasValue() && !this.selectedRole$.value.guests;
    }
}
