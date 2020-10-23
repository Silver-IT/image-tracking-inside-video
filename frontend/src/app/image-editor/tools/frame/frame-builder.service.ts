import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {staticObjectConfig} from '../../objects/static-object-config';
import {ActiveFrameService} from './active-frame.service';
import {CanvasService} from '../../canvas/canvas.service';
import {Settings} from 'common/core/config/settings.service';
import {FramePatternsService} from './frame-patterns.service';
import {Frame} from './frame';

interface FrameRect {
    top?: number;
    left?: number;
    width?: number;
    height?: number;
    fill?: string;
}

@Injectable()
export class FrameBuilderService {
    constructor(
        private config: Settings,
        private activeFrame: ActiveFrameService,
        private canvas: CanvasService,
        private patterns: FramePatternsService,
    ) {}

    /**
     * Build a new canvas frame group.
     */
    public build(frame: Frame, size: number) {
        this.createGroup(frame);
        this.createParts(frame);
        this.resize(size);
        this.activeFrame.config = frame;
        this.canvas.fabric().add(this.activeFrame.group);

        // basic frame has no pattern fill
        if (frame.mode === 'basic') {
            return this.canvas.render();
        }

        this.patterns.load(frame).then(() => {
            this.patterns.scale(size);
            this.canvas.render();
        });
    }

    /**
     * Create group for frame objects.
     */
    private createGroup(frame: Frame) {
        this.activeFrame.group = new fabric.Group([], Object.assign({
            name: 'frame.group',
            excludeFromExport: true,
            width: this.canvas.state.original.width,
            height: this.canvas.state.original.height,
            data: {frameName: frame.name}
        }, staticObjectConfig));
    }

    /**
     * Create rect object for each frame part.
     */
    private createParts(frame: Frame) {
        this.activeFrame.getPartNames().forEach(part => {
            const fill = frame.mode === 'basic' ? this.config.get('pixie.objectDefaults.global.fill') : null;
            this.activeFrame[part] = new fabric.Rect({...staticObjectConfig, fill, name: 'frame.rect.' + part});
            this.activeFrame.group.add(this.activeFrame[part]);
        });
    }

    /**
     * Position and resize all frame parts.
     */
    public resize(value: number) {
        const fullWidth = this.canvas.state.original.width,
            fullHeight = this.canvas.state.original.height,
            frame = this.activeFrame,
            cornerSize = value;

        this.positionPart('topLeft', {
            width: cornerSize, height: cornerSize,
        });

        this.positionPart('topRight', {
            left: fullWidth - frame.topLeft.getScaledWidth(),
            width: cornerSize, height: cornerSize,
        });

        this.positionPart('top', {
            left: frame.topLeft.getScaledWidth() - 2,
            width: fullWidth - frame.topLeft.getScaledWidth() - frame.topRight.getScaledWidth() + 4,
            height: cornerSize,
        });

        this.positionPart('bottomLeft', {
            top: fullHeight - frame.topLeft.getScaledHeight(),
            width: cornerSize, height: cornerSize,
        });

        this.positionPart('left', {
            top: frame.topLeft.getScaledHeight() - 2,
            width: cornerSize,
            height: fullHeight - frame.topLeft.getScaledHeight() - frame.bottomLeft.getScaledHeight() + 4,
        });

        this.positionPart('bottomRight', {
            left: fullWidth - frame.bottomLeft.getScaledWidth(),
            top: fullHeight - frame.topRight.getScaledWidth(),
            width: cornerSize,
            height: cornerSize,
        });

        this.positionPart('bottom', {
            left: frame.bottomLeft.getScaledWidth() - 2,
            top: fullHeight - frame.top.getScaledHeight(),
            width: frame.top.getScaledWidth() + 4,
            height: cornerSize,
        });

        this.positionPart('right', {
            left: fullWidth - frame.left.getScaledWidth(),
            top: frame.topRight.getScaledHeight() - 2,
            width: frame.left.width,
            height: fullHeight - frame.topRight.getScaledHeight() - frame.bottomRight.getScaledHeight() + 4,
        });
    }

    /**
     * Position specified frame part within canvas group.
     */
    private positionPart(part: string, rect: FrameRect) {
        // make sure we're positioning from top left corner instead of center
        rect.top = -(this.activeFrame.group.height / 2) + (rect.top || 0);
        rect.left = -(this.activeFrame.group.width / 2) + (rect.left || 0);
        this.activeFrame[part].set(rect);
    }
}
