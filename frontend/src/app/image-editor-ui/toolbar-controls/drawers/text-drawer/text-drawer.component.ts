import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActiveObjectService} from '../../../../image-editor/canvas/active-object/active-object.service';
import {Store} from '@ngxs/store';
import {AddText} from '../../../state/text/text.actions';
import {GoogleFontsPanelService} from '../../widgets/google-fonts-panel/google-fonts-panel.service';
import {Settings} from '@common/core/config/settings.service';
import {FontItem} from '../../widgets/google-fonts-panel/font-item';

@Component({
    selector: 'text-drawer',
    templateUrl: './text-drawer.component.html',
    styleUrls: ['./text-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class TextDrawerComponent implements OnInit {
    constructor(
        private store: Store,
        public activeObject: ActiveObjectService,
        private googleFonts: GoogleFontsPanelService,
        private settings: Settings,
    ) {}

    ngOnInit(): void {
        let defaultFont = this.settings.get('pixie.objectDefaults.text.fontFamily') as string|FontItem;
        const customFonts = (this.settings.get('pixie.tools.text.items', []) as FontItem[])
                .filter(f => f.type === 'custom')
                .map(f => f.family.toLowerCase());
        if (defaultFont) {
            if (typeof defaultFont === 'string') {
                const isCustom = customFonts.includes(defaultFont.toLowerCase());
                defaultFont = {family: defaultFont, type: isCustom ? 'custom' : 'google'};
            }
            this.googleFonts.loadIntoDom([defaultFont]);
        }
    }

    public addText() {
        this.store.dispatch(new AddText());
    }
}
