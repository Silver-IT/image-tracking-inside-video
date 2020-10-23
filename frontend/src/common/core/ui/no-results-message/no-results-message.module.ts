import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoResultsMessageComponent} from '@common/core/ui/no-results-message/no-results-message.component';

@NgModule({
    declarations: [
        NoResultsMessageComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NoResultsMessageComponent,
    ]
})
export class NoResultsMessageModule {
}
