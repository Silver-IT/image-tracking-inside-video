import {Injectable} from '@angular/core';
import {Group, Rect} from 'fabric/fabric-impl';
import {Frame} from './frame';
import {CanvasService} from '../../canvas/canvas.service';

@Injectable()
export class ActiveFrameService {

    /**
     * List of frame corner names.
     */
    public readonly corners = [
        'topLeft', 'topRight', 'bottomLeft', 'bottomRight'
    ];

    /**
     * List of frame side names.
     */
    public readonly sides = [
        'top', 'right', 'bottom', 'left'
    ];

    public group: Group;
    topLeft: Rect;
    top: Rect;
    topRight: Rect;
    right: Rect;
    bottomRight: Rect;
    bottom: Rect;
    bottomLeft: Rect;
    left: Rect;

    /**
     * Configuration for currently active frame.
     */
    public config: Frame;

    constructor(
        private canvas: CanvasService
    ) {}

    public getPartNames() {
        return this.corners.concat(this.sides);
    }

    /**
     * Check if frame is added to canvas.
     */
    public exists(): boolean {
        return this.config != null;
    }

    /**
     * Remove currently active frame.
     */
    public remove() {
        if ( ! this.exists()) return;

        this.canvas.fabric().remove(this.group);

        // delete all fabric object references
        this.group.off();
        this.group = null;
        this.config = null;
        this.getPartNames().forEach(part => {
            this[part] = null;
        });
        this.canvas.render();
    }

    /**
     * Check if specified frame is active.
     */
    public is(frame: Frame): boolean {
        if ( ! this.config) return false;
        return this.config.name === frame.name;
    }

    /**
     * Change color of basic frame.
     */
    public changeColor(value: string) {
        if (this.config.mode !== 'basic') return;

        this.getPartNames().forEach(part => {
            this[part].set('fill', value);
        });

        this.canvas.render();
    }

    /**
     * Check if current frame is "basic".
     */
    public isBasic() {
        return this.config && this.config.mode === 'basic';
    }

    public getMinSize() {
        if ( ! this.exists()) return;
        return this.config.size.min || 1;
    }

    public getMaxSize() {
        if ( ! this.exists()) return;
        return this.config.size.max || 35;
    }

    public getDefaultSize() {
        if ( ! this.exists()) return;
        return this.config.size.default || 15;
    }
}
