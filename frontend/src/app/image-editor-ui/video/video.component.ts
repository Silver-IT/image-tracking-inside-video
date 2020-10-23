import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation,
    Input,
    ViewChild,
    ChangeDetectorRef
} from '@angular/core';
import { HistoryToolService } from 'app/image-editor/history/history-tool.service';
import { VideoActions, VideoMakingActionTypes } from 'app/image-editor/video-background/video-background.enum';
import { VideoBackgroundService } from 'app/image-editor/video-background/video-background.service';
import { HistoryNames } from '../../image-editor/history/history-names.enum';
import { FloatingPanelsService } from '../toolbar-controls/floating-panels.service';

@Component({
    selector: 'pixie-video-background',
    templateUrl: './video.component.html',
    styleUrls: ['./video.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VideoBackgroundComponent implements OnInit {
    @Input() url: string;
    @ViewChild('videoBackground', { static: true }) videoEle: any;

    public bSpinnerVisibility: boolean = false;
    private dimension: Object;
    public position = 0;
    private duration = 0;

    constructor(
        private videoService: VideoBackgroundService,
        private history: HistoryToolService,
        private panels: FloatingPanelsService,
        private cdr: ChangeDetectorRef
    ) {
        this.dimension = null;
    }

    ngOnInit() {
        this.initVideoElementListeners();
        this.initConfigurationForActions();
    }

    initVideoElementListeners() {
        let _root = this;
        this.videoEle.nativeElement.addEventListener('loadedmetadata', function() {
            _root.duration = this.duration;
            _root.onLoadedVideo(this.videoWidth, this.videoHeight);
        });
        this.videoEle.nativeElement.addEventListener('timeupdate', function(event) {
            _root.position = (100 / this.duration) * this.currentTime;
            const videoPositionChangedAction = {
                type: VideoActions.PositionChanged,
                payload: { value: _root.position }
            }
            _root.videoService.receivingAction$.next(videoPositionChangedAction);
        });
    }

    initConfigurationForActions() {
        this.videoService.makingAction$.subscribe(action => {
            const { type, payload } = action;
            switch(type) {
                case VideoMakingActionTypes.Play:
                    this.play();
                    break;
                case VideoMakingActionTypes.Pause:
                    this.pause();
                    break;
                case VideoMakingActionTypes.Seek:
                    const { value } = payload;
                    this.seek(value);
                    break;
                case VideoMakingActionTypes.ObjectSync:
                    const { isAppend } = payload;
                    this.updateObjectPannel(isAppend);
                    break;
                case VideoMakingActionTypes.RequestedTracking:
                    this.bSpinnerVisibility = true;
                    this.cdr.detectChanges();
                    break;
                case VideoMakingActionTypes.ResponsedTracking:
                    this.bSpinnerVisibility = false;
                    this.cdr.detectChanges();
                    break;
                default:
                    break;
            }
        });
    }

    onLoadedVideo(width: number, height: number) {
        this.dimension = { width, height };
        this.history.add(HistoryNames.BG_VIDEO);
        const videoLoadedAction = {
            type: VideoActions.Loaded,
            payload: { ...this.getDimention(), duration: this.duration }
        }
        this.videoService.receivingAction$.next(videoLoadedAction);
        // this.panels.toggleObjects();
    }

    getDimention() {
        return this.dimension;
    }

    play() {
        this.videoEle.nativeElement.muted = true;
        this.videoEle.nativeElement.play();
        const videoStartedAction = {
            type: VideoActions.Started,
            payload: {} // TODO: set position
        };
        this.videoService.receivingAction$.next(videoStartedAction);
    }

    pause() {
        this.videoEle.nativeElement.pause();
        const videoPausedAction = {
            type: VideoActions.Paused,
            payload: {}
        }
        this.videoService.receivingAction$.next(videoPausedAction);
    }

    seek(value: number) {
        this.videoEle.nativeElement.currentTime = this.duration * (value / 100);
    }

    updateObjectPannel(isAppend = false): void {
        const objectCount = this.videoService.getObjects().length;
        if (objectCount === 1 && isAppend){
            this.panels.openObjectsPanel();
        } else if (objectCount === 0 && !isAppend) {
            this,this.panels.closePanel('objects');
        }
    }
}
