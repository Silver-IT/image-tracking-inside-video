import {Injectable} from '@angular/core';
import {HistoryItem} from './history-item.interface';
import {Image} from 'fabric/fabric-impl';
import {CanvasService} from '../canvas/canvas.service';
import {ActiveObjectService} from '../canvas/active-object/active-object.service';
import {ObjectListService} from '../objects/object-list.service';
import {FrameToolService} from '../tools/frame/frame-tool.service';
import {DEFAULT_SERIALIZED_EDITOR_STATE, SerializedCanvas} from './serialized-canvas';
import {TextToolService} from '../tools/text/text-tool.service';
import {GoogleFontsPanelService} from '../../image-editor-ui/toolbar-controls/widgets/google-fonts-panel/google-fonts-panel.service';
import {Actions, Store} from '@ngxs/store';
import {HistoryState} from '../../image-editor-ui/state/history/history.state';
import {
    AddHistoryItem,
    HistoryChanged,
    ReplaceCurrentItem,
    ResetHistory,
    UpdatePointerById
} from '../../image-editor-ui/state/history/history.actions';
import {HistoryNames} from './history-names.enum';
import {staticObjectConfig} from '../objects/static-object-config';
import {filter, skip} from 'rxjs/operators';
import {Settings} from '@common/core/config/settings.service';
import {randomString} from '@common/core/utils/random-string';

@Injectable()
export class HistoryToolService {
    constructor(
        public canvas: CanvasService,
        private activeObject: ActiveObjectService,
        private objects: ObjectListService,
        private frameTool: FrameToolService,
        private googleFonts: GoogleFontsPanelService,
        private textTool: TextToolService,
        private store: Store,
        private actions$: Actions,
        private settings: Settings,
    ) {
        this.canvas.state.contentLoadingState$.pipe(
            filter(s => (s.name === 'mainImage' || s.name === 'blank') && s.loading === false),
        ).subscribe((s) => {
            this.addInitial();
        });
    }

    public undo() {
        if (!this.canUndo()) return;
        return this.load(this.store.selectSnapshot(HistoryState.item('previous')));
    }

    public redo() {
        if (!this.canRedo()) return;
        return this.load(this.store.selectSnapshot(HistoryState.item('next')));
    }

    public canUndo(): boolean {
      return this.store.selectSnapshot(HistoryState.canUndo);
    }

    public canRedo(): boolean {
      return this.store.selectSnapshot(HistoryState.canRedo);
    }

    /**
     * Reload current history state, getting rid of
     * any canvas changes that were not yet applied.
     */
    public reload() {
        return this.load(this.store.selectSnapshot(HistoryState.item('current')));
    }

    /**
     * Replace current history item with current canvas state.
     */
    public replaceCurrent() {
        const current = this.store.selectSnapshot(HistoryState.item('current'));
        this.store.dispatch(new ReplaceCurrentItem(this.createHistoryItem(current.name, current.icon)));
    }

    public add(params: {name: string, icon: string}, json?: SerializedCanvas) {
        this.store.dispatch(new AddHistoryItem(this.createHistoryItem(params.name, params.icon, json)));
    }

    public addFromJson(json: string|SerializedCanvas) {
        const initial = !this.store.selectSnapshot(HistoryState.items).length,
            name = initial ? HistoryNames.INITIAL : HistoryNames.LOADED_STATE;
        this.add(name, typeof json === 'string' ? JSON.parse(json) : json);
        return this.reload();
    }

    public getCurrentCanvasState(customProps: string[] = []): SerializedCanvas {
        customProps = [...Object.keys(staticObjectConfig), 'crossOrigin', 'name', 'displayName', 'data', 'activeFont', ...customProps];
        const canvas = this.canvas.fabric().toJSON(customProps) as any;
        canvas.objects.forEach(obj => {
            if (obj.type === 'image' && this.settings.get('pixie.crossOrigin')) {
                obj.crossOrigin = 'anonymous';
            }
            // text is not selectable/movable when saving
            // state without first moving the text object
            if (obj.type === 'i-text') {
                obj.selectable = true;
                obj.lockMovementX = false;
                obj.lockMovementY = false;
                obj.lockUniScaling = false;
            }
        });
        return {
            canvas: canvas,
            editor: {frame: this.frameTool.getActive(), fonts: this.textTool.getUsedFonts()},
            canvasWidth: this.canvas.state.original.width,
            canvasHeight: this.canvas.state.original.height,
        };
    }

    public clear() {
        this.store.dispatch(new ResetHistory());
    }

    public addInitial() {
        const historyEmpty = !this.store.selectSnapshot(HistoryState.items).length;
        if (historyEmpty) {
            this.add(HistoryNames.INITIAL);
        }
    }

    public load(item: HistoryItem): Promise<any> {
       return new Promise(resolve => {
           this.store.dispatch(new UpdatePointerById(item.id));
           item.editor = item.editor || DEFAULT_SERIALIZED_EDITOR_STATE;
           this.googleFonts.loadIntoDom(item.editor.fonts).then(() => {
               this.canvas.fabric().loadFromJSON(item.canvas || item.state, () => {
                   this.canvas.zoom.set(1);

                   // resize canvas if needed
                   if (item.canvasWidth && item.canvasHeight) {
                       this.canvas.resize(item.canvasWidth, item.canvasHeight);
                   }

                   // init or remove canvas frame
                   if (item.editor.frame) {
                       this.frameTool.add(item.editor.frame.name);
                   } else {
                       this.frameTool.remove();
                   }

                   // prepare fabric.js and canvas
                   this.canvas.render();
                   this.canvas.fabric().calcOffset();
                   this.canvas.zoom.fitToScreen();

                   this.objects.syncObjects();
                   this.store.dispatch(new HistoryChanged());
                   resolve();
               }, obj => {
                   // reapply any filters object used to have
                   if (obj.hasOwnProperty('applyFilters')) {
                       (obj as Image).applyFilters();
                   }
               });
           });
       });
    }

    public getAllItems() {
        return this.store.selectSnapshot(HistoryState.items);
    }

    private createHistoryItem(name: string, icon: string|null = null, state?: SerializedCanvas): HistoryItem {
        if ( ! state) state = this.getCurrentCanvasState();

        return Object.assign(state, {
            name: name,
            id: randomString(15),
            icon: icon,
            zoom: this.canvas.zoom.get(),
            activeObjectId: this.activeObject.getId(),
        });
    }
}
