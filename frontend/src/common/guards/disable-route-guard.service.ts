import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Settings } from '../core/config/settings.service';

@Injectable({
    providedIn: 'root',
})
export class DisableRouteGuard implements CanActivate {

    constructor(private settings: Settings, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.settings.get('registration.disable')) {
            return true;
        }

        this.router.navigate(['/login']);

        return false;
    }
}
