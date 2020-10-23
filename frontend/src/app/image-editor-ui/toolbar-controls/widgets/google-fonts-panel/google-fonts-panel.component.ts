import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {GoogleFontsPanelService} from './google-fonts-panel.service';
import {FontCategory} from './font-category';
import {FontItem} from './font-item';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
    selector: 'google-fonts-panel',
    templateUrl: './google-fonts-panel.component.html',
    styleUrls: ['./google-fonts-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class GoogleFontsPanelComponent implements OnInit, OnDestroy {
    @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
    public fontCategories = FontCategory;

    constructor(
        public overlayPanelRef: OverlayPanelRef,
        public fonts: GoogleFontsPanelService,
    ) {}

    ngOnInit() {
        this.fonts.init().then(() => {
            this.fonts.paginator.filters.valueChanges.subscribe(() => {
                this.paginator.firstPage();
            });
        });
    }

    ngOnDestroy() {
        this.fonts.paginator.reset();
    }

    public applyFont(font: FontItem) {
        this.overlayPanelRef.emitValue(font);
        this.overlayPanelRef.close();
    }

    public changePage(e: PageEvent) {
        this.fonts.paginator.setPage(e.pageIndex);
    }
}
