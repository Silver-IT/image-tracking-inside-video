import {OverlayContainer} from '@angular/cdk/overlay';
import {Injectable} from '@angular/core';

@Injectable()
export class EditorOverlayContainer extends OverlayContainer {
    _createContainer(): void {
        const container = document.createElement('div');
        container.classList.add('editor-overlay-container', 'cdk-overlay-container');
        document.querySelector('image-editor').appendChild(container);
        this._containerElement = container;
    }
}
