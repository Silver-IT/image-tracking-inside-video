import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {CanvasService} from '../../canvas/canvas.service';
import {BasicShape} from './default-shapes';
import {StickerCategory} from './default-stickers';
import {Settings} from '@common/core/config/settings.service';
import {Object as FObject} from 'fabric/fabric-impl';
import {ObjectNames} from '../../objects/object-names.enum';

@Injectable()
export class ShapesToolService {
    constructor(
        private canvas: CanvasService,
        private config: Settings
    ) {}

    public getShapeByName(name: string): BasicShape|null {
        return this.config.get('pixie.tools.shapes.items').find(shape => {
            return shape.name === name;
        });
    }

    public addBasicShape(shape: string|BasicShape) {
        if (typeof shape === 'string') {
            shape = this.getShapeByName(shape);
        }

        const basicShape = shape as BasicShape;

        const canvasWidth = this.canvas.fabric().getWidth(),
            options = {...this.config.get('pixie.objectDefaults.basicShape'), ...basicShape.options},
            size = canvasWidth / 2;

        if (basicShape.name === 'circle') {
            options.radius = size;
        } else if (basicShape.name === 'ellipse') {
            options.rx = size;
            options.ry = size / 2;
        } else {
            options.width = size;
            options.height = size;
        }

        let fabricShape: FObject;

        if (basicShape.type === 'Path') {
            fabricShape = new fabric[basicShape.type](options.path, {displayName: basicShape.name, ...options});
        } else {
            fabricShape = new fabric[basicShape.type](options);
        }

        this.addAndPositionSticker(fabricShape);
    }

    public addSticker(categoryName: string, name: number|string): Promise<any> {
        const category = (this.config.get('pixie.tools.stickers.items') as StickerCategory[])
            .find(cat => cat.name === categoryName);
        if (category.type === 'svg') {
            const url = this.getStickerUrl(category, name);
            return this.addSvgSticker(url);
        } else {
            return this.addRegularSticker(category, name);
        }
    }

    private addRegularSticker(category: StickerCategory, name: number|string): Promise<void> {
        return new Promise(resolve => {
            fabric.util.loadImage(this.getStickerUrl(category, name), img => {
                const sticker = new fabric.Image(img);
                this.addAndPositionSticker(sticker, ObjectNames.sticker);
                resolve();
            });
        });
    }

    public addSvgSticker(url: string, objectName: {name: string} = ObjectNames.sticker, fitToScreen = true): Promise<void> {
        return new Promise(resolve => {
            fabric.loadSVGFromURL(url, (objects, options) => {
                const sticker = fabric.util.groupSVGElements(objects, options);
                this.addAndPositionSticker(sticker, objectName, fitToScreen);
                resolve();
            });
        });
    }

    private addAndPositionSticker(sticker: FObject, objectName: {name: string} = ObjectNames.shape, fitToScreen = true) {
        sticker.name = objectName.name;
        sticker.set(this.config.get('pixie.objectDefaults.sticker'));
        this.canvas.fabric().add(sticker);
        this.canvas.fabric().setActiveObject(sticker);
        if (fitToScreen) {
            sticker.scaleToWidth(this.canvas.fabric().getWidth() / 4);
        }
        sticker.viewportCenter();
        sticker.setCoords();
        this.canvas.render();
    }

    public getStickerUrl(category: StickerCategory, stickerName: number|string): string {
        const stickerUri = 'images/stickers/' + category.name + '/' + stickerName + '.' + category.type;
        return this.config.getAssetUrl(stickerUri, true);
    }

    public getStickerCategoryUrl(category: StickerCategory) {
        if (category.thumbnailUrl) return this.config.getAssetUrl(category.thumbnailUrl, true);
        return this.getStickerUrl(category, 1);

    }
}
