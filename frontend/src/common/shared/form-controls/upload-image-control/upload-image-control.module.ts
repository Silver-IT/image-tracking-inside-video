import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UploadImageControlComponent} from './upload-image-control.component';
import {UploadsModule} from '@common/uploads/uploads.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {ImageOrIconModule} from '@common/core/ui/image-or-icon/image-or-icon.module';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslationsModule} from '@common/core/translations/translations.module';

@NgModule({
    declarations: [UploadImageControlComponent],
    imports: [
        CommonModule,
        UploadsModule,
        ImageOrIconModule,
        TranslationsModule,

        // material
        MatProgressBarModule,
        MatIconModule,
        MatButtonModule,
    ],
    exports: [
      UploadImageControlComponent,
    ]
})
export class UploadImageControlModule {
}
