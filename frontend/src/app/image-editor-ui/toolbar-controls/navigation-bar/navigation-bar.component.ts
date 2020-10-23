import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {EditorControlsService} from '../editor-controls.service';
import {Settings} from 'common/core/config/settings.service';
import {CanvasService} from '../../../image-editor/canvas/canvas.service';
import {NavItem} from '../../../image-editor/default-settings';
import {ExportToolService} from '../../../image-editor/tools/export/export-tool.service';
import {MergeToolService} from '../../../image-editor/tools/merge/merge-tool.service';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {Toast} from 'common/core/ui/toast.service';
import {Actions, ofActionSuccessful, Select, Store} from '@ngxs/store';
import {ObjectsSynced, OpenPanel} from '../../../image-editor/state/editor-state-actions';
import {HistoryNames} from '../../../image-editor/history/history-names.enum';
import {DrawerName} from '../drawers/drawer-name.enum';
import {EditorState} from '../../../image-editor/state/editor-state';
import {Observable} from 'rxjs/internal/Observable';

@Component({
    selector: 'navigation-bar',
    templateUrl: './navigation-bar.component.html',
    styleUrls: ['./navigation-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class NavigationBarComponent implements OnInit {
    @Select(EditorState.navItems) navItems$: Observable<NavItem[]>;

    constructor(
        public controls: EditorControlsService,
        public canvas: CanvasService,
        private saveTool: ExportToolService,
        public config: Settings,
        public mergeTool: MergeToolService,
        private history: HistoryToolService,
        private toast: Toast,
        private store: Store,
        private actions$: Actions,
        private changeDetector: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.actions$
            .pipe(ofActionSuccessful(ObjectsSynced))
            .subscribe(() => {
                this.changeDetector.markForCheck();
            });
    }

    public executeNavItemAction(item: NavItem) {
        if (item.action === 'merge') {
            return this.merge();
        } else if (typeof item.action === 'string') {
            return this.store.dispatch(new OpenPanel(item.action as DrawerName));
        } else if (typeof item.action === 'function') {
            item.action();
        }
    }

    /**
     * Check if specified nav item should be disabled.
     */
    public navItemIsDisabled(item: NavItem): boolean {
        const hasMainImage = !!this.canvas.getMainImage();

        if (item.name === DrawerName.MERGE) {
            return !this.mergeTool.canMerge();
        } else if (item.name === DrawerName.TRANSFORM) {
            return !hasMainImage;
        } else {
            return false;
        }
    }

    private merge() {
        this.mergeTool.apply().then(() => {
            this.history.add(HistoryNames.MERGE);
            this.toast.open('Objects merged.');
        });
    }
}
