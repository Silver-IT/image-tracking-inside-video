import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {EditorControlsService} from './editor-controls.service';
import {ActiveObjectService} from '../../image-editor/canvas/active-object/active-object.service';
import {Select} from '@ngxs/store';
import {EditorState} from '../../image-editor/state/editor-state';
import {Observable} from 'rxjs';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {DrawerName} from './drawers/drawer-name.enum';
import {ImageEditorService} from '../../image-editor/image-editor.service';
import {map} from 'rxjs/operators';

@Component({
    selector: 'editor-controls',
    templateUrl: './editor-controls.component.html',
    styleUrls: ['./editor-controls.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('controlsAnimation', [
            transition(':enter', [
                style({ opacity: 0}),
                animate('225ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1 })),
            ]),
            transition(':leave', [
                animate('0ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0 }))
            ])
        ]),
    ]
})
export class EditorControlsComponent {
    @Select(EditorState.activePanel) activePanel$: Observable<DrawerName>;
    @Select(EditorState.activeObjId) activeObjId$: Observable<string>;
    @Select(EditorState.dirty) dirty$: Observable<boolean>;
    public compactMode$: Observable<boolean>;

    constructor(
        public controls: EditorControlsService,
        public activeObject: ActiveObjectService,
        public breakpoints: BreakpointsService,
        public imageEditor: ImageEditorService,
    ) {
        this.compactMode$ = this.breakpoints.observe('(max-width: 920px)')
            .pipe(map(result => result.matches));

            // Shadow: Change Editor Panel ( Navigator, Shape, Text, ... )
            // this.activePanel$.subscribe(aaa => { console.log(aaa); })
    }
}
