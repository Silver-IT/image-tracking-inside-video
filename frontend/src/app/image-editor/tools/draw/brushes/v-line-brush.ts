import {fabric} from 'fabric';
import {Canvas} from 'fabric/fabric-impl';

export const VLineBrush = (canvas: Canvas) => {
    let vLinePatternBrush = new fabric.PatternBrush(canvas);

    vLinePatternBrush.getPatternSrc = function() {
        let patternCanvas = document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        let ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(10, 5);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };

    return vLinePatternBrush;
};
