import {StickerCategory} from '../../../image-editor/tools/shapes/default-stickers';

export class OpenStickerCategory {
    static readonly type = '[Editor.Stickers] Open Sticker Category';
    constructor(public category: StickerCategory) {}
}

export class MarkAsDirty {
    static readonly type = '[Editor.Stickers] Mark as Dirty';
}
