import {Injectable} from '@angular/core';
import {ActiveObjectService} from '../../canvas/active-object/active-object.service';
import {CanvasService} from '../../canvas/canvas.service';
import {ExportToolService} from '../export/export-tool.service';
import {ObjectListService} from '../../objects/object-list.service';
import {ActiveFrameService} from '../frame/active-frame.service';
import {ObjectNames} from '../../objects/object-names.enum';

@Injectable()
export class MergeToolService {
    constructor(
        private activeObject: ActiveObjectService,
        private canvas: CanvasService,
        private saveTool: ExportToolService,
        private objects: ObjectListService,
        private activeFrame: ActiveFrameService,
    ) {}

    public canMerge(): boolean {
        return this.objects.getAll()
            .filter(obj => obj.name !== ObjectNames.mainImage.name)
            .length > 0;
    }

    public apply(): Promise<any> {
        this.canvas.state.contentLoadingState$.next({name: 'merge', loading: true});
        const data = this.saveTool.getDataUrl();
        this.clearCanvas();
        return this.canvas.loadMainImage(data, false, 'merge');
    }

    private clearCanvas() {
        this.activeFrame.remove();
        this.canvas.fabric().clear();
    }
}
