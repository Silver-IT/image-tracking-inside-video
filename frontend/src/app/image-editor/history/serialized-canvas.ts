import {Frame} from '../tools/frame/frame';
import {FontItem} from '../../image-editor-ui/toolbar-controls/widgets/google-fonts-panel/font-item';

export interface SerializedCanvas {
    canvas: object|string;
    state?: object|string; // legacy, same as "canvas" prop above
    editor: {
        frame: Frame|null,
        fonts: FontItem[]
    };
    canvasWidth: number;
    canvasHeight: number;
}

export const DEFAULT_SERIALIZED_EDITOR_STATE = {
    frame: null,
    fonts: [],
};

