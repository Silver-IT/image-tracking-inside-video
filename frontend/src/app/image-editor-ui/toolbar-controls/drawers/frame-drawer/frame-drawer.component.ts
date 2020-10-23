import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {FrameToolService} from '../../../../image-editor/tools/frame/frame-tool.service';
import {ActiveFrameService} from '../../../../image-editor/tools/frame/active-frame.service';
import {Frame} from '../../../../image-editor/tools/frame/frame';
import {Select, Store} from '@ngxs/store';
import {MarkAsDirty, OpenFrameControls} from '../../../state/frame/frame.actions';
import {FrameState} from '../../../state/frame/frame.state';
import {Observable} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Component({
    selector: 'frame-drawer',
    templateUrl: './frame-drawer.component.html',
    styleUrls: ['./frame-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class FrameDrawerComponent implements OnInit {
    @Select(FrameState.controlsOpen) controlsOpen$: Observable<boolean>;

    public frameControlsForm = new FormGroup({
        size: new FormControl(),
        color: new FormControl(),
    });

    constructor(
        public frameTool: FrameToolService,
        public activeFrame: ActiveFrameService,
        private store: Store,
    ) {}

    ngOnInit() {
        this.frameControlsForm.get('color').valueChanges.subscribe(value => {
            this.frameTool.changeColor(value);
        });

        this.frameControlsForm.valueChanges
            .pipe(debounceTime(150))
            .subscribe(() => {
                this.markAsDirty();
            });
    }

    public getFrameThumbUrl(frame: Frame) {
        return this.frameTool.patterns.getBaseUrl(frame) + '/thumbnail.png';
    }

    public selectFrame(frame: Frame) {
        this.markAsDirty();
        this.frameTool.add(frame.name);
    }

    public scaleFrame(value: number | null) {
        this.frameTool.resize(value);
    }

    public frameIsActive(frame: Frame) {
        return this.activeFrame.is(frame);
    }

    public removeFrame() {
        this.activeFrame.remove();
    }

    public showFrameConfig(frame: Frame) {
        this.frameControlsForm.patchValue({size: frame.size.default}, {emitEvent: false});
        this.store.dispatch(new OpenFrameControls());
    }

    public markAsDirty() {
        this.store.dispatch(new MarkAsDirty());
    }
}
