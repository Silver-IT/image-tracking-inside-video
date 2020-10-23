import {Injectable} from '@angular/core';
import {Settings} from '@common/core/config/settings.service';
import * as WebFont from 'webfontloader';
import {FontsPaginatorService} from './fonts-paginator.service';
import {map} from 'rxjs/operators';
import {HttpCacheClient} from '@common/core/http/http-cache-client';
import {FontItem} from './font-item';

@Injectable()
export class GoogleFontsPanelService {
    private loadedFonts: FontItem[] = [];

    constructor(
        private http: HttpCacheClient,
        private settings: Settings,
        public paginator: FontsPaginatorService,
    ) {
        this.paginator.current$.subscribe(fonts => {
            this.loadIntoDom(fonts);
        });
    }

    public async init() {
        let allFonts = this.settings.get('pixie.tools.text.items', []);

        if ( ! this.settings.get('pixie.tools.text.replaceDefault')) {
            allFonts = allFonts.concat(await this.getGoogleFonts());
        }

        this.paginator.setFonts(allFonts);
    }

    /**
     * Load specified google fonts into the DOM.
     */
    public loadIntoDom(names: FontItem[] = [], context?: Window): Promise<any> {
        return new Promise(resolve => {
            if ( ! names || ! names.length) return resolve();

            // remove already loaded fonts
            names = names.filter(curr => !this.loadedFonts.find(font => font.family === curr.family));
            if ( ! names.length) return resolve();
            this.loadedFonts = this.loadedFonts.concat(names);

            const google = names.filter(font => font.type === 'google');
            const custom = names.filter(font => font.type === 'custom');

            const config = {
                active: resolve,
                context: context as any,
                classes: false,
            };

            if (google.length) {
                config['google'] = {families: google.map(font => font.family)};
            }

            if (custom.length) {
                this.loadCustomFonts(custom, context);
                config['custom'] = {families: custom.map(font => font.family)};
            }

            WebFont.load(config);
        });
    }

    /**
     * Load custom fonts via font-face css property.
     */
    private loadCustomFonts(fonts: FontItem[] = [], context?: Window) {
        if ( ! fonts.length) return;
        let style = '';

        fonts.forEach(font => {
            const url = this.settings.getAssetUrl('fonts/' + font.filePath, true);
            style += '@font-face { font-family: ' + font.family + '; src: url("' + url + '"); }';
        });

        const styleEl = document.createElement('style');
        styleEl.innerHTML = style;
        (context || window).document.head.appendChild(styleEl);
    }

    /**
     * Get list of all google fonts.
     */
    private getGoogleFonts(): Promise<FontItem[]> {
        const key = this.settings.get('pixie.googleFontsApiKey');
        return this.http.getWithCache('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=' + key)
            .pipe(map(response => {
                return response['items'].map(font => {
                    return {family: font.family, category: font.category, type: 'google'};
                });
            })).toPromise();
    }
}
