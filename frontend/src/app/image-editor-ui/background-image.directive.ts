import {AfterViewInit, Directive, ElementRef, Input} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {Settings} from 'common/core/config/settings.service';

@Directive({
    selector: '[backgroundImage]'
})
export class BackgroundImageDirective implements AfterViewInit {

    @Input('backgroundImage') url: string;

    constructor(
        private domSanitizer: DomSanitizer,
        private el: ElementRef,
        private config: Settings,
    ) {}

    ngAfterViewInit() {
        this.el.nativeElement.style.backgroundImage = this.getStyle();
    }

    private getStyle(): string {
        return 'url(' + this.config.getAssetUrl(this.url, true) + ')';
    }
}
