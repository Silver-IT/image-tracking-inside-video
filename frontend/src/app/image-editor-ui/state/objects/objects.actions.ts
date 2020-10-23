export class OpenObjectSettingsPanel {
    static readonly type = '[Editor.Objects] Open Object Settings Panel';
    constructor(public panel: string) {}
}

export class MarkAsDirty {
    static readonly type = '[Editor.Objects] Mark as Dirty';
}