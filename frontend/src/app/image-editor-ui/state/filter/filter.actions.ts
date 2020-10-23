export class ApplyFilter {
    static readonly type = '[Editor.Filter] Toggle Filter';
    constructor(public filter: string) {}
}

export class RemoveFilter {
    static readonly type = '[Editor.Filter] Remove Filter';
    constructor(public filter: string) {}
}

export class OpenFilterControls {
    static readonly type = '[Editor.Filter] Open Filter Controls';
    constructor(public filter: string) {}
}

export class SetAppliedFilters {
    static readonly type = '[Editor.Filter] Set Applied Filters';
    constructor(public filters: string[]) {}
}

