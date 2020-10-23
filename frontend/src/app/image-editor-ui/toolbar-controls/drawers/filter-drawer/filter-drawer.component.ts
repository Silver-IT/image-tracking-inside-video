import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {FilterToolService} from '../../../../image-editor/tools/filter/filter-tool.service';
import {Select, Store} from '@ngxs/store';
import {EditorState} from '../../../../image-editor/state/editor-state';
import {Observable} from 'rxjs';
import {OpenFilterControls} from '../../../state/filter/filter.actions';
import {FilterState} from '../../../state/filter/filter.state';
import {DrawerName} from '../drawer-name.enum';
import {startCase} from '@common/core/utils/start-case';

@Component({
    selector: 'filter-drawer',
    templateUrl: './filter-drawer.component.html',
    styleUrls: ['./filter-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class FilterDrawerComponent {
    @Select(EditorState.activePanel) forePanel$: Observable<DrawerName>;
    @Select(FilterState.activeFilters) activeFilters$: Observable<string[]>;
    @Select(FilterState.selectedFilter) selectedFilter$: Observable<string|null>;
    @Select(FilterState.dirty) dirty$: Observable<boolean>;

    public filterList: string[] = [];

    constructor(
        private settings: Settings,
        public filterTool: FilterToolService,
        protected store: Store,
        public config: Settings,
    ) {
        this.filterList = this.config.get('pixie.tools.filter.items');
    }

    public applyFilter(filter: string) {
        this.filterTool.apply(filter);
    }

    public removeFilter(filter: string) {
        this.filterTool.remove(filter);
    }

    public getFilterImage(filter: string) {
        return this.settings.getAssetUrl('images/filters/square/' + filter.replace(' ', '-') + '.jpg', true);
    }

    public showFilterControls(filter: string) {
        this.store.dispatch(new OpenFilterControls(filter));
    }

    public getFilterDisplayName(name: string): string {
        if (name === 'blackWhite') return 'Black & White';
        return startCase(name);
    }
}
