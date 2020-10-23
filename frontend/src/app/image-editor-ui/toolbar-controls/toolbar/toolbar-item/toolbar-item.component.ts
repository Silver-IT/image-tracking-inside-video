import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit
} from '@angular/core';
import {Settings} from '@common/core/config/settings.service';
import {ToolbarItem, ToolbarItemAction} from '../../../../image-editor/default-settings';
import {Store} from '@ngxs/store';
import {EditorMode} from '../../../../image-editor/enums/editor-mode.enum';
import {HistoryNames} from '../../../../image-editor/history/history-names.enum';
import {CloseEditor} from '../../../../image-editor/state/editor-state-actions';
import {HistoryToolService} from '../../../../image-editor/history/history-tool.service';
import {CanvasZoomService} from '../../../../image-editor/canvas/canvas-zoom.service';
import {FloatingPanelsService} from '../../floating-panels.service';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {ImportToolService} from '../../../../image-editor/tools/import/import-tool.service';
import {ExportToolService} from '../../../../image-editor/tools/export/export-tool.service';
import {CanvasService} from '../../../../image-editor/canvas/canvas.service';

@Component({
    selector: 'toolbar-item',
    templateUrl: './toolbar-item.component.html',
    styleUrls: ['./toolbar-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarItemComponent implements OnChanges {
    @Input() item: ToolbarItem;
    @Input() toolbarMode: 'compact'|'regular';
    @Input() editorMode: EditorMode;
    public shouldRenderItem: boolean;
    public isDropdownButton: boolean;

    constructor(
        public history: HistoryToolService,
        public config: Settings,
        public zoom: CanvasZoomService,
        public panels: FloatingPanelsService,
        public breakpoints: BreakpointsService,
        private importTool: ImportToolService,
        private exportTool: ExportToolService,
        private canvas: CanvasService,
        private store: Store,
        private el: ElementRef<HTMLElement>,
    ) {}

    ngOnChanges() {
        this.shouldRenderItem = this.shouldRender();
        this.isDropdownButton = Array.isArray(this.item.action);
        if (this.shouldRenderItem ) {
            if (this.item.marginLeft) {
                this.el.nativeElement.style.marginLeft = this.item.marginLeft;
            }
            if (this.item.marginRight) {
                this.el.nativeElement.style.marginRight = this.item.marginRight;
            }
        }
    }

    public executeOpenButtonAction(action: ToolbarItemAction) {
        if (typeof action === 'function') {
            action();
        } else if (typeof action === 'string') {
            this[action]();
        }
    }

    public exportImage() {
        if (this.config.get('pixie.ui.showExportPanel')) {
            this.panels.openExportPanel();
        } else {
            this.exportTool.export();
        }
    }

    public openBackgroundImage() {
        this.importTool.openUploadDialog({type: 'image', openAsBackground: true}).then(() => {
            this.history.add(HistoryNames.BG_IMAGE);
        });
    }

    public openOverlayImage() {
        this.importTool.openUploadDialog().then(obj => {
            if ( !obj) return;
            this.canvas.fabric().setActiveObject(obj);
            this.history.add(HistoryNames.OVERLAY_IMAGE);
        });
    }

    public openStateFile() {
        return this.importTool.openUploadDialog({type: 'state'});
    }

    public closeEditor() {
        this.store.dispatch(new CloseEditor());
    }

    public toggleObjects() {
        this.panels.toggleObjects();
    }

    public toggleHistory() {
        this.panels.toggleHistory();
    }

    private shouldRender(): boolean {
        if (this.toolbarMode === 'compact' && (!this.item.showInCompactMode && !this.item.compactModeOnly)) {
            return false;
        }
        if (this.item.compactModeOnly && this.toolbarMode !== 'compact') {
            return false;
        }
        if (!this.item?.condition) {
            return true;
        }
        const key = Object.keys(this.item.condition)[0],
            value = this.item.condition[key];
        return this.config.get(`pixie.${key}`) === value;
    }
}
