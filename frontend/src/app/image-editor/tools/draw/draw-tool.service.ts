import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {VLineBrush} from './brushes/v-line-brush';
import {HLineBrush} from './brushes/h-line-brush';
import {SquareBrush} from './brushes/square-brush';
import {IEvent} from 'fabric/fabric-impl';
import {CanvasStateService} from '../../canvas/canvas-state.service';
import {BrushSizes} from './draw-defaults';
import {ObjectNames} from '../../objects/object-names.enum';
import {Settings} from '@common/core/config/settings.service';
import {DiamondBrush} from './brushes/diamond-brush';

@Injectable()
export class DrawToolService {
    private enabled = false;

    private customBrushes = {
        VLineBrush: VLineBrush,
        HLineBrush: HLineBrush,
        DiamondBrush: DiamondBrush,
        SquareBrush: SquareBrush,
    };

    public currentBrush = {
        type: 'PencilBrush',
        color: this.config.get('pixie.objectDefaults.global.fill'),
        width: BrushSizes[1],
    };

    constructor(
        private config: Settings,
        private canvasState: CanvasStateService,
    ) {}

    /**
     * Enable drawing mode on canvas.
     */
    public enable() {
        this.canvasState.fabric.isDrawingMode = true;
        this.setBrushType(this.currentBrush.type);
        this.enabled = true;
        this.canvasState.fabric.on('object:added', this.onDrawingAdded);
    }

    /**
     * Disable drawing mode on canvas.
     */
    public disable() {
        this.canvasState.fabric.isDrawingMode = false;
        this.enabled = false;
        this.canvasState.fabric.off('object:added', this.onDrawingAdded);
    }

    /**
     * Get type of current drawing brush.
     */
    public getBrushType(): string {
        return this.currentBrush.type;
    }

    /**
     * Change type of drawing brush.
     */
    public setBrushType(type: string) {
        this.currentBrush.type = type;
        const brush = fabric[type] ?
            new fabric[type](this.canvasState.fabric) :
            this.customBrushes[type](this.canvasState.fabric);
        this.canvasState.fabric.freeDrawingBrush = brush;
        this.applyBrushStyles();
    }

    /**
     * Apply current brush styles to fabric.js FreeDrawingBrush instance.
     */
    private applyBrushStyles() {
        Object.keys(this.currentBrush)
            .forEach(key => {
                this.canvasState.fabric.freeDrawingBrush[key] = this.currentBrush[key];
            });
    }

    /**
     * Change size of drawing brush.
     */
    public setBrushSize(size: number) {
        this.currentBrush.width = size;
        this.applyBrushStyles();
    }

    /**
     * Get size of drawing brush.
     */
    public getBrushSize(): number {
        return this.currentBrush.width;
    }

    /**
     * Change color of drawing brush.
     */
    public setBrushColor(color: string) {
        this.currentBrush.color = color;
        this.applyBrushStyles();
    }

    /**
     * Get color of drawing brush.
     */
    public getBrushColor(): string {
        return this.currentBrush.color;
    }

    /**
     * Added a new to drawing path added by canvas.
     */
    private onDrawingAdded(e: IEvent) {
        if (e.target.type !== 'path' && e.target.type !== 'group') return;
        e.target.name = ObjectNames.drawing.name;
    }
}
