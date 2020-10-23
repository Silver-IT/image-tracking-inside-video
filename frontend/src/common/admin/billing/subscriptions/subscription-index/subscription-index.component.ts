import {ChangeDetectionStrategy, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {finalize} from 'rxjs/operators';
import {CrupdateSubscriptionModalComponent} from '../crupdate-subscription-modal/crupdate-subscription-modal.component';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {Subscription} from '@common/shared/billing/models/subscription';
import {Subscriptions} from '@common/shared/billing/subscriptions.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {CurrentUser} from '@common/auth/current-user';
import {Toast} from '@common/core/ui/toast.service';
import {ConfirmModalComponent} from '@common/core/ui/confirm-modal/confirm-modal.component';
import {Paginator} from '@common/shared/paginator.service';
import {SUBSCRIPTION_INDEX_FILTERS} from '@common/admin/billing/subscriptions/subscription-index/subscription-index-filters';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'subscription-index',
    templateUrl: './subscription-index.component.html',
    styleUrls: ['./subscription-index.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionIndexComponent implements OnInit {
    @ViewChild(MatPaginator, { static: true }) matPaginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) matSort: MatSort;
    public dataSource: PaginatedDataTableSource<Subscription>;
    public loading$ = new BehaviorSubject<boolean>(false);

    constructor(
        public paginator: Paginator<Subscription>,
        private subscriptions: Subscriptions,
        private modal: Modal,
        public currentUser: CurrentUser,
        private toast: Toast,
    ) {}

    ngOnInit() {
        this.dataSource = new PaginatedDataTableSource<Subscription>({
            uri: 'billing/subscriptions',
            dataPaginator: this.paginator,
            matPaginator: this.matPaginator,
            matSort: this.matSort,
            filters: SUBSCRIPTION_INDEX_FILTERS,
        });
    }

    public maybeCancelSubscription(subscription: Subscription) {
        this.modal.open(ConfirmModalComponent, {
            title: 'Cancel Subscription',
            body: 'Are you sure you want to cancel this subscription?',
            bodyBold: 'This will cancel or suspend subscription based on its gateway and put user on grace period until their next scheduled renewal date and allow them to renew the subscription.',
            ok: 'Cancel',
            cancel: 'Go Back'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.cancelOrDeleteSubscription(subscription, {delete: false});
        });
    }

    public maybeDeleteSubscription(subscription: Subscription) {
        this.modal.open(ConfirmModalComponent, {
            title: 'Delete Subscription',
            body: 'Are you sure you want to delete this subscription?',
            bodyBold: 'This will permanently delete user subscription and immediately cancel it on billing gateway.',
            ok: 'Delete',
            cancel: 'Go Back'
        }).afterClosed().subscribe(confirmed => {
            if ( ! confirmed) return;
            this.cancelOrDeleteSubscription(subscription, {delete: true});
        });
    }

    private cancelOrDeleteSubscription(subscription: Subscription, params: {delete?: boolean} = {}) {
        this.loading$.next(true);

        this.subscriptions.cancel(subscription.id, {delete: params.delete})
            .pipe(finalize(() => this.loading$.next(false)))
            .subscribe(() => {
                this.dataSource.reset();
                this.toast.open('Subscription cancelled.');
            });
    }

    public openCrupdateSubscriptionModal(subscription?: Subscription) {
        this.modal.open(CrupdateSubscriptionModalComponent, {subscription})
            .afterClosed()
            .subscribe(newSubscription => {
                if ( ! newSubscription) return;
                this.dataSource.reset();
            });
    }
}
