export class AddShape {
    static readonly type = '[Editor.Shapes] Add Shape';
    constructor(public shape: string) {}
}