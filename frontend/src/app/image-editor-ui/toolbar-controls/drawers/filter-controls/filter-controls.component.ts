import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';
import {FilterToolService} from '../../../../image-editor/tools/filter/filter-tool.service';
import {Select, Store} from '@ngxs/store';
import {FilterState} from '../../../state/filter/filter.state';
import {Observable} from 'rxjs';

@Component({
    selector: 'filter-controls',
    templateUrl: './filter-controls.component.html',
    styleUrls: ['./filter-controls.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class FilterControlsComponent {
    @Select(FilterState.selectedFilter) selectedFilter$: Observable<string>;
    public colorFormControl = new FormControl();

    constructor(
        private filterTool: FilterToolService,
        private store: Store,
    ) {}

    public applyFilterValue(optionName: string, value: string|number) {
        const filterName = this.store.selectSnapshot(FilterState.selectedFilter);
        this.filterTool.applyValue(filterName, optionName, value);
    }

    public getFilterOptions(name: string) {
        return this.filterTool.getByName(name).options;
    }
}
