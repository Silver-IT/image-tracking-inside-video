import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ExportToolService} from '../../../image-editor/tools/export/export-tool.service';
import {BehaviorSubject} from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import {Settings} from '@common/core/config/settings.service';

@Component({
    selector: 'export-panel',
    templateUrl: './export-panel.component.html',
    styleUrls: ['./export-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ExportPanelComponent implements OnInit {
    public quality$ = new BehaviorSubject(this.config.get('pixie.tools.export.defaultQuality') * 10);
    public exportForm = new FormGroup({
        name: new FormControl(this.config.get('pixie.tools.export.defaultName')),
        format: new FormControl(this.config.get('pixie.tools.export.defaultFormat')),
        quality: new FormControl(this.config.get('pixie.tools.export.defaultQuality')),
    });

    constructor(
        private config: Settings,
        private exportTool: ExportToolService,
        private dialogRef: MatDialogRef<ExportPanelComponent>,
    ) {}

    ngOnInit() {
        this.exportForm.get('format').valueChanges.subscribe(value => {
            if (value !== 'jpeg') {
                this.exportForm.get('quality').disable();
            } else {
                this.exportForm.get('quality').enable();
            }
        });

        this.exportForm.get('quality').valueChanges.subscribe(value => {
            this.quality$.next(value * 10);
        });
    }

    public export() {
        const val = this.exportForm.value;
        this.exportTool.export(val.name, val.format, val.quality);
        this.dialogRef.close();
    }
}
