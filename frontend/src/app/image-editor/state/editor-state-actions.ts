import {DrawerName} from '../../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';

export class OpenEditor {
    static readonly type = '[Editor] Open';
}

export class CloseEditor {
    static readonly type = '[Editor] Close';
    constructor(public executeCallback = true) {}
}

export class OpenPanel {
    static readonly type = '[Editor] Open Panel';
    constructor(public panel: DrawerName) {}
}

export class CloseForePanel {
    static readonly type = '[Editor] Close Fore Panel';
}

export class ResetToolState {
    static readonly type = '[Editor] Reset Tool State';
}

export class ApplyChanges {
    static readonly type = '[Editor] Apply Changes';
    public constructor(public panel: DrawerName, public closePanel = true) {}
}

export class CancelChanges {
    static readonly type = '[Editor] Cancel Changes';
    public constructor(public panel: DrawerName) {}
}

export class ObjectSelected {
    static readonly type = '[Editor] Object Selected';
    // "fromUserAction" is true if event originated from user action (click, tap etc.)
    constructor(public objectType: string, public fromUserAction: boolean) {}
}

export class ObjectDeselected {
    static readonly type = '[Editor] Object Deselected';
    // "fromUserAction" is true if event originated from user action (click, tap etc.)
    constructor(public fromUserAction: boolean) {}
}

export class ContentLoaded {
    static readonly type = '[Editor] Content Loaded';
    constructor(public status = true) {}
}

export class ObjectsSynced {
    static readonly type = '[Editor] Objects Synced';
}

export class SetZoom {
    static readonly type = '[Editor] Set Zoom';
    constructor(public zoom: number) {}
}
