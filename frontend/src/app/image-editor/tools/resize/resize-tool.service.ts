import {Injectable} from '@angular/core';
import {CanvasService} from '../../canvas/canvas.service';

@Injectable()
export class ResizeToolService {

    constructor(private canvas: CanvasService) {}

    /**
     * Resize image and other canvas objects. If percentages is false, width/height should be pixels, otherwise it should be percentages.
     */
    public apply(width: number, height: number, percentages: boolean = false) {
        const currentWidth  = Math.ceil(this.canvas.state.original.width),
            currentHeight = Math.ceil(this.canvas.state.original.height),
            newWidth      = Math.ceil(width),
            newHeight     = Math.ceil(height);
        let widthScale, heightScale;

        if (percentages) {
            widthScale    = width / 100;
            heightScale   = height / 100;
        } else {
            widthScale    = width / this.canvas.state.original.width;
            heightScale   = height / this.canvas.state.original.height;
        }

        if (currentWidth === newWidth && currentHeight === newHeight) return;

        this.resize(widthScale, heightScale);
    }

    /**
     * Resize canvas and all objects to specified scale.
     */
    private resize(widthScale: number, heightScale: number) {
        this.canvas.zoom.set(100, false);

        const newHeight = Math.round(this.canvas.state.original.height * heightScale),
            newWidth  = Math.round(this.canvas.state.original.width * widthScale);

        this.canvas.fabric().setHeight(newHeight);
        this.canvas.fabric().setWidth(newWidth);
        this.canvas.state.original.width = newWidth;
        this.canvas.state.original.height = newHeight;

        this.canvas.fabric().getObjects().forEach(object => {
            const scaleX = object.scaleX;
            const scaleY = object.scaleY;
            const left = object.left;
            const top = object.top;

            const tempScaleX = scaleX * widthScale;
            const tempScaleY = scaleY * heightScale;
            const tempLeft = left * widthScale;
            const tempTop = top * heightScale;

            object.scaleX = tempScaleX;
            object.scaleY = tempScaleY;
            object.left = tempLeft;
            object.top = tempTop;

            object.setCoords();
        });

        this.canvas.zoom.fitToScreen();
        this.canvas.render();
    }
}
