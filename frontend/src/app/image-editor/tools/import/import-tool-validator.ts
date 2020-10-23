import { Injectable } from '@angular/core';
import {convertToBytes} from '@common/core/utils/convertToBytes';
import {UploadValidator} from '@common/uploads/validation/upload-validator';
import {FileSizeValidation} from '@common/uploads/validation/validations/file-size-validation';
import {AllowedExtensionsValidation} from '@common/uploads/validation/validations/allowed-extensions-validation';

@Injectable({
    providedIn: 'root'
})
export class ImportToolValidator extends UploadValidator {
    protected readonly DEFAULT_MAX_FILE_SIZE_MB = 10;
    public showToast = true;

    protected initValidations() {
        this.validations.push(
            new FileSizeValidation(
                {maxSize: this.getMaxFileSize()},
                this.i18n
            )
        );

        const allowedExtensions = this.getAllowedExtensions();

        if (allowedExtensions && allowedExtensions.length) {
            this.validations.push(new AllowedExtensionsValidation(
                {extensions: allowedExtensions}, this.i18n
            ));
        }
    }

    protected getMaxFileSize(): number {
        return this.settings.get(
            'pixie.tools.import.maxFileSize',
            convertToBytes(this.DEFAULT_MAX_FILE_SIZE_MB, 'MB')
        );
    }

    protected getAllowedExtensions() {
        return this.settings.get('pixie.tools.import.validExtensions');
    }
}
