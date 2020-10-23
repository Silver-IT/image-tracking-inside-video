import {Injectable} from '@angular/core';
import {Object, Group, Line} from 'fabric/fabric-impl';
import {fabric} from 'fabric';
import {CanvasService} from '../../canvas/canvas.service';
import {Subject} from 'rxjs';
import {CanvasStateService} from '../../canvas/canvas-state.service';
import {Settings} from '@common/core/config/settings.service';

@Injectable()
export class CropZoneService {

    /**
     * Main cropzone rect.
     */
    private rect: Object;

    /**
     * Transparent overlay around cropzone.
     */
    private overlay: Group;

    /**
     * Grid lines inside cropzone.
     */
    private grid: Group;

    /**
     * Whether cropzone is initiated already.
     */
    private initiated = false;

    private lastScaleX: number;
    private lastScaleY: number;

    /**
     * Color for grid lines and borders.
     */
    private readonly gridColor = 'rgba(244,244,244,.4)';

    /**
     * Current cropzone aspect ratio.
     */
    public aspectRatio = '16:9';

    /**
     * Fired whenever cropzone size changes.
     */
    public resize$ = new Subject();

    constructor(
        private canvas: CanvasService,
        private canvasState: CanvasStateService,
        private config: Settings,
    ) {}

    public draw() {
        this.drawMainZone(this.aspectRatio);
        this.drawOverlay();
        this.drawGrid();
        this.attachEvents();
        this.canvas.render();
        this.initiated = true;
    }

    /**
     * Remove cropzone from canvas.
     */
    public remove() {
        if ( ! this.initiated) return;

        this.rect.off();
        this.canvas.fabric().discardActiveObject();
        this.canvas.fabric().remove(this.rect, this.grid, this.overlay);
        this.canvas.render();
        this.initiated = false;
    }

    /**
     * Prevent cropzone from going outside canvas edges during dragging.
     */
    private constrainWithinCanvas(object: Object) {
        const x = object.left, y = object.top;
        const w = object.getScaledWidth(), h = object.getScaledHeight();
        const maxX = this.canvasState.original.width - w;
        const maxY = this.canvasState.original.height - h;

        if (x < 0) {
            object.left = 0;
        }
        if (y < 0) {
            object.top = 0;
        }
        if (x > maxX) {
            object.left = maxX;
        }
        if (y > maxY) {
            object.top = maxY;
        }
    }

    /**
     * Prevent cropzone from going outside canvas edges during scaling.
     */
    private constrainWithinCanvasOnScaling(object: Object) {
        const minX = object.left,
            minY = object.top,
            maxX = (minX + object.getScaledWidth()) - 1,
            maxY = (minY + object.getScaledHeight()) - 1;

        if (
            minX < 0 || maxX > this.canvasState.original.width ||
            minY < 0 || maxY > this.canvasState.original.height
        ) {
            object.scaleX = this.lastScaleX || 1;
            object.scaleY = this.lastScaleY || 1;
        }

        if (minX < 0) {
            object.left = 0;
        }

        if (minY < 0) {
            object.top = 0;
        }

        this.lastScaleX = object.scaleX;
        this.lastScaleY = object.scaleY;
    }

    private attachEvents() {
        // redraw cropzone grid and overlay when cropzone is resized
        this.rect.on('moving', () => {
            this.constrainWithinCanvas(this.rect);
            this.drawOverlay();
            this.drawGrid();
            this.resize$.next();
        });

        this.rect.on('scaling', () => {
            this.constrainWithinCanvasOnScaling(this.rect);
            this.drawOverlay();
            this.drawGrid();
            this.resize$.next();
        });
    }

    /**
     * Calculate cropzone size and position based on specified aspect ratio and canvas size.
     */
    public getAdjustedSize(ratioString: string, oldWidth: number, oldHeight: number) {
        let newWidth = oldWidth,
            newHeight = oldHeight;

        // convert ratio string to number
        if (ratioString) {
            const parts = ratioString.split(':');
            const aspectRatio = parseInt(parts[0]) / parseInt(parts[1]);

            // calculate cropzone with and height based on aspect ratio and canvas size
            if (oldHeight * aspectRatio > oldWidth) {
                newHeight = oldWidth / aspectRatio;
            } else {
                newWidth = oldHeight * aspectRatio;
            }
        }

        return {width: newWidth, height: newHeight};
    }

    private drawMainZone(aspectRatio: string) {
        if ( ! this.initiated) {
            const defaultConfig = {
                fill: 'transparent',
                borderColor: this.gridColor,
                hasRotatingPoint: false,
                name: 'crop.zone',
                lockScalingFlip: true,
                minScaleLimit: 0,
                hasControls: !this.config.get('pixie.tools.crop.hideCustomControls'),
            };

            this.rect = new fabric.Rect({...defaultConfig, ...this.config.get('pixie.tools.crop.cropzone', {})});

            // prevent deselection of crop zone
            this.rect.on('deselected', () => {
                this.canvas.fabric().setActiveObject(this.rect);
            });

            this.canvas.fabric().add(this.rect);
            this.rect.moveTo(3);
            this.canvas.fabric().setActiveObject(this.rect);
        }

        const dimensions = this.getAdjustedSize(
            aspectRatio,
            this.canvasState.original.width,
            this.canvasState.original.height,
        );

        this.rect.set({
            width: dimensions.width,
            height: dimensions.height,
            lockUniScaling: !!aspectRatio,
        });

        this.rect.viewportCenter();
        this.rect.setCoords();
    }

