import {Injectable} from '@angular/core';
import {CanvasStateService} from './canvas-state.service';

@Injectable()
export class CanvasPanService {
    private lastPosX = 0;
    private lastPosY = 0;
    private lastE: MouseEvent|TouchEvent;
    private isDragging  = false;

    constructor(private state: CanvasStateService) {}

    public set(e?: MouseEvent|TouchEvent) {
        // use last stored event, if no event is given
        // used for re-adjusting pan during zoom
        if ( ! e) e = this.lastE;
        if ( ! e) return;

        const wrapper = this.state.calcWrapperSize();

        const fabricWidth = this.state.fabric.getWidth(),
            fabricHeight = this.state.fabric.getHeight();

        const coords = this.getClientCoords(e);

        let left = this.state.fabric.viewportTransform[4] + coords.clientX - this.lastPosX;
        let top = this.state.fabric.viewportTransform[5] + coords.clientY - this.lastPosY;

        if (left > 0 || wrapper.width > fabricWidth) {
            left = 0;
        } else if (left + Math.floor(fabricWidth) - wrapper.width < 0) {
            left = wrapper.width - Math.floor(fabricWidth);
        }

        if (top > 0 || wrapper.height > fabricHeight) {
            top = 0;
        } else if (top + Math.floor(fabricHeight) - wrapper.height < 0) {
            top = wrapper.height - Math.floor(fabricHeight);
        }

        this.state.fabric.viewportTransform[4] = left;
        this.state.fabric.viewportTransform[5] = top;
        this.state.fabric.requestRenderAll();

        this.lastPosX = coords.clientX;
        this.lastPosY = coords.clientY;
        this.lastE = e;
    }

    /**
     * Reset canvas pan to original state.
     */
    public reset() {
        this.lastPosX = 0;
        this.lastPosY = 0;
        this.lastE = null;
        this.state.fabric.viewportTransform[4] = 0;
        this.state.fabric.viewportTransform[5] = 0;
    }

    public init() {
        this.state.fabric.on('mouse:down', opt => {
            // if object is being dragged or draw mode is enabled, bail
            if (opt.target || this.state.fabric.isDrawingMode) {
                return this.isDragging = false;
            }

            const coords = this.getClientCoords(opt.e);
            this.isDragging = true;
            this.lastPosX = coords.clientX;
            this.lastPosY = coords.clientY;
        });

        this.state.fabric.on('mouse:move', opt => {
            if (this.isDragging) {
                this.set(opt.e);
            }
        });

        this.state.fabric.on('mouse:up', () => {
            this.isDragging = false;
        });
    }

    /**
     * Get client coordinates from touch or mouse event.
     */
    private getClientCoords(e: MouseEvent|TouchEvent) {
        let clientX = 0,
            clientY = 0;

        e = e as TouchEvent;

        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e['clientX'];
            clientY = e['clientY'];
        }

        return {clientX, clientY};
    }
}