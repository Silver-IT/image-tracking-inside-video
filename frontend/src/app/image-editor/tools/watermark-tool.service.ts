import {Injectable} from '@angular/core';
import {CanvasService} from '../canvas/canvas.service';
import {fabric} from 'fabric';
import {staticObjectConfig} from '../objects/static-object-config';
import {Group} from 'fabric/fabric-impl';
import {CanvasStateService} from '../canvas/canvas-state.service';

@Injectable()
export class WatermarkToolService {

    /**
     * Watermark group.
     */
    private watermark: Group;

    /**
     * Default styles for watermark lines.
     */
    private lineStyle = {
        stroke: 'rgba(255,255,255,0.3)',
        strokeWidth: 5,
        strokeLineCap: 'round',
        strokeLineJoin: 'round'
    };

    /**
     * WatermarkToolService Constructor.
     */
    constructor(
        private canvas: CanvasService,
        private canvasState: CanvasStateService,
    ) {}

    /**
     * Add a watermark to canvas.
     */
    public add(watermarkText: string) {
        this.createGroup();
        this.addText(watermarkText);
        this.addLines();

        this.canvas.fabric().add(this.watermark);
        this.canvas.render();
    }

    /**
     * Remove watermark from canvas.
     */
    public remove() {
        if ( ! this.watermark) return;
        this.canvas.fabric().remove(this.watermark);
        this.watermark = null;
        this.canvas.render();
    }

    /**
     * Create watermark group.
     */
    private createGroup() {
        this.watermark = new fabric.Group(null,
            Object.assign({}, staticObjectConfig, {
                width: this.canvasState.original.width,
                height: this.canvasState.original.height,
                excludeFromExport: true,
                top: 0,
                left: 0,
            })
        );
    }

    /**
     * Add watermark text object.
     */
    private addText(watermarkText: string) {
        const text = new fabric.Text(watermarkText, {
            fill: 'rgba(255,255,255,0.3)',
            strokeWidth: 2,
            stroke: 'rgba(255,255,255,0.4)',
            originX: 'center',
            originY: 'center',
            fontWeight: 600,
            fontSize: 150,
            fontFamily: 'Courier New',
        });


        text.scaleToWidth(this.canvasState.original.width / 2);
        this.watermark.add(text);
    }

    /**
     * Add watermark lines to group.
     */
    private addLines() {
        const text = this.watermark.getObjects('text')[0];

        // original canvas size
        const halfWidth = this.canvasState.original.width / 2,
            halfHeight = this.canvasState.original.height / 2;

        // offset from text for watermark lines
        const offsetY = 100,
            offsetX = text.width / 4;

        const line1 = new fabric.Line(null, this.lineStyle),
            line2 = new fabric.Line(null, this.lineStyle),
            line3 = new fabric.Line(null, this.lineStyle),
            line4 = new fabric.Line(null, this.lineStyle);

        this.watermark.add(line1, line2, line3, line4);

        line1.set({
            x1: offsetX,
            y1: -offsetY,
            x2: halfWidth,
            y2: -halfHeight,
        });

        line2.set({
            x1: offsetX,
            y1: offsetY,
            x2: halfWidth,
            y2: halfHeight,
        });

        line3.set({
            x1: -offsetX,
            y1: -offsetY,
            x2: -halfWidth,
            y2: -halfHeight,
        });

        line4.set({
            x1: -offsetX,
            y1: offsetY,
            x2: -halfWidth,
            y2: halfHeight,
        });
    }
}
