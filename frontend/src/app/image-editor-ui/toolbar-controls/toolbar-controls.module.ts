import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GoogleFontsModule} from './widgets/google-fonts-panel/google-fonts.module';
import {CustomScrollbarModule} from 'common/core/ui/custom-scrollbar/custom-scrollbar.module';
import {HttpModule} from 'common/core/http/http.module';
import {EditorControlsComponent} from './editor-controls.component';
import {FilterDrawerComponent} from './drawers/filter-drawer/filter-drawer.component';
import {ResizeDrawerComponent} from './drawers/resize-drawer/resize-drawer.component';
import {CropDrawerComponent} from './drawers/crop-drawer/crop-drawer.component';
import {TransformDrawerComponent} from './drawers/transform-drawer/transform-drawer.component';
import {DrawDrawerComponent} from './drawers/draw-drawer/draw-drawer.component';
import {TextDrawerComponent} from './drawers/text-drawer/text-drawer.component';
import {ColorWidgetComponent} from './widgets/color-widget/color-widget.component';
import {ShapesDrawerComponent} from './drawers/shapes-drawer/shapes-drawer.component';
import {TextControlsDrawerComponent} from './drawers/text-controls-drawer/text-controls-drawer.component';
import {ObjectSettingsDrawerComponent} from './object-settings/object-settings-drawer.component';
import {StickersDrawerComponent} from './drawers/stickers-drawer/stickers-drawer.component';
import {ShadowControlsDrawer} from './shadow-controls-drawer/shadow-controls-drawer.component';
import {NavigationBarComponent} from './navigation-bar/navigation-bar.component';
import {ToolbarComponent} from './toolbar/toolbar.component';
import {ColorControlsDrawerComponent} from './color-controls-drawer/color-controls-drawer.component';
import {TextureControlsDrawerComponent} from './drawers/texture-controls-drawer/texture-controls-drawer.component';
import {OutlineControlsDrawerComponent} from './outline-controls-drawer/outline-controls-drawer.component';
import {GradientControlsDrawerComponent} from './drawers/gradient-controls-drawer/gradient-controls-drawer.component';
import {FilterControlsComponent} from './drawers/filter-controls/filter-controls.component';
import {RoundDrawerComponent} from './drawers/round-drawer/round-drawer.component';
import {FrameDrawerComponent} from './drawers/frame-drawer/frame-drawer.component';
import {Toast} from 'common/core/ui/toast.service';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CanvasBackgroundDrawerComponent} from './drawers/canvas-background-drawer/canvas-background-drawer.component';
import {FloatingObjectControlsComponent} from '../floating-object-controls/floating-object-controls.component';
import {ImageEditorModule} from '../../image-editor/image-editor.module';
import {OpacityControlsDrawer} from './drawers/opacity-controls-drawer/opacity-controls-drawer.component';
import {TextFontSelectorComponent} from './widgets/text-font-selector/text-font-selector.component';
import {ImageOrIconModule} from '@common/core/ui/image-or-icon/image-or-icon.module';
import {CustomDrawerComponent} from './drawers/custom-drawer/custom-drawer.component';
import {BeColorPickerModule} from '@common/core/ui/color-picker/be-color-picker.module';
import { ToolbarZoomWidgetComponent } from './toolbar/toolbar-zoom-widget/toolbar-zoom-widget.component';
import { ToolbarItemComponent } from './toolbar/toolbar-item/toolbar-item.component';
import { ToolbarUndoWidgetComponent } from './toolbar/toolbar-undo-widget/toolbar-undo-widget.component';
import { ToolbarPanelNameWidgetComponent } from './toolbar/toolbar-panel-name-widget/toolbar-panel-name-widget.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        GoogleFontsModule,
        CustomScrollbarModule,
        HttpModule,
        ImageEditorModule,
        ImageOrIconModule,
        BeColorPickerModule,

        // material
        MatSliderModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatRadioModule,
        MatMenuModule,
        MatButtonToggleModule,
        MatTooltipModule,
    ],
    declarations: [
        EditorControlsComponent,
        FilterDrawerComponent,
        ResizeDrawerComponent,
        TransformDrawerComponent,
        CropDrawerComponent,
        DrawDrawerComponent,
        TextDrawerComponent,
        ColorWidgetComponent,
        TextControlsDrawerComponent,
        ShapesDrawerComponent,
        StickersDrawerComponent,
        ObjectSettingsDrawerComponent,
        ShadowControlsDrawer,
        OpacityControlsDrawer,
        NavigationBarComponent,
        ToolbarComponent,
        ColorControlsDrawerComponent,
        OutlineControlsDrawerComponent,
        TextureControlsDrawerComponent,
        GradientControlsDrawerComponent,
        FilterControlsComponent,
        RoundDrawerComponent,
        FrameDrawerComponent,
        CanvasBackgroundDrawerComponent,
        FloatingObjectControlsComponent,
        TextFontSelectorComponent,
        CustomDrawerComponent,
        ToolbarZoomWidgetComponent,
        ToolbarItemComponent,
        ToolbarUndoWidgetComponent,
        ToolbarPanelNameWidgetComponent,
    ],
    exports: [
        EditorControlsComponent,
        FilterDrawerComponent,
        ResizeDrawerComponent,
        TransformDrawerComponent,
        CropDrawerComponent,
        DrawDrawerComponent,
        TextDrawerComponent,
        ColorWidgetComponent,
        TextControlsDrawerComponent,
        ShapesDrawerComponent,
        StickersDrawerComponent,
        ObjectSettingsDrawerComponent,
        ShadowControlsDrawer,
        NavigationBarComponent,
        ToolbarComponent,
        ColorControlsDrawerComponent,
        OutlineControlsDrawerComponent,
        TextureControlsDrawerComponent,
        GradientControlsDrawerComponent,
        FilterControlsComponent,
        RoundDrawerComponent,
        FrameDrawerComponent,
        CanvasBackgroundDrawerComponent,
        FloatingObjectControlsComponent,
    ],
    providers: [
        Toast,
    ],
})
export class ToolbarControlsModule {
}
