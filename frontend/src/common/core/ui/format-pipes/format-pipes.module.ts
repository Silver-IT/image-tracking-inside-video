import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormattedDatePipe} from '@common/core/ui/format-pipes/formatted-date.pipe';
import {FormattedFileSizePipe} from '@common/uploads/formatted-file-size.pipe';


@NgModule({
    declarations: [
        FormattedDatePipe,
        FormattedFileSizePipe,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        FormattedDatePipe,
        FormattedFileSizePipe,
    ]
})
export class FormatPipesModule {
}
