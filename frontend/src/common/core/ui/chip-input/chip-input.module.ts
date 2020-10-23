import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChipInputComponent} from './chip-input.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {ReactiveFormsModule} from '@angular/forms';
import {TranslationsModule} from '@common/core/translations/translations.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
    imports: [
        CommonModule,
        MatChipsModule,
        MatIconModule,
        MatAutocompleteModule,
        ReactiveFormsModule,
        TranslationsModule,
    ],
    declarations: [
        ChipInputComponent
    ],
    exports: [
        ChipInputComponent
    ]
})
export class ChipInputModule {
}
