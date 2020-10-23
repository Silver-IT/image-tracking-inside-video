import {ChangeDetectionStrategy, Component} from '@angular/core';
import {startCase} from '@common/core/utils/start-case';
import {Select} from '@ngxs/store';
import {EditorState} from '../../../../image-editor/state/editor-state';
import {Observable} from 'rxjs';
import {DrawerName} from '../../drawers/drawer-name.enum';

@Component({
    selector: 'toolbar-panel-name-widget',
    templateUrl: './toolbar-panel-name-widget.component.html',
    styleUrls: ['./toolbar-panel-name-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarPanelNameWidgetComponent {
    @Select(EditorState.activePanel) activePanel$: Observable<DrawerName>;

    public getToolDisplayName(name: string) {
        return startCase(name);
    }
}
