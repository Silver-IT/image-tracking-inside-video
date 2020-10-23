import {ChangeDetectionStrategy, Component} from '@angular/core';
import {Select} from '@ngxs/store';
import {HistoryState} from '../../../state/history/history.state';
import {Observable} from 'rxjs';
import {HistoryToolService} from '../../../../image-editor/history/history-tool.service';
import {Settings} from '@common/core/config/settings.service';

@Component({
    selector: 'toolbar-undo-widget',
    templateUrl: './toolbar-undo-widget.component.html',
    styleUrls: ['./toolbar-undo-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarUndoWidgetComponent {
    @Select(HistoryState.canUndo) canUndo$: Observable<boolean>;
    @Select(HistoryState.canRedo) canRedo$: Observable<boolean>;

    constructor(
        public history: HistoryToolService,
        public config: Settings
    ) {}
}
