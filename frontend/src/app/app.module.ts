import {BrowserModule} from '@angular/platform-browser';
import {ApplicationRef, ErrorHandler, Injector, NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Settings} from 'common/core/config/settings.service';
import {MERGED_CONFIG} from './image-editor/default-settings';
import {ImageEditorUIModule} from './image-editor-ui/image-editor-ui.module';
import {noBackendErrorHandlerFactory} from 'common/core/errors/no-backend-error-handler';

@NgModule({
    declarations: [
        AppComponent
    ],
    entryComponents: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        ImageEditorUIModule,
        BrowserAnimationsModule,
    ],
    providers: [
        {
            provide: ErrorHandler,
            useFactory: noBackendErrorHandlerFactory,
            deps: [Settings],
        },
    ],
})
export class AppModule {
    constructor(private injector: Injector) {}

    ngDoBootstrap(app: ApplicationRef) {
        const selector = this.injector.get(MERGED_CONFIG).selector;
        app.bootstrap(AppComponent, selector);
    }
}
