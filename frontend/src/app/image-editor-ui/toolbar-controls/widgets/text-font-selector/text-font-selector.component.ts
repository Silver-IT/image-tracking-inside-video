import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {GoogleFontsPanelComponent} from '../google-fonts-panel/google-fonts-panel.component';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
import {BehaviorSubject} from 'rxjs';
import {OverlayPanel} from '@common/core/ui/overlay-panel/overlay-panel.service';
import {FontItem} from '../google-fonts-panel/font-item';
import {map} from 'rxjs/operators';

@Component({
    selector: 'text-font-selector',
    templateUrl: './text-font-selector.component.html',
    styleUrls: ['./text-font-selector.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: TextFontSelectorComponent,
        multi: true,
    }]
})
export class TextFontSelectorComponent {
    public selectedFont$ = new BehaviorSubject<FontItem|string>(null);
    public propagateChange: Function;

    get fontFamily$() {
        return this.selectedFont$.pipe(map(f => (!f || typeof f === 'string') ? f : f.family));
    }

    constructor(private overlayPanel: OverlayPanel) {}

    public openGoogleFontsPanel() {
        this.overlayPanel.open(
            GoogleFontsPanelComponent,
            {
                position: 'center',
                origin: 'global',
            })
            .valueChanged().subscribe((fontFamily: FontItem) => {
                this.selectedFont$.next(fontFamily);
                this.propagateChange(fontFamily);
            });
    }

    public writeValue(value: string|FontItem|null) {
        this.selectedFont$.next(value);
    }

    public registerOnChange(fn: Function) {
        this.propagateChange = fn;
    }

    public registerOnTouched() {}
}
