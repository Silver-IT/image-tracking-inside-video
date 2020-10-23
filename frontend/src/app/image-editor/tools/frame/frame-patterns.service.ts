import {fabric} from 'fabric';
import {IImageOptions, Image as IImage, IObjectOptions} from 'fabric/fabric-impl';
import {Settings} from 'common/core/config/settings.service';
import {Injectable} from '@angular/core';
import {ActiveFrameService} from './active-frame.service';
import {CanvasService} from '../../canvas/canvas.service';
import {Frame} from './frame';
import {staticObjectConfig} from '../../objects/static-object-config';

@Injectable()
export class FramePatternsService {

    public patternCache: {name: string, img: IImage}[];

    constructor(
        private config: Settings,
        private activeFrame: ActiveFrameService,
        private canvas: CanvasService,
    ) {}

    /**
     * Fill frame part objects with matching pattern images.
     */
    private fillParts(mode: 'stretch'|'repeat'|'basic') {
        this.patternCache.forEach(part => {
            this.fillPartWithPattern(part, mode);
        });
    }

    /**
     * Fill specified frame part with matching pattern.
     */
    private fillPartWithPattern(part: {name: string, img: IImage}, mode: 'stretch'|'repeat'|'basic') {
        const patternSourceCanvas = new fabric.StaticCanvas();
        patternSourceCanvas.add(part.img);

        const pattern = new fabric.Pattern({
            source: () => {
                const width = part.img.getScaledWidth(),
                    height = part.img.getScaledHeight();

                if (width > 1 && height > 1) {
                    patternSourceCanvas.setDimensions({width, height});
                    patternSourceCanvas.renderAll();
                }

                return patternSourceCanvas.getElement();
            },
            repeat: mode === 'repeat' ? 'repeat' : 'no-repeat'
        });

        if (this.activeFrame[part.name]) {
            this.activeFrame[part.name].set('fill', pattern);
        }
    }

    /**
     * Scale all frame patterns to fill their container rect objects.
     */
    public scale(value: number) {
        const mode = this.activeFrame.config.mode;

        if ( ! this.patternCache) return;

        value = value / this.canvas.fabric().getRetinaScaling();

        this.patternCache.forEach(part => {
            // scale or repeat top and bottom sides
            if (part.name === 'top' || part.name === 'bottom') {
                if (mode === 'stretch') {
                    this.scalePatternToWidth(part.img, this.canvas.state.original.width - (value * 2) + 4); // minus width of left and right corners
                    this.scalePatternToHeight(part.img, value);
                } else {
                    part.img.scaleToHeight(value);
                }
            }

            // scale or repeat left and right sides
            else if (part.name === 'left' || part.name === 'right') {
                if (mode === 'stretch') {
                    this.scalePatternToWidth(part.img, value);
                    this.scalePatternToHeight(part.img, this.canvas.state.original.height - (value * 2) + 4); // minus width of left and right corners
                } else {
                    part.img.scaleToWidth(value);
                }
            }

            // scale corners
            else {
                part.img.scaleToWidth(value);
            }
        });
    }

    /**
     * Scale pattern image to specified width.
     */
    private scalePatternToWidth(pattern: IImage, value: number) {
        const boundingRectFactor = pattern.getBoundingRect().width / pattern.getScaledWidth();
        pattern.set('scaleX', value / pattern.width / boundingRectFactor);
        pattern.setCoords();
    }

    /**
     * Scale pattern image to specified height.
     */
    private scalePatternToHeight(pattern: IImage, value: number) {
        const boundingRectFactor = pattern.getBoundingRect().height / pattern.getScaledHeight();
        pattern.set('scaleY', value / pattern.height / boundingRectFactor);
        pattern.setCoords();
    }

    /**
     * Load all images needed to build specified frame.
     */
    public load(frame: Frame) {
        const promises = this.activeFrame.getPartNames().map(part => {
           return new Promise(resolve => {
               const config = {...staticObjectConfig} as any;
               if (this.config.get('pixie.crossOrigin')) {
                   config.crossOrigin = 'anonymous';
               }
               fabric.Image.fromURL(this.getPartUrl(frame, part), img => {
                   resolve({name: part, img});
               }, config);
           });
        });

        return Promise.all(promises).then(images => {
            this.patternCache = images as any;
            this.fillParts(frame.mode);
        });
    }

    private getPartUrl(frame: Frame, part: string): string {
        return this.getBaseUrl(frame) + '/' + part + '.png';
    }

    public getBaseUrl(frame: Frame): string {
        return this.config.getAssetUrl('images/frames/' + frame.name, true);
    }
}