    private drawGrid() {
        if ( ! this.initiated) {
            const lineOptions = {stroke: this.gridColor, strokeWidth: 4, selectable: false, evented: false};
            const lines = [
                new fabric.Line([], lineOptions),
                new fabric.Line([], lineOptions),
                new fabric.Line([], lineOptions),
                new fabric.Line([], lineOptions),
            ];

            this.grid = new fabric.Group(lines, {
                name: 'crop.grid',
                selectable: false,
                evented: false,
            });

            this.canvas.fabric().add(this.grid);
            this.grid.moveTo(10);
        }

        // update grid group size and position
        this.grid.width = this.rect.getScaledWidth();
        this.grid.height = this.rect.getScaledHeight();
        this.grid.left = this.rect.left;
        this.grid.top = this.rect.top;

        // cache values needed for grid positioning
        const halfWidth = this.grid.width / 2;
        const thirdWidth = this.grid.width / 3;
        const halfHeight = this.grid.height / 2;
        const thirdHeight = this.grid.height / 3;

        // lines are positioned relative to group center
        // which means some confusing math is needed

        const lines = this.grid.getObjects() as Line[];

        // first vertical
        lines[0].set({
            x1: -(halfWidth - thirdWidth),
            y1: -(halfHeight),
            x2: -(halfWidth - thirdWidth),
            y2: halfHeight,
        });

        // second vertical
        lines[1].set({
            x1: halfWidth - thirdWidth,
            y1: -(halfHeight),
            x2: halfWidth - thirdWidth,
            y2: halfHeight
        });

        // first horizontal
        lines[2].set({
            x1: -(halfWidth),
            y1: -(halfHeight - thirdHeight),
            x2: halfWidth,
            y2: -(halfHeight - thirdHeight)
        });

        // second horizontal
        lines[3].set({
            x1: -(halfWidth),
            y1: halfHeight - thirdHeight,
            x2: halfWidth,
            y2: halfHeight - thirdHeight
        });
    }

    private drawOverlay() {
        if (!this.initiated) {
            const topRect = new fabric.Rect({fill: 'rgba(0,0,0,0.6)', selectable: true, evented: false});
            const rightRect = new fabric.Rect({fill: 'rgba(0,0,0,0.6)', selectable: true, evented: false});
            const bottomRect = new fabric.Rect({fill: 'rgba(0,0,0,0.6)', selectable: true, evented: false});
            const leftRect = new fabric.Rect({fill: 'rgba(0,0,0,0.6)', selectable: true, evented: false});

            this.overlay = new fabric.Group([topRect, rightRect, bottomRect, leftRect], {
                width: this.canvasState.original.width,
                height: this.canvasState.original.height,
                selectable: false,
                evented: false,
                name: 'crop.overlay'
            });
            this.canvas.fabric().add(this.overlay);
            this.overlay.moveTo(1);
        }

        const groupLeftOffset = -(this.overlay.width / 2);
        const groupTopOffset = -(this.overlay.height / 2);
        const rects = this.overlay.getObjects();

        rects[0].set({
            left: groupLeftOffset,
            top: groupTopOffset,
            width: this.overlay.width,
            height: this.rect.getScaledHeight() < 0 ? this.rect.top - Math.abs(this.rect.getScaledHeight()) : this.rect.top,
        });

        rects[1].set({
            left: (this.rect.getScaledWidth() < 0 ? this.rect.left : this.rect.left + this.rect.getScaledWidth()) + groupLeftOffset,
            top: this.rect.top + groupTopOffset,
            width: this.rect.getScaledWidth() < 0 ? this.canvasState.original.width - (this.rect.left + this.rect.getScaledWidth()) - Math.abs(this.rect.getScaledWidth()) : this.canvasState.original.width - (this.rect.left + this.rect.getScaledWidth()),
            height: this.rect.getScaledHeight(),
        });

        rects[2].set({
            left: groupLeftOffset,
            top: (this.rect.getScaledHeight() < 0 ? this.rect.top : this.rect.top + this.rect.getScaledHeight()) + groupTopOffset,
            width: this.canvasState.original.width,
            height: this.rect.getScaledHeight() < 0 ? this.canvasState.original.height - (this.rect.top) : this.canvasState.original.height - (this.rect.top + this.rect.getScaledHeight()),
        });

        rects[3].set({
            left: groupLeftOffset,
            top: this.rect.top + groupTopOffset,
            width: this.rect.getScaledWidth() > 0 ? this.rect.left : this.rect.left - Math.abs(this.rect.getScaledWidth()),
            height: this.rect.getScaledHeight(),
        });
    }

    public changeAspectRatio(ratio: string) {
        this.aspectRatio = ratio;
        this.drawMainZone(ratio);
        this.drawOverlay();
        this.drawGrid();
        this.canvas.render();
    }

    public getSize(): {width: number, height: number, left: number, top: number} {
        return {
            width: this.rect.getScaledWidth(),
            height: this.rect.getScaledHeight(),
            left: this.rect.left,
            top: this.rect.top
        };
    }

    /**
     * Resize cropzone to specified dimensions.
     */
    public resize(width: number, height: number) {
        this.aspectRatio = null;

        this.rect.width = width > this.canvasState.original.width ? this.canvasState.original.width : width;
        this.rect.height = height > this.canvasState.original.height ? this.canvasState.original.height : height;
        this.rect.lockUniScaling = false;
        this.rect.scaleX = 1;
        this.rect.scaleY = 1;
        this.rect.setCoords();

        this.drawOverlay();
        this.drawGrid();

        this.canvas.render();
    }
}
