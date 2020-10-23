import {ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit, Optional} from '@angular/core';
import {OVERLAY_PANEL_DATA} from '@common/core/ui/overlay-panel/overlay-panel-data';
import {OverlayPanelRef} from '@common/core/ui/overlay-panel/overlay-panel-ref';
import {PaginatedDataTableSource} from '@common/shared/data-table/data/paginated-data-table-source';
import {
    DataTableFilterCondition,
    DataTableFilterOption
} from '@common/shared/data-table/filter-panel/data-table-filters';
import {matDialogAnimations} from '@angular/material/dialog';
import {Settings} from '@common/core/config/settings.service';
import {Subscription} from 'rxjs';
import {ComponentPortal} from '@angular/cdk/portal';

@Component({
    selector: 'filter-panel',
    templateUrl: './filter-panel.component.html',
    styleUrls: ['./filter-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[@dialogContainer]': `'enter'`
    },
    animations: [
        matDialogAnimations.dialogContainer,
    ]
})
export class FilterPanelComponent implements OnInit, OnDestroy {
    public portals: {[key: string]: ComponentPortal<any>} = {};
    private subscription: Subscription;
    constructor(
        @Inject(OVERLAY_PANEL_DATA) @Optional() public data: {source: PaginatedDataTableSource<any>},
        private overlayPanelRef: OverlayPanelRef,
        public settings: Settings,
    ) {}

    ngOnInit() {
        this.subscription = this.data.source.filterForm.valueChanges
            .subscribe(() => this.close());
        this.data.source.config.filters.forEach(filter => {
            if (filter.component) {
                this.portals[filter.name] = new ComponentPortal(filter.component);
            }
        });
    }

    ngOnDestroy() {
        this.subscription && this.subscription.unsubscribe();
    }

    public viewName(name: string): string {
        return name.replace(/_/g, ' ');
    }

    public optionName(option: DataTableFilterOption): string {
        return option.displayName || this.viewName(option.name);
    }

    public close() {
        this.overlayPanelRef.close();
    }

    public getValue(option: DataTableFilterOption) {
        // if no value is provided, use name as value instead
        let value = option.value === undefined ? option.name : option.value;
        // should disable filter completely if value is "all"
        if (value === 'all' || value === 'any') value = null;
        return value;
    }

    public conditionPasses(condition: DataTableFilterCondition): boolean {
        if ( ! condition) {
            return true;
        }
        if (typeof condition === 'function') {
            return condition(this.data.source);
        } else {
            return this.settings.get(condition);
        }
    }
}
