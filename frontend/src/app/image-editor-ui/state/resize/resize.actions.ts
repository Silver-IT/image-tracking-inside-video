export class SetResizeDimensions {
    static readonly type = '[Editor.Resize] Set Resize Dimensions';
    constructor(public params: {
        width: number,
        height: number,
        usePercentages: boolean,
        maintainAspectRatio: boolean
    }) {}
}