import {Actions, NgxsOnInit, Selector, State, StateContext, Store} from '@ngxs/store';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {CloseForePanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {BaseToolState} from '../base-tool.state';
import {DrawerName} from '../../toolbar-controls/drawers/drawer-name.enum';
import {CropToolService} from '../../../image-editor/tools/crop/crop-tool.service';
import {CropZoneService} from '../../../image-editor/tools/crop/crop-zone.service';
import {CanvasZoomService} from '../../../image-editor/canvas/canvas-zoom.service';
import {Injectable} from '@angular/core';

interface CropStateModel {
    dirty: boolean;
}

const CROP_STATE_DEFAULTS: CropStateModel = {
    dirty: true,
};

@State<CropStateModel>({
    name: 'crop',
    defaults: CROP_STATE_DEFAULTS
})
@Injectable()
export class CropState extends BaseToolState<CropStateModel> implements NgxsOnInit {
    protected toolName = DrawerName.CROP;

    @Selector()
    static dirty(state: CropStateModel) {
        return state.dirty;
    }

    constructor(
        protected store: Store,
        protected history: HistoryToolService,
        protected actions$: Actions,
        protected cropTool: CropToolService,
        protected cropZone: CropZoneService,
        protected zoom: CanvasZoomService,
    ) {
        super();
    }

    applyChanges(ctx: StateContext<CropStateModel>) {
        this.store.dispatch(new CloseForePanel());
        this.cropTool.apply(this.cropZone.getSize()).then(() => {
            this.history.add(HistoryNames.CROP);
            ctx.patchState(CROP_STATE_DEFAULTS);
        });
    }

   cancelChanges(ctx: StateContext<CropStateModel>) {
       this.store.dispatch(new CloseForePanel());
       ctx.patchState(CROP_STATE_DEFAULTS);
   }

    resetState(ctx: StateContext<CropStateModel>) {
        ctx.setState(CROP_STATE_DEFAULTS);
    }
}
