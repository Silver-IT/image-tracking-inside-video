import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit
} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {FloatingPanelsService} from '../floating-panels.service';
import {CanvasService} from '../../../image-editor/canvas/canvas.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {EditorState} from '../../../image-editor/state/editor-state';
import {
    ApplyChanges,
    CancelChanges
} from '../../../image-editor/state/editor-state-actions';
import {Select, Store} from '@ngxs/store';
import {DrawerName} from '../drawers/drawer-name.enum';
import {ToolbarItem} from '../../../image-editor/default-settings';
import {EditorMode} from '../../../image-editor/enums/editor-mode.enum';

@Component({
    selector: 'toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit {
    @Select(EditorState.activePanel) activePanel$: Observable<DrawerName>;
    @Select(EditorState.mode) editorMode$: Observable<EditorMode>;
    public toolbarMode$ = new BehaviorSubject<'compact'|'regular'>('regular');

    public items = {
        left: <ToolbarItem[]>[],
        center: <ToolbarItem[]>[],
        right: <ToolbarItem[]>[],
    };

    constructor(
        public config: Settings,
        public breakpoints: BreakpointsService,
        private canvas: CanvasService,
        private floatingPanels: FloatingPanelsService,
        private store: Store,
        private cd: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.config.all$().subscribe(() => {
            Object.keys(this.items).forEach(key => {
                const configItems = this.config.get(`pixie.ui.toolbar.${key}Items`);
                if (this.items[key] !== configItems) {
                    this.items[key] = configItems;
                    this.cd.markForCheck();
                }
            });
        });

        this.breakpoints.observe('(max-width: 920px)')
            .subscribe(result => this.toolbarMode$.next(result.matches ? 'compact' : 'regular'));
    }

    public applyChanges() {
        const panel = this.store.selectSnapshot(EditorState.activePanel);
        this.store.dispatch(new ApplyChanges(panel));
    }

    public cancelChanges() {
        const panel = this.store.selectSnapshot(EditorState.activePanel);
        this.store.dispatch(new CancelChanges(panel));
    }
}
