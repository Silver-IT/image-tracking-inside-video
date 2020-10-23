import { Injectable } from '@angular/core';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { Object } from 'fabric/fabric-impl';

import { CanvasService } from '../canvas/canvas.service';
import { VideoActions, VideoMakingActionTypes } from './video-background.enum';
import { ObjectsSynced } from '../state/editor-state-actions';
import { ObjectListService } from '../objects/object-list.service';
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';

class VideoReceivingActionType {
    type: VideoActions;
    payload: any;
}

class VideoMakingActionType {
    type: VideoMakingActionTypes;
    payload: any;
}

class VideoObject {
    object: Object;
    timeline: number;
    initialInfo: ObjectKeyFrame;
}

class ObjectKeyFrame {
    top: number;
    left: number;
    width: number;
    height: number;
}

@Injectable()
export class VideoBackgroundService {
    public receivingAction$: BehaviorSubject<VideoReceivingActionType> = new BehaviorSubject({
        type: VideoActions.Initialized,
        payload: null
    });
    public makingAction$: BehaviorSubject<VideoMakingActionType> = new BehaviorSubject({
        type: VideoMakingActionTypes.Initialized,
        payload: null
    });

    private objects: VideoObject[] = [];
    private currentTimeline: number = 0;
    private duration: number = 0;
    private keyFrames: any[] = [];

    constructor(
        private canvas: CanvasService,
        private actions$: Actions,
        private http: HttpClient,
        private objectService: ObjectListService
    ) {
        this.initializeSettings();
        this.initializeConfigurationForObjects();
    }

    initializeConfigurationForObjects() {
        this.actions$
            .pipe(ofActionSuccessful(ObjectsSynced))
            .subscribe(() => {
                const objects = this.objectService.getAll();
                this.updateObjects(objects);
            });
    }

    initializeSettings() {
        this.receivingAction$.subscribe(action => {
            const { type, payload } = action;
            if (type === VideoActions.Loaded) {
                const { width, height, duration } = payload;
                this.duration = duration;
                this.canvas.loadMainVideoBackground('Test Background', width, height);
            } else if (type === VideoActions.PositionChanged) {
                const { value } = payload;
                this.currentTimeline = value;
                this.updateObjectsVisibility();
            }
        });
    }

    updateObjects(objects: Object[]): void {
        let isAppend = false;
        if (objects.length > this.objects.length) {
            objects.forEach(object => {
                const curObject = this.objects.find(videoObject => videoObject.object.data.id === object.data.id);
                if (!curObject) {
                    this.appendObject(object);
                }
            });
            isAppend = true;
        } else {
            this.objects.forEach(videoObject => {
                const curObject = objects.find(object => object.data.id === videoObject.object.data.id);
                if (!curObject) {
                    this.removeObject(videoObject.object);
                }
            });
        }
        this.makingAction$.next({
            type: VideoMakingActionTypes.ObjectSync,
            payload: { isAppend }
        })
    }

    appendObject(object: Object): void {
        this.objects.push({
            object,
            timeline: this.currentTimeline,
            initialInfo: {
                top: object.top,
                left: object.left,
                width: 0,
                height: 0
            }
        });
    }

    removeObject(object: Object): void {
        const index = this.objects.findIndex(videoObject => videoObject.object.data.id === object.data.id);
        if (index >= 0) {
            this.objects.splice(index, 1);
        }
    }

    updateObjectsVisibility(): void { // TODO: this needs to be updated later
        this.objects.forEach(videoObject => {
            let newVisible = false;
            if (this.currentTimeline >= videoObject.timeline) {
                newVisible = true;
            }
            videoObject.object.visible = newVisible;

            if (newVisible && this.keyFrames && this.keyFrames.length) {
                const curKeyFrames = this.keyFrames.find(element => element.id === videoObject.object.data.id);
                const timelineOffset = (this.currentTimeline - videoObject.timeline) * this.duration / 100;
                const index = Math.ceil(curKeyFrames['fps'] * timelineOffset);
                const curFrame = curKeyFrames['track'][index];
                if (!!curFrame) {
                    videoObject.object.top = curFrame[0];
                    videoObject.object.left = curFrame[1];
                    videoObject.object.set('width', curFrame[2]);
                    videoObject.object.set('height', curFrame[3]);
                    videoObject.object.setCoords();
                }
            }
            this.canvas.render();
        });
    }

    getObjects(): VideoObject[] {
        return this.objects;
    }

    getObjectFromNativeObject(object: Object): VideoObject {
        const curVideoObject = this.objects.find(videoObject => videoObject.object.data.id === object.data.id);
        if (!curVideoObject) {
            return null;
        } else {
            return curVideoObject;
        }
    }

    getTimelineBySecondsOfObject(object: Object): number {
        const curObject = this.getObjectFromNativeObject(object);
        return this.duration * (curObject.timeline / 100);
    }

    seekBySelectingObject(object: Object): void {
        const curObject = this.getObjectFromNativeObject(object);
        if (!!curObject) {

            curObject.object.top = curObject.initialInfo.top;
            curObject.object.left = curObject.initialInfo.left;
            // curObject.object.set('width', curObject.initialInfo.width);
            // curObject.object.set('height', curObject.initialInfo.height);
            // curObject.object.setCoords();

            this.makingAction$.next({
                type: VideoMakingActionTypes.Seek,
                payload: { value: curObject.timeline }
            });
        }
    }

    testToBackend(): void {
        this.makingAction$.next({
            type: VideoMakingActionTypes.RequestedTracking,
            payload: null
        });
        this.http.post('http://localhost:3000', {
            "objects": this.getObjectsInfoWithJson()
        }, { responseType: "text" }).subscribe(response => {
            this.keyFrames = JSON.parse(`${String(response).trim()}`);
            this.onUpdatedObjectKeyFrames();
        });
    }

    onUpdatedObjectKeyFrames(): void {
        this.makingAction$.next({
            type: VideoMakingActionTypes.ResponsedTracking,
            payload: null
        });
        this.makingAction$.next({
            type: VideoMakingActionTypes.Pause,
            payload: null
        });
        this.makingAction$.next({
            type: VideoMakingActionTypes.Seek,
            payload: { value: 0 }
        });
        this.makingAction$.next({
            type: VideoMakingActionTypes.Play,
            payload: null
        });
    }

    getObjectsInfoWithJson(): string {
        let json = [];
        this.objects.forEach(vObject => {
            if (vObject.initialInfo.width === 0) {
                vObject.initialInfo.width = vObject.object.getScaledWidth();
                vObject.initialInfo.height = vObject.object.getScaledHeight();
            }
            json.push({
                id: vObject.object.data.id,
                time: this.getTimelineBySecondsOfObject(vObject.object),
                location: {
                    top: vObject.initialInfo.top,
                    left: vObject.initialInfo.left,
                    width: vObject.initialInfo.width,
                    height: vObject.initialInfo.height
                }
            })
        });
        return JSON.stringify(json);
    }
}
