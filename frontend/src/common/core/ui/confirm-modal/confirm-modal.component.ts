import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Translations} from '../../translations/translations.service';
import {Settings} from '../../config/settings.service';

export interface ConfirmModalData {
    title: string;
    body: string;
    bodyBold?: string;
    ok?: string;
    cancel?: string;
}

@Component({
    selector: 'confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmModalComponent implements OnInit {
    constructor(
        private dialogRef: MatDialogRef<ConfirmModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmModalData,
        private i18n: Translations,
        public settings: Settings,
    ) {}

    public close() {
        this.dialogRef.close(false);
    }

    ngOnInit() {
        this.data.title = this.i18n.t(this.data.title);
        this.data.body = this.i18n.t(this.data.body);
        if (this.data.bodyBold) this.data.bodyBold = this.i18n.t(this.data.bodyBold);
        this.data.ok = this.data.ok ? this.i18n.t(this.data.ok) : this.i18n.t('Confirm');
        this.data.cancel = this.data.cancel ? this.i18n.t(this.data.cancel) : this.i18n.t('Cancel');
    }

    public confirm() {
        this.dialogRef.close(true);
    }
}