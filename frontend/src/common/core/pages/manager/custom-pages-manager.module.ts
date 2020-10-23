import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CustomPagesIndexComponent} from '@common/core/pages/manager/custom-pages-index/custom-pages-index.component';
import {CrupdatePageComponent} from '@common/core/pages/manager/crupdate-page/crupdate-page.component';
import {DataTableModule} from '@common/shared/data-table/data-table.module';
import {RouterModule} from '@angular/router';
import {TextEditorModule} from '@common/text-editor/text-editor.module';
import {CUSTOM_PAGE_CONFIG_TOKEN, CustomPageManagerConfig} from '@common/core/pages/manager/custom-page-config';
import {SlugControlModule} from '@common/shared/form-controls/slug-control/slug-control.module';
import {TranslationsModule} from '@common/core/translations/translations.module';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormatPipesModule} from '@common/core/ui/format-pipes/format-pipes.module';
import {LoadingIndicatorModule} from '@common/core/ui/loading-indicator/loading-indicator.module';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
    declarations: [
        CustomPagesIndexComponent,
        CrupdatePageComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        DataTableModule,
        TextEditorModule,
        SlugControlModule,
        TranslationsModule,
        FormatPipesModule,
        LoadingIndicatorModule,

        // material
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
    ]
})
export class CustomPagesManagerModule {
    static forRoot(config: CustomPageManagerConfig): ModuleWithProviders<CustomPagesManagerModule> {
        return {
            ngModule: CustomPagesManagerModule,
            providers: [
                {
                    provide: CUSTOM_PAGE_CONFIG_TOKEN,
                    useValue: config,
                    multi: true,
                }
            ]
        };
    }
}
