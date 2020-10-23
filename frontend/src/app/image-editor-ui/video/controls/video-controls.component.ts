import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    Input, OnChanges, ChangeDetectorRef
} from '@angular/core';
import { VideoActions, VideoMakingActionTypes } from 'app/image-editor/video-background/video-background.enum';
import { VideoBackgroundService } from 'app/image-editor/video-background/video-background.service';
@Component({
    selector: 'pixie-video-controls',
    templateUrl: './video-controls.component.html',
    styleUrls: ['./video-controls.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoControlsComponent implements OnInit, OnChanges {
    public value = 0;
    public playPauseButtonName = 'Play';
    public bPlaying = false;

    constructor(
        private videoService: VideoBackgroundService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.videoService.receivingAction$.subscribe(action => {
            if (action.type === VideoActions.Started) {
                this.playPauseButtonName = 'Pause';
                this.bPlaying = true;
            } else if (action.type === VideoActions.Paused) {
                this.playPauseButtonName = 'Play';
                this.bPlaying = false
            } else if (action.type === VideoActions.Ended) {
                this.playPauseButtonName = 'Play';
                this.bPlaying = false;
            } else if (action.type === VideoActions.PositionChanged) {
                const { value } = action.payload;
                this.value = value;
                this.cdr.detectChanges();
            }
        });
    }

    ngOnChanges(changes) {
        console.log(changes, this.value);
    }

    onPlayPauseButtonClicked() {
        if (this.bPlaying) {
            this.videoService.makingAction$.next({
                type: VideoMakingActionTypes.Pause,
                payload: null
            });
        } else {
            this.videoService.makingAction$.next({
                type: VideoMakingActionTypes.Play,
                payload: null
            });
        }
    }

    onChangePosition(value) {
        this.videoService.makingAction$.next({
            type: VideoMakingActionTypes.Seek,
            payload: {
                value
            }
        });
    }
}
