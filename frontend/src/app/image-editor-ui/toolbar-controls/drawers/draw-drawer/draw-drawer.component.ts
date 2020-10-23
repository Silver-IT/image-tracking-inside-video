import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {Settings} from '@common/core/config/settings.service';
import {DrawToolService} from '../../../../image-editor/tools/draw/draw-tool.service';
import {CanvasService} from '../../../../image-editor/canvas/canvas.service';
import {Select, Store} from '@ngxs/store';
import {DrawState} from '../../../state/draw/draw.state';
import {Observable, BehaviorSubject} from 'rxjs';
import {CloseBrushControls, MarkAsDirty, OpenBrushControls} from '../../../state/draw/draw.actions';
import {staticObjectConfig} from '../../../../image-editor/objects/static-object-config';
import {ObjectNames} from '../../../../image-editor/objects/object-names.enum';
import {ThemeService} from '@common/core/theme.service';
import {ObjectListService} from '../../../../image-editor/objects/object-list.service';

@Component({
    selector: 'draw-drawer',
    templateUrl: './draw-drawer.component.html',
    styleUrls: ['./draw-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class DrawDrawerComponent implements OnInit, OnDestroy {
    @Select(DrawState.brushControlsOpen) brushControlsOpen$: Observable<boolean>;
    public brushSizes$: BehaviorSubject<number[]> = new BehaviorSubject([]);
    public brushTypes$: BehaviorSubject<string[]> = new BehaviorSubject([]);
    private currentDrawings: string[] = [];

    constructor(
        public drawTool: DrawToolService,
        private settings: Settings,
        private canvas: CanvasService,
        private config: Settings,
        private store: Store,
        private theme: ThemeService,
        private objects: ObjectListService,
    ) {
        this.brushSizes$.next(this.config.get('pixie.tools.draw.brushSizes'));
        this.brushTypes$.next(this.config.get('pixie.tools.draw.brushTypes'));
    }

    ngOnInit() {
        this.drawTool.enable();
        this.canvas.fabric().on('object:added', this.maybeMarkAsDirty.bind(this));
        this.currentDrawings = this.getAllDrawings().map(obj => obj.data.id);
    }

    ngOnDestroy() {
        this.drawTool.disable();
        this.canvas.fabric().off('object:added', this.maybeMarkAsDirty.bind(this));
    }

    public getBrushPreviewUrl(type: string): string {
        const name = type.replace('Brush', '').toLowerCase(),
            dir = this.theme.selectedTheme$.value.is_dark ? 'white' : 'black';
        return this.settings.getAssetUrl(`images/brushes/${dir}/${name}.png`, true);
    }

    public setBrushType(type: string) {
        this.drawTool.setBrushType(type);
        this.store.dispatch(new CloseBrushControls());
    }

    private maybeMarkAsDirty() {
        const lastDrawing = this.getAllDrawings()
            .find(obj => this.currentDrawings.indexOf(obj.data.id) === -1);

        if (lastDrawing) {
            this.store.dispatch(new MarkAsDirty());
            lastDrawing.set({strokeWidth: lastDrawing.strokeWidth});
            this.objects.syncObjects();
            this.canvas.render();
        }
    }

    public openBrushControls() {
        this.store.dispatch(new OpenBrushControls());
    }

    private getAllDrawings() {
        return this.canvas.fabric().getObjects()
            .filter(obj => obj.name === ObjectNames.drawing.name);
    }
}
