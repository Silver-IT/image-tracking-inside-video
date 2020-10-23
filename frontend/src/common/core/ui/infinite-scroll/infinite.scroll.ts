import {Input, ElementRef, OnInit, OnDestroy, NgZone, Directive} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

@Directive()
export abstract class InfiniteScroll implements OnInit, OnDestroy {
    protected scrollSub: Subscription;
    protected el: ElementRef<HTMLElement>;
    protected abstract zone: NgZone;

    @Input() threshold: number | string = 50;

    ngOnInit() {
        this.zone.runOutsideAngular(() => {
            this.scrollSub = fromEvent(this.getScrollContainer(), 'scroll', {capture: true, passive: true})
                .pipe(debounceTime(20))
                .subscribe((e: Event) => this.onScroll(e.target as HTMLElement));
        });
    }

    ngOnDestroy() {
        this.scrollSub && this.scrollSub.unsubscribe();
    }

    protected getScrollContainer() {
        return this.el ? this.el.nativeElement : document;
    }

    protected onScroll(target: HTMLElement) {
        if (!target || (this.el && target !== this.el.nativeElement) || !this.canLoadMore() || this.isLoading()) return;

        const offset = parseInt(this.threshold as string),
            targetCanScroll = this.el && (typeof target.scrollTop !== 'undefined');

        const currentScroll = targetCanScroll ?
            target.scrollTop + target.offsetHeight :
            window.scrollY + window.innerHeight;

        const heightWithoutOffset = targetCanScroll ?
            target.scrollHeight - offset :
            document.documentElement.scrollHeight - offset;

        if (currentScroll >= heightWithoutOffset) {
            this.zone.run(() => {
                this.loadMoreItems();
            });
        }
    }

    protected abstract loadMoreItems();

    protected abstract canLoadMore(): boolean;

    protected abstract isLoading(): boolean;
}
