import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {AppHttpClient} from '../../core/http/app-http-client.service';
import {PaginationResponse} from '../../core/types/pagination/pagination-response';
import {User} from '../../core/types/models/User';
import {Subscription} from '@common/shared/billing/models/subscription';
import {Plan} from '@common/core/types/models/Plan';
import {BackendResponse} from '@common/core/types/backend-response';

export interface CreateSubOnStripeResponse {
    status: 'complete'|'requires_action';
    user?: User;
    payment_intent_secret: string|undefined;
    reference: string;
    end_date: string;
}

@Injectable({
    providedIn: 'root'
})
export class Subscriptions {

    /**
     * Subscriptions constructor.
     */
    constructor(private http: AppHttpClient) {}

    /**
     * Get all available subscriptions.
     */
    public all(params?: object): Observable<PaginationResponse<Subscription>> {
        return this.http.get('billing/subscriptions', params);
    }

    /**
     * Get subscription matching specified id.
     */
    public get(id: number): Observable<{subscription: Subscription}> {
        return this.http.get('billing/subscriptions/' + id);
    }

    /**
     * Create a new subscription on stripe.
     */
    public createOnStripe(params: {plan_id: number, start_date?: string}): Observable<CreateSubOnStripeResponse> {
        return this.http.post('billing/subscriptions/stripe', params);
    }

    /**
     * Update subscription matching specified id.
     */
    public update(id: number, params: object): Observable<{subscription: Subscription}> {
        return this.http.put('billing/subscriptions/' + id, params);
    }

    /**
     * Create a new subscription.
     */
    public create(params: object): Observable<{subscription: Subscription}> {
        return this.http.post('billing/subscriptions', params);
    }

    /**
     * Cancel subscription matching specified id.
     */
    public cancel(id: number, params: {delete: boolean}): Observable<{user: User}> {
        return this.http.delete('billing/subscriptions/' + id, params);
    }

    public resume(id: number): Observable<{subscription: Subscription}> {
        return this.http.post('billing/subscriptions/' + id + '/resume');
    }

    public changePlan(id: number, plan: Plan): Observable<{user: User}|{links: {approve: string}}> {
        return this.http.post('billing/subscriptions/' + id + '/change-plan', {newPlanId: plan.id});
    }

    public addCard(token: string): Observable<{user: User}> {
        return this.http.post('billing/stripe/cards/add', {token});
    }

    public finalizeOnStripe(reference: string, userId: number): BackendResponse<CreateSubOnStripeResponse> {
        return this.http.post('billing/subscriptions/stripe/finalize', {reference, userId});
    }
}
