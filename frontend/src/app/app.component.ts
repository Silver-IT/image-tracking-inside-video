import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding, HostListener,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Store} from '@ngxs/store';
import {EditorState} from './image-editor/state/editor-state';
import {EditorMode} from './image-editor/enums/editor-mode.enum';
import {CloseEditor} from './image-editor/state/editor-state-actions';
import {Settings} from '@common/core/config/settings.service';

@Component({
    selector: 'pixie-editor',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('editorVisible', [
            state('true', style({
                opacity: '*',
            })),
            state('false', style({
                opacity: '0',
            })),
            transition('true <=> false', animate('325ms cubic-bezier(.4,0,.2,1)'))
        ]),
    ]
})
export class AppComponent implements OnInit {
    @ViewChild('overlay', {static: true}) overlay: ElementRef;

    // https://github.com/angular/angular/issues/29371
    @HostBinding('@editorVisible') get editorVisible() {
        return this.store.selectSnapshot(EditorState.visible);
    }

    @HostBinding('class.mode-overlay') get overlayMode() {
        return this.store.selectSnapshot(EditorState.mode) === EditorMode.OVERLAY;
    }

    @HostBinding('class.mode-inline') get inlineMode() {
        return this.store.selectSnapshot(EditorState.mode) === EditorMode.INLINE;
    }

    @HostBinding('style.width') get width() {
        return this.config.get('pixie.ui.width');
    }

    @HostBinding('style.height') get height() {
        return this.config.get('pixie.ui.height');
    }

    @HostBinding('class.ui-compact') get compact() {
        return this.config.get('pixie.ui.compact');
    }

    constructor(
        private store: Store,
        private config: Settings,
        private el: ElementRef<HTMLElement>,
    ) {}

    ngOnInit() {
        this.bindToOverlayClick(this.overlay);
    }

    private bindToOverlayClick(overlay: ElementRef) {
        overlay.nativeElement.addEventListener('click', () => {
            this.store.dispatch(new CloseEditor());
        });
    }

    @HostListener('@editorVisible.start')
    private onAnimationStart() {
        this.el.nativeElement.style.display = 'block';
    }

    @HostListener('@editorVisible.done')
    private onAnimationEnd() {
        this.el.nativeElement.style.display = this.editorVisible ? 'block' : 'none';
    }
}
