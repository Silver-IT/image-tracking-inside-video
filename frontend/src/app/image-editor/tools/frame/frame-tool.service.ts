import {Injectable} from '@angular/core';
import {CanvasService} from '../../canvas/canvas.service';
import {Settings} from 'common/core/config/settings.service';
import {FramePatternsService} from './frame-patterns.service';
import {ActiveFrameService} from './active-frame.service';
import {FrameBuilderService} from './frame-builder.service';
import {Frame} from './frame';

@Injectable({
    providedIn: 'root'
})
export class FrameToolService {
    private frames: Frame[] = [];

    constructor(
        private config: Settings,
        private canvas: CanvasService,
        public patterns: FramePatternsService,
        private activeFrame: ActiveFrameService,
        private frameBuilder: FrameBuilderService,
    ) {
        this.config.all$().subscribe(() => {
            this.frames = this.config.get('pixie.tools.frame.items');
        });

        this.canvas.state.loaded.subscribe(() => {
            this.canvas.fabric().on('object:added', () => {
                this.activeFrame.group && this.activeFrame.group.moveTo(98);
            });
        });
    }

    /**
     * Add a new frame to canvas.
     */
    public add(frameName: string) {
        const frame = this.getByName(frameName);
        if (this.activeFrame.is(frame)) return;

        if (this.activeFrame.exists()) {
            this.activeFrame.remove();
        }

        const size = this.calcFrameSize(frame.size.default);
        this.frameBuilder.build(frame, size);
    }

    /**
     * Resize active frame to specified value.
     */
    public resize(value: number) {
        const size = this.calcFrameSize(value);
        this.frameBuilder.resize(size);
        this.patterns.scale(size);
        this.canvas.render();
    }

    /**
     * Change active "basic" frame color.
     */
    public changeColor(value: string) {
        this.activeFrame.changeColor(value);
    }

    public remove() {
        this.activeFrame.remove();
    }

    /**
     * Get frame by specified name.
     */
    public getByName(frameName: string) {
        return this.getAll().find(frame => frame.name === frameName);
    }

    /**
     * Get config of currently active frame.
     */
    public getActive(): Frame|null {
        return this.activeFrame.config;
    }

    public getAll() {
        return this.frames;
    }

    /**
     * Calculate frame size based on canvas size and specified percentage.
     */
    private calcFrameSize(percentage: number) {
        const min = Math.min(this.canvas.state.original.width, this.canvas.state.original.height);
        return ((percentage / 100) * min);
    }
}
