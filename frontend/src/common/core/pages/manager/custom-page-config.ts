import {InjectionToken} from '@angular/core';

export interface CustomPageManagerConfig {
    resourceName: string;
    type: string;
    showSlug: boolean;
    filterByUserId?: boolean;
}

export const CUSTOM_PAGE_CONFIG_TOKEN = new InjectionToken<CustomPageManagerConfig[]>('CUSTOM_PAGE_CONFIG_TOKEN');
