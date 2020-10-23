import Raven from 'raven-js';
import {Settings} from '../config/settings.service';
import {NoBackendErrorHandler} from './no-backend-error-handler';
import {CurrentUser} from '../../auth/current-user';

export function ravenErrorHandlerFactory(settings: Settings, currentUser: CurrentUser) {
    return new RavenErrorHandler(settings, currentUser);
}

export class RavenErrorHandler extends NoBackendErrorHandler {
    protected dontReport = [
        401, 402, 403, 404, 422
    ];

    constructor(
        protected settings: Settings,
        protected currentUser: CurrentUser
    ) {
        super(settings);
        this.setUserContext();
    }

    public handleError(err: any): void {
        if ( ! err || (err.type === 'http' && this.dontReport.indexOf(err.status) > -1)) {
            return;
        }

        super.handleError(err, {
            extra: {user: this.currentUser.getModel()},
        });
    }

    private setUserContext() {
        if (this.currentUser.isLoggedIn()) {
            Raven.setUserContext({
                id: this.currentUser.get('id'),
                username: this.currentUser.get('display_name'),
                email: this.currentUser.get('email')
            });
        }
    }
}
