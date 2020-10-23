import {Injectable} from '@angular/core';
import {Group, IEvent, IObjectOptions, IText, ITextOptions, Object} from 'fabric/fabric-impl';
import {CanvasStateService} from '../canvas-state.service';
import {Subject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {ActiveObjectForm} from './active-object.form';
import {getFabricObjectProps} from '../../utils/get-fabric-object-props';
import {normalizeObjectProps} from '../../utils/normalize-object-props';
import {ObjectNames} from '../../objects/object-names.enum';
import {Settings} from '@common/core/config/settings.service';
import {randomString} from '@common/core/utils/random-string';

@Injectable()
export class ActiveObjectService {
    public propsChanged$ = new Subject();
    public form = ActiveObjectForm.build(this.fb);

    constructor(
        private fb: FormBuilder,
        private config: Settings,
        private canvasState: CanvasStateService
    ) {}

    /**
     * @hidden
     */
    public init() {
        // set default values before subscribing to changes
        this.syncForm();
        this.form.valueChanges
            .subscribe(values => {
                this.setValues(values);
            });
    }

    /**
     * Check if active object (like text) is currently being edited by user.
     */
    public isEditing() {
        const text = this.get() as IText;
        return text && text.isEditing;
    }

    /**
     * Set specified options on currently active object.
     */
    public setValues(values: ITextOptions) {
        const obj = this.get();
        if ( ! obj) return;

        // apply fill color to each svg line separately, so sticker
        // is not recolored when other values like shadow change
        if (obj.name === ObjectNames.sticker.name && values.fill !== obj.fill) {
            if ((obj as Group).forEachObject) {
                (obj as Group).forEachObject(path => path.set('fill', values.fill));
            }
        }

        this.propsChanged$.next();
        obj.set(normalizeObjectProps(values));
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Get value for specified object option.
     */
    public getValue(name: keyof IObjectOptions) {
        return this.get().get(name);
    }

    /**
     * Get currently active object.
     */
    public get() {
        const obj = this.canvasState.fabric && this.canvasState.fabric.getActiveObject();
        if ( ! obj || ! obj.name) return null;
        if (obj.name.indexOf('crop.') > -1 || obj.name.indexOf('round.') > -1) return null;
        return obj;
    }

    /**
     * Move currently active object on canvas in specified direction.
     */
    public move(direction: 'top'|'right'|'bottom'|'left', amount: number) {
        const obj = this.get();
        if ( ! obj) return;
        obj.set(direction as any, obj[direction] + amount);
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Bring active object to front of canvas.
     */
    public bringToFront() {
        const obj = this.get(); if ( ! obj) return;
        obj.bringToFront();
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Send active object to the back of canvas.
     */
    public sendToBack() {
        const obj = this.get(); if ( ! obj) return;
        obj.sendToBack();
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Flip active object horizontally.
     */
    public flipHorizontal() {
        const obj = this.get();
        if ( ! obj) return;
        obj.flipX = !obj.flipX;
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Duplicate active object.
     */
    public duplicate() {
        const original = this.get();
        if ( ! original) return;

        this.deselect();

        original.clone(clonedObj => {
            clonedObj.set({
                left: original.left + 10,
                top: original.top + 10,
                data: {...original.data, id: randomString(10)},
                name: original.name,
            });

            this.canvasState.fabric.add(clonedObj);
            this.select(clonedObj);
            this.canvasState.fabric.requestRenderAll();
        });
    }

    /**
     * Get ID for currently active object.
     */
    public getId() {
        const obj = this.get();
        return obj && obj.data ? obj.data.id : null;
    }

    /**
     * Listen to specified object event.
     */
    public on(eventName: string, handler: (e: IEvent) => void) {
        const obj = this.get();
        if (obj) {
            obj.on(eventName, handler);
        }
    }

    /**
     * Delete currently active object.
     */
    public delete() {
        const obj = this.get();
        if ( !obj) return;
        this.canvasState.fabric.remove(obj);
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Deselect active object.
     */
    public deselect() {
        this.canvasState.fabric.discardActiveObject();
        this.canvasState.fabric.requestRenderAll();
    }

    /**
     * Set specified object as new active object.
     */
    public select(obj: Object) {
        this.canvasState.fabric.setActiveObject(obj);
    }

    /**
     * @hidden
     */
    public syncForm() {
        if (this.get()) {
            this.form.patchValue(getFabricObjectProps(this.get()), {emitEvent: false});
        } else {
            this.form.patchValue({
                ...this.config.get('pixie.objectDefaults.global'),
                fontFamily: this.config.get('pixie.objectDefaults.text.fontFamily'),
            });
        }
    }
}
