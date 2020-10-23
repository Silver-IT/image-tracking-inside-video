import {APP_INITIALIZER, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ImageEditorComponent} from './image-editor.component';
import {HistoryPanelComponent} from './panels/history-panel/history-panel.component';
import {ObjectsPanelComponent} from './panels/objects-panel/objects-panel.component';
import {ImageEditorModule} from '../image-editor/image-editor.module';
import {ToolbarControlsModule} from './toolbar-controls/toolbar-controls.module';
import {EditorControlsService} from './toolbar-controls/editor-controls.service';
import {FloatingPanelsService} from './toolbar-controls/floating-panels.service';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule, MatIconRegistry} from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatSliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {CustomScrollbarModule} from '@common/core/ui/custom-scrollbar/custom-scrollbar.module';
import {OverlayPanel} from '@common/core/ui/overlay-panel/overlay-panel.service';
import {OverlayContainer} from '@angular/cdk/overlay';
import {EditorOverlayContainer} from './panels/editor-overlay-container';
import {OpenSampleImagePanelComponent} from './panels/open-sample-image-panel/open-sample-image-panel.component';
import {ReactiveFormsModule} from '@angular/forms';
import {BackgroundImageDirective} from './background-image.directive';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {DomSanitizer} from '@angular/platform-browser';
import {ExportPanelComponent} from './panels/export-panel/export-panel.component';
import {Settings} from '@common/core/config/settings.service';
import {ThemeService} from '@common/core/theme.service';
import {
    DEFAULT_DARK_COLORS,
    DEFAULT_LIGHT_COLORS,
    DEFAULT_THEMES
} from './default-themes';
import {CssTheme} from '@common/core/types/models/CssTheme';
import {UploadsModule} from '@common/uploads/uploads.module';
import cssVars from 'css-vars-ponyfill';
import { ImageLoadingPanelComponent } from './panels/image-loading-panel/image-loading-panel.component';
import { VideoBackgroundComponent } from './video/video.component';
import { VideoBackgroundService } from 'app/image-editor/video-background/video-background.service';
import { VideoControlsComponent } from './video/controls/video-controls.component';

export function init_icons(config: Settings, icons: MatIconRegistry, sanitizer: DomSanitizer, themes: ThemeService) {
    return () => {
        // init icons
        const url = config.getAssetUrl('icons/merged.svg', true);
        icons.addSvgIconSet(
            sanitizer.bypassSecurityTrustResourceUrl(url)
        );
        // init themes
        const customThemes = config.get('pixie.ui.themes') as CssTheme[],
            mergedThemes = {...DEFAULT_THEMES};
        if (customThemes && customThemes.length) {
            customThemes.forEach(theme => {
                const defaultColors = theme.is_dark ? DEFAULT_DARK_COLORS : DEFAULT_LIGHT_COLORS,
                    mergedTheme = {...theme, colors: {...defaultColors, ...theme.colors}};
                mergedThemes[mergedTheme.name] = mergedTheme;
            });
        }

        const rootEl = document.documentElement.querySelector('pixie-editor') as HTMLElement;

        themes.setRootEl(rootEl);
        themes.registerThemes(mergedThemes);

        const isNativeSupport = typeof window !== 'undefined' &&
            window['CSS'] &&
            window['CSS'].supports &&
            window['CSS'].supports('(--a: 0)');
        if ( ! isNativeSupport) {
            cssVars({variables: themes.selectedTheme$.value.colors});
        }
        return new Promise(resolve => resolve());
    };
}

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ImageEditorModule,
        ToolbarControlsModule,
        CustomScrollbarModule,

        // material
        MatSliderModule,
        MatRadioModule,
        MatButtonModule,
        MatIconModule,
        DragDropModule,
        MatTooltipModule,
        MatDialogModule,
        MatRadioModule,
        UploadsModule,
    ],
    declarations: [
        ImageEditorComponent,
        HistoryPanelComponent,
        ObjectsPanelComponent,
        OpenSampleImagePanelComponent,
        BackgroundImageDirective,
        ExportPanelComponent,
        ImageLoadingPanelComponent,
        VideoBackgroundComponent,
        VideoControlsComponent
    ],
    exports: [
        ImageEditorComponent,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: init_icons,
            deps: [Settings, MatIconRegistry, DomSanitizer, ThemeService],
            multi: true,
        },
        VideoBackgroundService,
        EditorControlsService,
        FloatingPanelsService,
        OverlayPanel,
        {provide: OverlayContainer, useClass: EditorOverlayContainer},
    ],
})
export class ImageEditorUIModule {}
