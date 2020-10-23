import {ChangeDetectionStrategy, Component, Input, ViewEncapsulation} from '@angular/core';
import {Settings} from '@common/core/config/settings.service';
import {ThemeService} from '@common/core/theme.service';

@Component({
    selector: 'auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthPageComponent {
    @Input() infoRowTarget: 'signin'|'signup' = 'signup';

    constructor(
        public settings: Settings,
        private theme: ThemeService,
    ) {}

    public logoUrl() {
        return this.settings.get(`branding.logo_${this.theme.isDarkMode() ? 'light' : 'dark'}`);
    }
}
