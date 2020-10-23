import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CanvasZoomService} from '../../../../image-editor/canvas/canvas-zoom.service';
import {Settings} from '@common/core/config/settings.service';
import {Select} from '@ngxs/store';
import {EditorState} from '../../../../image-editor/state/editor-state';
import {Observable} from 'rxjs';

@Component({
    selector: 'toolbar-zoom-widget',
    templateUrl: './toolbar-zoom-widget.component.html',
    styleUrls: ['./toolbar-zoom-widget.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarZoomWidgetComponent {
    @Select(EditorState.zoom) zoom$: Observable<number>;

    constructor(
        public zoom: CanvasZoomService,
        public config: Settings,
    ) {}
}
