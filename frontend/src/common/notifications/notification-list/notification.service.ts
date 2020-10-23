import {Injectable} from '@angular/core';
import {AppHttpClient} from '@common/core/http/app-http-client.service';
import {BackendResponse} from '@common/core/types/backend-response';
import {PaginationParams} from '@common/core/types/pagination/pagination-params';
import {PaginatedBackendResponse} from '@common/core/types/pagination/paginated-backend-response';
import {BehaviorSubject} from 'rxjs';
import {filter, finalize, take, tap} from 'rxjs/operators';
import {CurrentUser} from '@common/auth/current-user';
import {DatabaseNotification} from '@common/notifications/database-notification';
import {PaginationResponse} from '@common/core/types/pagination/pagination-response';

const BASE_URI = 'notifications';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    public all$ = new BehaviorSubject<DatabaseNotification[]>(null);
    public loading$ = new BehaviorSubject(false);
    public canLoadMore = new BehaviorSubject(false);
    public unreadCount$ = new BehaviorSubject(null);

    constructor(
        private http: AppHttpClient,
        private currentUser: CurrentUser
    ) {
        this.currentUser.model$
            .pipe(filter(user => !!user && user.unread_notifications_count !== null), take(1))
            .subscribe(user => {
                this.unreadCount$.next(user.unread_notifications_count);
            });
    }

    public markAsRead(ids: string[]): BackendResponse<{unreadCount: number, date: string}> {
        return this.http.post<any>(`${BASE_URI}/mark-as-read`, {ids})
            .pipe(tap(response => {
                this.unreadCount$.next(this.unreadCount$.value - ids.length || 0);

                // mark individual notifications as read
                if (this.all$.value) {
                    this.all$.next(this.all$.value.map(notification => {
                        if (ids.includes(notification.id)) {
                            notification.read_at = response.date;
                        }
                        return notification;
                    }));
                }
            }));
    }

    public markAllAsRead() {
        const ids = this.all$.value.map(n => n.id);
        return this.markAsRead(ids);
    }

    public load(params: PaginationParams & {userId?: number} = {}): PaginatedBackendResponse<DatabaseNotification> {
        this.loading$.next(true);
        return this.http.get<{pagination: PaginationResponse<DatabaseNotification>}>(BASE_URI, params)
            .pipe(
                finalize(() => this.loading$.next(false)),
                tap(response => {
                    if (response.pagination.current_page === 1) {
                        this.all$.next(response.pagination.data);
                        this.canLoadMore.next(response.pagination.current_page < response.pagination.last_page);
                    }
                }),
            );
    }

    public add(notification: DatabaseNotification) {
        this.unreadCount$.next(this.unreadCount$.value + 1);
        if (this.all$.value) {
            this.all$.next([notification, ...this.all$.value]);
        }
    }
}
