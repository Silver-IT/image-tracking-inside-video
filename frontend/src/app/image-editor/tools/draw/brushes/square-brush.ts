import {fabric} from 'fabric';
import {Canvas} from 'fabric/fabric-impl';

export const SquareBrush = (canvas: Canvas) => {
    let squareBrush = new fabric.PatternBrush(canvas);

    squareBrush.getPatternSrc = function() {
        let squareWidth = 10, squareDistance = 2;

        let patternCanvas = document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
        let ctx = patternCanvas.getContext('2d');

        ctx.fillStyle = this.color;
        ctx.fillRect(0, 0, squareWidth, squareWidth);

        return patternCanvas;
    };

    return squareBrush;
};