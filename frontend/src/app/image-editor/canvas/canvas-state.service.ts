import {fabric} from 'fabric';
import {ReplaySubject} from 'rxjs';
import {Settings} from 'common/core/config/settings.service';
import {Injectable} from '@angular/core';

export enum ContentLoadingStateDisplayName {
    blank = 'Loading Canvas',
    overlayImage = 'Loading Image',
    mainImage = 'Loading Image',
    state = 'Loading State',
    merge = 'Processing Image'
}

export type ContentLoadingStateName = 'blank'|'overlayImage'|'mainImage'|'state'|'merge';

export interface ContentLoadingState {
    name: ContentLoadingStateName;
    loading: boolean;
}

@Injectable()
export class CanvasStateService {
    public original: {
        width: number;
        height: number;
    } = {width: 0, height: 0};

    /**
     * Fired when canvas and fabric.js are fully loaded and ready for interaction.
     */
    public loaded = new ReplaySubject(1);

    /**
     * Canvas wrapper el, centers the canvas vertically and horizontally.
     */
    public wrapperEl: HTMLElement;

    /**
     * Inner canvas wrapper el, same size as canvas itself.
     */
    public maskWrapperEl: HTMLElement;

    public fabric: fabric.Canvas;

    public contentLoadingState$ = new ReplaySubject<ContentLoadingState>(1);

    constructor(private config: Settings) {}

    /**
     * Check if nothing to open was specified via config.
     */
    public isEmpty(): boolean {
        return !this.config.get('pixie.image') &&
            !this.config.get('pixie.blankCanvasSize') &&
            (!this.fabric || this.fabric.getObjects().length === 0);
    }

    /**
     * Calculate canvas wrapper size including margins.
     */
    public calcWrapperSize() {
        const rect = this.wrapperEl.getBoundingClientRect();
        return {width: rect.width, height: rect.height};
    }
}
