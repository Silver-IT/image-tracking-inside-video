import {BehaviorSubject} from 'rxjs';
import {FormControl, FormGroup} from '@angular/forms';
import {distinctUntilChanged, debounceTime} from 'rxjs/operators';
import {FontCategory} from './font-category';
import {Settings} from 'common/core/config/settings.service';
import {FontItem} from './font-item';
import {Injectable} from '@angular/core';

@Injectable()
export class FontsPaginatorService {
    public original: FontItem[] = [];
    public filtered: FontItem[][] = [];

    public filters = new FormGroup({
        search: new FormControl(),
        category: new FormControl('handwriting'),
    });

    /**
     * Total number of pages.
     */
    private totalPages = 0;

    /**
     * Number of fonts per page.
     */
    private perPage = 10;

    /**
     * Current page of paginator.
     */
    public currentPage = 0;

    /**
     * Fonts of current paginator page.
     */
    public current$: BehaviorSubject<FontItem[]> = new BehaviorSubject<FontItem[]>([]);

    constructor(private config: Settings) {
        this.reset();
        this.bindToFilters();
    }

    /**
     * Open next google fonts page.
     */
    public next() {
        const nextPage = this.currentPage + 1;

        if (this.totalPages > nextPage) {
            this.setPage(this.currentPage + 1);
        }
    }

    /**
     * Open previous google fonts page.
     */
    public previous() {
        const previousPage = this.currentPage - 1;

        if (previousPage > 0) {
            this.setPage(this.currentPage - 1);
        }
    }

    /**
     * Set specified page as current.
     */
    public setPage(page: number) {
        this.currentPage = page;
        this.current$.next(this.filtered[this.currentPage]);
    }

    public filter(category: keyof FontCategory, query?: string) {
        const filtered = [];
        this.original.forEach(font => {
            const matchesQuery = !query || font.family.toLowerCase().includes(query.toLowerCase()),
                matchesCategory = font.category.toLowerCase() === (category as string).toLowerCase();
            if (matchesCategory && matchesQuery) {
                filtered.push(font);
            }
        });

        this.filtered = this.chunkFonts(filtered);
        this.totalPages = this.filtered.length;
        this.setPage(0);
    }

    /**
     * Set new font items to paginate.
     */
    public setFonts(fonts: FontItem[]) {
        this.original = fonts;
        this.filter(this.filters.get('category').value);
        this.filters.patchValue({
            category: this.config.get('pixie.tools.text.defaultCategory', 'handwriting'),
        });
    }

    public getTotal() {
        return this.filtered.length * this.perPage;
    }

    public reset() {
        this.filters.setValue({
            search: null,
            category: 'handwriting'
        });
        this.setPage(0);
    }

    /**
     * Split fonts array into page chunks.
     */
    private chunkFonts(fonts: FontItem[]) {
        const chunked = [];

        while (fonts.length > 0) {
            chunked.push(fonts.splice(0, this.perPage));
        }

        return chunked;
    }

    /**
     * Perform a search when user types into search input.
     */
    private bindToFilters() {
        this.filters.valueChanges
            .pipe(debounceTime(100), distinctUntilChanged())
            .subscribe(e => this.filter(e.category, e.search));
    }
}
