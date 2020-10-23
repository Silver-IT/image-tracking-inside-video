import {Injectable} from '@angular/core';
import {CanvasService} from '../../canvas/canvas.service';
import {Object} from 'fabric/fabric-impl';

@Injectable()
export class TransformToolService {

    /**
     * TransformToolService Constructor.
     */
    constructor(private canvas: CanvasService) {}

    /**
     * Rotate or skew the canvas. When type is basic, angle should be in 90 degree intervals.
     */
    public rotate(type: 'basic'|'skew', angle: number, direction?: 'left'|'right') {
        if (type === 'basic') {
            this.rotateFixed(angle);
        } else {
            this.rotateFree(angle, direction);
        }
    }

    /**
     * Flip canvas vertically or horizontally.
     */
    public flip(direction: 'horizontal'|'vertical') {
        const prop = direction === 'horizontal' ? 'flipY' : 'flipX';

        this.canvas.fabric().forEachObject(obj => {
            obj[prop] = !obj[prop];
        });

        this.canvas.render();
    }

    /**
     * Rotate properly by scaling canvas to new height after rotating main image by 90 degrees
     */
    private rotateFixed(originalAngle: number) {
        this.canvas.zoom.set(1);

        const angle = (this.canvas.getMainImage().angle + originalAngle) % 360;

        const height = Math.abs(this.canvas.getMainImage().width*(Math.sin(angle*Math.PI/180)))+Math.abs(this.canvas.getMainImage().height*(Math.cos(angle*Math.PI/180))),
            width = Math.abs(this.canvas.getMainImage().height*(Math.sin(angle*Math.PI/180)))+Math.abs(this.canvas.getMainImage().width*(Math.cos(angle*Math.PI/180)));

        this.canvas.resize(width, height);
        this.canvas.getMainImage().viewportCenter();

        this.canvas.fabric().forEachObject(obj => {
            obj.rotate((obj.angle + originalAngle) % 360);
            obj.setCoords();
        });

        this.canvas.render();
        this.canvas.zoom.fitToScreen();
    }

    /**
     * Rotate objects of canvas while leaving canvas width/height intact.
     */
    private rotateFree(angle: number, direction: 'left'|'right') {
        if (angle > 360 || angle < 0) return;
        let resetOrigin = false;

        this.canvas.fabric().forEachObject(obj => {
            if (direction && direction === 'left') {
                angle = obj.angle - 90;
            } else if (direction && direction === 'right') {
                angle = obj.angle + 90;
            }

            if ((obj.originX !== 'center' || obj.originY !== 'center') && obj.centeredRotation) {
                this.setOriginToCenter(obj);
                resetOrigin = true;
            }

            angle = angle > 360 ? 90 : angle < 0 ? 270 : angle;

            obj.angle = angle;
            obj.setCoords();

            if (resetOrigin) {
                this.setCenterToOrigin(obj);
            }
        });

        this.canvas.render();
    };

    private setOriginToCenter(obj: Object) {
        obj['_originalOriginX'] = obj.originX;
        obj['_originalOriginY'] = obj.originY;

        const center = obj.getCenterPoint();

        obj.set({
            originX: 'center',
            originY: 'center',
            left: center.x,
            top: center.y
        });
    };

    private setCenterToOrigin(obj: Object) {
        const originPoint = obj.translateToOriginPoint(
            obj.getCenterPoint(),
            obj['_originalOriginX'],
            obj['_originalOriginY']
        );

        obj.set({
            originX: obj['_originalOriginX'],
            originY: obj['_originalOriginY'],
            left: originPoint.x,
            top: originPoint.y
        });
    };

}
