import {ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ColorpickerPanelComponent} from 'common/core/ui/color-picker/colorpicker-panel.component';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {Settings} from 'common/core/config/settings.service';
import {BehaviorSubject} from 'rxjs';
import {BOTTOM_POSITION} from '@common/core/ui/overlay-panel/positions/bottom-position';

@Component({
    selector: 'color-widget',
    templateUrl: './color-widget.component.html',
    styleUrls: ['./color-widget.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {class: 'color-widget'},
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: ColorWidgetComponent,
        multi: true,
    }]
})
export class ColorWidgetComponent implements ControlValueAccessor {
    @ViewChild('colorPickerButton', { read: ElementRef }) colorPickerButton: ElementRef;
    @Input() @HostBinding('class.compact') compact = false;

    public selectedColor$ = new BehaviorSubject('#000');
    public colors: string[];
    public propagateChange: Function;

    constructor(
        private overlayPanel: OverlayPanel,
        private config: Settings,
    ) {
        this.colors = this.config.get('pixie.ui.colorPresets.items');
    }

    public changeColor(color: string) {
        this.selectedColor$.next(color);
        this.propagateChange(color);
    }

    public openColorPicker() {
        const config = {position: BOTTOM_POSITION, hasBackdrop: true, origin: this.colorPickerButton};
        this.overlayPanel.open(ColorpickerPanelComponent, config)
            .valueChanged().subscribe(color => this.changeColor(color));
    }

    public writeValue(value: string|null) {
        this.selectedColor$.next(value);
    }

    public registerOnChange(fn: Function) {
        this.propagateChange = fn;
    }

    public registerOnTouched() {}
}
