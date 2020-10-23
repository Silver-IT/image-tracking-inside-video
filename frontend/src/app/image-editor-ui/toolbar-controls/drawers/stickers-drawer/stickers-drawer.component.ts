import {ChangeDetectionStrategy, Component, ViewEncapsulation} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {StickerCategory} from '../../../../image-editor/tools/shapes/default-stickers';
import {ShapesToolService} from '../../../../image-editor/tools/shapes/shapes-tool.service';
import {Select, Store} from '@ngxs/store';
import {MarkAsDirty, OpenStickerCategory} from '../../../state/stickers/stickers.actions';
import {StickersState} from '../../../state/stickers/stickers.state';
import {Observable} from 'rxjs';

@Component({
    selector: 'stickers-drawer',
    templateUrl: './stickers-drawer.component.html',
    styleUrls: ['./stickers-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class StickersDrawerComponent {
    @Select(StickersState.activeCategory) activeCategory$: Observable<StickerCategory>;
    public categories: StickerCategory[];

    constructor(
        public shapesTool: ShapesToolService,
        private config: Settings,
        private store: Store,
    ) {
        this.categories = this.config.get('pixie.tools.stickers.items');
    }

    public addSticker(categoryName: string, stickerName: number|string) {
        this.shapesTool.addSticker(categoryName, stickerName).then(() => {
            this.store.dispatch(new MarkAsDirty());
        });
    }

    public openStickersCategory(category: StickerCategory) {
        this.store.dispatch(new OpenStickerCategory(category));
    }

    /**
     * Get iterable for specified categories items.
     */
    public getStickersIterable(category: StickerCategory): (string|number)[] {
        if (category.list) return category.list;
        return Array.from(Array(category.items).keys());
    }
}

