import {fabric} from 'fabric';
import {Canvas} from 'fabric/fabric-impl';

export const HLineBrush = (canvas: Canvas) => {
    let hLinePatternBrush = new fabric.PatternBrush(canvas);

    hLinePatternBrush.getPatternSrc = function() {
        let patternCanvas = document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        let ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };

    return hLinePatternBrush;
};