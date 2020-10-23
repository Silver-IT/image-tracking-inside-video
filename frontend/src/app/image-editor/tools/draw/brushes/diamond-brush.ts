import {fabric} from 'fabric';
import {Canvas} from 'fabric/fabric-impl';

export const DiamondBrush = (canvas: Canvas) => {
    const diamondBrush = new fabric.PatternBrush(canvas);

    diamondBrush.getPatternSrc = function() {
        let squareWidth = 10, squareDistance = 5;
        let patternCanvas = document.createElement('canvas');

        let rect = new fabric.Rect({
            width: squareWidth,
            height: squareWidth,
            angle: 45,
            fill: this.color
        });

        const canvasWidth = rect.getBoundingRect().width;

        patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
        rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

        let ctx = patternCanvas.getContext('2d');
        rect.render(ctx);

        return patternCanvas;
    };

    return diamondBrush;
};
