import {Action, NgxsAfterBootstrap, Selector, State, StateContext} from '@ngxs/store';
import {
    CloseEditor,
    CloseForePanel,
    ObjectDeselected,
    ObjectSelected,
    OpenEditor,
    OpenPanel,
    SetZoom
} from './editor-state-actions';
import {
    ObjectsState,
    ObjectsStateModel
} from '../../image-editor-ui/state/objects/objects.state';
import {DrawerName} from '../../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';
import {FilterState} from '../../image-editor-ui/state/filter/filter.state';
import {EditorMode} from '../enums/editor-mode.enum';
import {NavItem, PixieConfig} from '../default-settings';
import {NavPosition} from '../enums/control-positions.enum';
import {ResizeState} from '../../image-editor-ui/state/resize/resize.state';
import {CropState} from '../../image-editor-ui/state/crop/crop.state';
import {ShapesState} from '../../image-editor-ui/state/shapes/shapes.state';
import {TransformState} from '../../image-editor-ui/state/transform/transform.state';
import {FrameState} from '../../image-editor-ui/state/frame/frame.state';
import {DrawState} from '../../image-editor-ui/state/draw/draw.state';
import {StickersState} from '../../image-editor-ui/state/stickers/stickers.state';
import {CornersState} from '../../image-editor-ui/state/corners/corners.state';
import {BackgroundState} from '../../image-editor-ui/state/background/background.state';
import {TextState} from '../../image-editor-ui/state/text/text.state';
import {ActiveObjectService} from '../canvas/active-object/active-object.service';
import {Settings} from '@common/core/config/settings.service';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {Injectable} from '@angular/core';
import {Breakpoints} from '@angular/cdk/layout';

interface EditorStateModel {
    visible?: boolean;
    mode: EditorMode;
    hideToolbar: boolean;
    activePanel: DrawerName;
    navItems: NavItem[];
    navPosition: NavPosition;
    objectSettings?: ObjectsStateModel;
    activeObjIsText?: boolean;
    activeObjIsSvg?: boolean;
    activeObjIsImage?: boolean;
    activeObjId?: string;
    zoom: number;
}

@State<EditorStateModel>({
    name: 'imageEditor',
    defaults: {
        mode: EditorMode.INLINE,
        hideToolbar: false,
        activePanel: DrawerName.SHAPES, // DrawerName.NAVIGATION,
        navItems: [],
        navPosition: NavPosition.TOP,
        activeObjIsText: false,
        activeObjIsSvg: false,
        activeObjIsImage: false,
        activeObjId: null,
        zoom: 100,
    },
    children: [
        FilterState,
        ResizeState,
        CropState,
        TransformState,
        DrawState,
        TextState,
        ShapesState,
        StickersState,
        FrameState,
        CornersState,
        BackgroundState,
        ObjectsState
    ],
})
@Injectable()
export class EditorState implements NgxsAfterBootstrap {
    @Selector()
    static visible(state: EditorStateModel) {
        return state.visible;
    }

    @Selector()
    static mode(state: EditorStateModel) {
        return state.mode;
    }

    @Selector()
    static navItems(state: EditorStateModel) {
        return state.navItems;
    }

    @Selector()
    static navPosition(state: EditorStateModel) {
        return state.navPosition;
    }

    @Selector()
    static toolbarHidden(state: EditorStateModel) {
        return state.hideToolbar;
    }

    @Selector()
    static activePanel(state: EditorStateModel) {
        return state.activePanel;
    }

    @Selector()
    static dirty(state: EditorStateModel) {
        const subState = state[state.activePanel];
        return subState.dirty;
    }

    @Selector()
    static zoom(state: EditorStateModel) {
        return state.zoom;
    }

    @Selector()
    static activeObjIsText(state: EditorStateModel) {
        return state.activeObjIsText;
    }

    @Selector()
    static activeObjIsSvg(state: EditorStateModel) {
        return state.activeObjIsSvg;
    }

    @Selector()
    static activeObjIsImage(state: EditorStateModel) {
        return state.activeObjIsImage;
    }

    @Selector()
    static activeObjId(state: EditorStateModel) {
        return state.activeObjId;
    }

