import {ITextOptions, Shadow} from 'fabric/fabric-impl';
import {FontItem} from '../../image-editor-ui/toolbar-controls/widgets/google-fonts-panel/font-item';

export interface PixieObjOptions extends Omit<ITextOptions, 'fontFamily'> {
    fontFamily?: FontItem|string;
    activeFont?: FontItem;
}

export function normalizeObjectProps(obj: PixieObjOptions): ITextOptions {
    const copy = {...obj};
    // no need to apply shadow, if it won't be visible
    if (copy.shadow && (copy.shadow as Shadow).offsetX === -1) {
        delete copy.shadow;
    }

    if (typeof copy.fontFamily === 'object') {
        copy.activeFont = copy.fontFamily;
        copy.fontFamily = copy.activeFont.family;
    }

    return copy as ITextOptions;
}
