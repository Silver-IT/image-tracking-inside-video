import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
    selector: 'chip-input',
    templateUrl: './chip-input.component.html',
    styleUrls: ['./chip-input.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: ChipInputComponent,
        multi: true,
    }]
})
export class ChipInputComponent implements ControlValueAccessor, OnInit {
    @Input() placeholder: string;
    @Input() type = 'text';
    @Input() suggestFn: (query: string) => Observable<string[]>;
    @ViewChild('auto') matAutocomplete: MatAutocomplete;
    @ViewChild('inputEl', {static: true}) inputEl: HTMLInputElement;

    public formControl = new FormControl();

    public propagateChange: Function;
    public items$ = new BehaviorSubject<string[]>([]);
    public suggestedValues$ = new Subject<string[]>();

    constructor(public el: ElementRef) {}

    ngOnInit() {
        if (this.suggestFn) {
            this.bindToSearchControl();
        }
    }

    public remove(index: number) {
        const items = [...this.items$.value];
        items.splice(index, 1);
        this.items$.next(items);
        this.propagateChange(this.items$.value);
    }

    public addFromChipInput(value: string, propagate = true) {
        if ( ! this.matAutocomplete.isOpen) {
            this.add(value, propagate);
        }
    }

    public addFromAutocomplete(value: string, propagate = true) {
        this.add(value, propagate);
    }

    private add(value: string, propagate = true) {
        value = value ? value.trim() : '';
        const duplicate = this.items$.value.indexOf(value) > -1;
        if (value && !duplicate) {
            this.items$.next([...this.items$.value, value]);
            if (propagate) {
                this.propagateChange(this.items$.value);
            }
        }
        if (this.inputEl) {
            this.inputEl.value = '';
        }
        this.formControl.setValue(null);
        this.suggestedValues$.next([]);
    }

    public writeValue(value: string[] = []) {
        if (value && value.length) {
            value.forEach(item => this.add(item, false));
        } else if (this.items$.value.length) {
            while (this.items$.value.length !== 0) {
                this.remove(0);
            }
        }
    }

    public registerOnChange(fn: Function) {
        this.propagateChange = fn;
    }

    public registerOnTouched() {}

    private bindToSearchControl() {
        this.formControl.valueChanges.pipe(
            debounceTime(150),
            distinctUntilChanged(),
            switchMap(query => query ? this.suggestFn(query) : of([])),
            catchError(() => of([])),
        ).subscribe(values => {
            this.suggestedValues$.next(values);
        });
    }
}
