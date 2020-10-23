import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {HistoryToolService} from '../../../image-editor/history/history-tool.service';
import {HistoryItem} from '../../../image-editor/history/history-item.interface';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {Select} from '@ngxs/store';
import {HistoryState} from '../../state/history/history.state';
import {Observable} from 'rxjs';
import {matDialogAnimations} from '@angular/material/dialog';

@Component({
    selector: 'history-panel',
    templateUrl: './history-panel.component.html',
    styleUrls: ['./history-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[@dialogContainer]': `'enter'`,
        '[class.floating-panel]': 'true',
    },
    animations: [
        matDialogAnimations.dialogContainer,
    ]
})
export class HistoryPanelComponent {
    @Select(HistoryState.items) items$: Observable<HistoryItem[]>;
    @Select(HistoryState.activeItemId) activeItemId$: Observable<string>;

    constructor(
        public history: HistoryToolService,
        public panelRef: OverlayPanelRef,
    ) {}

    public loadHistoryState(item: HistoryItem) {
        return this.history.load(item);
    }
}
