import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {CrupdatePlanModalComponent} from '../crupdate-plan-modal/crupdate-plan-modal.component';
import {finalize} from 'rxjs/operators';
import {Plans, PLANS_BASE_URI} from '@common/shared/billing/plans.service';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Toast} from '@common/core/ui/toast.service';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {Paginator} from '@common/shared/paginator.service';
import {Plan} from '@common/core/types/models/Plan';
import {PLAN_INDEX_FILTERS} from '@common/admin/billing/plans/plan-index/plan-index-filters';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'plan-index',
    templateUrl: './plan-index.component.html',
    styleUrls: ['./plan-index.component.scss'],
    providers: [Paginator, Plans],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanIndexComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) matPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<Plan>;
    public loading$ = new BehaviorSubject<boolean>(false);

    constructor(
        public paginator: Paginator<Plan>,
        private plans: Plans,
        private modal: Modal,
        public currentUser: CurrentUser,
        private toast: Toast,
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<Plan>({
            uri: PLANS_BASE_URI,
            dataPaginator: this.paginator,
            matPaginator: this.matPaginator,
            matSort: this.matSort,
            filters: PLAN_INDEX_FILTERS,
        });
    }

    public maybeDeleteSelectedPlans() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Plans',
            body:  'Are you sure you want to delete selected plans?',
            ok:    'Delete'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.deleteSelectedPlans();
        });
    }

    public deleteSelectedPlans() {
        this.loading$.next(true);
        const ids = this.dataSource.selectedRows.selected.map(plan => plan.id);
        this.plans.delete({ids})
            .pipe(finalize(() => {
                this.loading$.next(false);
                this.dataSource.reset();
            }))
            .subscribe();
    }

    public showCrupdatePlanModal(plan?: Plan) {
        this.modal.open(
            CrupdatePlanModalComponent,
            {plan, plans: this.dataSource.data},
            'crupdate-plan-modal-container',
        )
        .afterClosed()
        .subscribe(data => {
            if ( ! data) return;
            this.dataSource.reset();
        });
    }

    public syncPlans() {
        this.loading$.next(true);
        this.plans.sync()
            .pipe(finalize(() => this.loading$.next(false)))
            .subscribe(() => {
                this.toast.open('Synced plans across all enabled payment gateways');
            });
    }
}
