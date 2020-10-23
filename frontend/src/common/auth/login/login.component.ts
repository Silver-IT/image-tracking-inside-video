import {ChangeDetectionStrategy, Component} from '@angular/core';
import {SocialAuthService} from '../social-auth.service';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {CurrentUser} from '../current-user';
import {Bootstrapper} from '../../core/bootstrapper.service';
import {Settings} from '../../core/config/settings.service';
import {FormBuilder} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {Toast} from '@common/core/ui/toast.service';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';
import {finalize} from 'rxjs/operators';
import {User} from '@common/core/types/models/User';
import {CustomHomepage} from '@common/core/pages/shared/custom-homepage.service';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    public loading$ = new BehaviorSubject<boolean>(false);
    public form = this.fb.group({
        email: [''],
        password: [''],
        remember: [true],
    });

    public errResponse$ = new BehaviorSubject<Partial<User>>({});

    constructor(
        public auth: AuthService,
        public socialAuth: SocialAuthService,
        public settings: Settings,
        private router: Router,
        private user: CurrentUser,
        private bootstrapper: Bootstrapper,
        private fb: FormBuilder,
        private toast: Toast,
        private homepage: CustomHomepage,
    ) {
        this.hydrateModel();
    }

    public login() {
        this.loading$.next(true);
        this.auth.login(this.form.value)
            .subscribe(response => {
                this.bootstrapper.bootstrap(response.data);
                this.homepage.select();
                this.router.navigate([this.auth.getRedirectUri()]).then(() => {
                    this.loading$.next(false);
                });
            }, err => this.handleLoginError(err));
    }

    private hydrateModel() {
        if ( ! this.settings.get('common.site.demo')) return;

        if (this.settings.get('vebto.demo.email')) {
            this.form.patchValue({
                email: this.settings.get('vebto.demo.email'),
                password: this.settings.get('vebto.demo.password'),
            });
        } else {
            // random number between 0 and 100, padded to 3 digits
            let number = '' + Math.floor(Math.random() * 100);
            number = ('0000' + number).substr(-3, 3);

            this.form.patchValue({
                email: 'admin@demo' + number + '.com',
                password: 'admin'
            });
        }
    }

    private handleLoginError(response: BackendErrorResponse) {
        console.log(response);
        this.loading$.next(false);
        if (response.errors.email === 'validation.email_confirmed') {
            this.toast.open('Please confirm your email address.', {action: 'Resend Email', duration: 6000})
                .onAction()
                .subscribe(() => {
                    this.loading$.next(true);
                    this.auth.resendEmailConfirmation(this.form.value.email)
                        .pipe(finalize(() => this.loading$.next(false)))
                        .subscribe(() => {
                            this.toast.open('Confirmation email sent.');
                        });
                });
        } else {
            this.errResponse$.next(response.errors);
        }
    }
}
