import {Injectable} from '@angular/core';
import {CanvasService} from '../../canvas/canvas.service';
import {MergeToolService} from '../merge/merge-tool.service';
import {CropZoneService} from './crop-zone.service';

@Injectable()
export class CropToolService {
    constructor(
        private canvas: CanvasService,
        private mergeTool: MergeToolService,
        private cropZone: CropZoneService,
    ) {}

    public apply(box: {left: number, top: number, width: number, height: number}): Promise<any> {
        this.cropZone.remove();
        return this.mergeTool.apply().then(() => {
            this.canvas.resize(Math.round(box.width), Math.round(box.height));

            const img = this.canvas.getMainImage();
            img.cropX = Math.round(box.left);
            img.cropY = Math.round(box.top);
            img.width = Math.round(box.width);
            img.height = Math.round(box.height);

            this.canvas.render();
        });
    }
}