    constructor(
        private config: Settings,
        private breakpoints: BreakpointsService,
        private activeObject: ActiveObjectService,
    ) {}

    ngxsAfterBootstrap(ctx: StateContext<EditorStateModel>) {
        this.listenToConfigChange(ctx);
        this.listenToBreakpointChange(ctx);
    }

    @Action(OpenEditor)
    openEditor(ctx: StateContext<EditorStateModel>) {
        ctx.patchState({visible: true});
        this.config.set('pixie.ui.visible', true);
        this.executeCallback('onOpen');
    }

    @Action(CloseEditor)
    closeEditor(ctx: StateContext<EditorStateModel>, {executeCallback}: CloseEditor) {
        let shouldClose = this.config.get('pixie.ui.allowEditorClose');
        if (executeCallback) {
            shouldClose = this.executeCallback('onClose') !== false;
        }
        if (shouldClose) {
            ctx.patchState({visible: false});
            this.config.set('pixie.ui.visible', false);
        }
    }

    @Action(OpenPanel)
    openPanel(ctx: StateContext<EditorStateModel>, action: OpenPanel) {
        ctx.patchState({
            activePanel: action.panel,
        });
    }

    @Action(CloseForePanel)
    closeForePanel(ctx: StateContext<EditorStateModel>) {
        // navigation panel should always stay open
        ctx.patchState({activePanel: DrawerName.NAVIGATION});
    }

    @Action(ObjectSelected)
    objectSelected(ctx: StateContext<EditorStateModel>, action: ObjectSelected) {
        const state = this.getActiveObjState();

        // only open settings panel if selection event originated from
        // user clicking or tapping object on the canvas and not from
        // selecting object programmatically in the app
        if (action.fromUserAction && ctx.getState().activePanel === DrawerName.NAVIGATION) {
            state.activePanel = DrawerName.OBJECT_SETTINGS;
        }

        ctx.patchState(state);

        // sync active object form, when new object is selected
        this.activeObject.syncForm();
    }

    @Action(ObjectDeselected)
    objectDeselected(ctx: StateContext<EditorStateModel>) {
        const state = this.getActiveObjState();

        if (ctx.getState().activePanel === DrawerName.OBJECT_SETTINGS && !ctx.getState().objectSettings.dirty) {
            state.activePanel = DrawerName.NAVIGATION;
        }

        ctx.patchState(state);

        // sync active object form, when object is deselected
        this.activeObject.syncForm();
    }

    @Action(SetZoom)
    setZoom(ctx: StateContext<EditorStateModel>, {zoom}: SetZoom) {
        ctx.patchState({zoom});
    }

    private executeCallback(name: 'onClose'|'onOpen') {
        const callback = this.config.get('pixie.' + name) as Function;
        return callback && callback();
    }

    private listenToBreakpointChange(ctx: StateContext<EditorStateModel>) {
        this.breakpoints.observe(Breakpoints.XSmall).subscribe(() => {
            ctx.patchState({
                navPosition: this.getNavPosition()
            });
        });
    }

    private listenToConfigChange(ctx: StateContext<EditorStateModel>) {
        this.config.all$().subscribe(() => {
            const config = this.config.get('pixie') as PixieConfig;
            ctx.patchState({
                mode: config.ui.mode,
                hideToolbar: config.ui.toolbar.hide,
                visible: config.ui.visible,
                navItems: config.ui.nav.items,
                navPosition: this.getNavPosition(),
            });
        });
    }

    private getNavPosition(): NavPosition {
        const defaultPos = this.config.get('pixie.ui.nav.position', NavPosition.TOP);
        return (this.breakpoints.isMobile$.value && defaultPos !== NavPosition.NONE) ? NavPosition.BOTTOM : defaultPos;
    }

    private getActiveObjState() {
        const obj = this.activeObject.get();

        const state = {
            activeObjId: null,
            activeObjIsText: false,
            activeObjIsSvg: false,
        } as EditorStateModel;

        if (obj) {
            state.activeObjId = obj.data.id;
            state.activeObjIsText = obj.type === 'i-text';
            state.activeObjIsSvg = obj.type === 'group' && obj['svgUid'];
            state.activeObjIsImage = obj.type === 'image';
        }

        return state;
    }
}
