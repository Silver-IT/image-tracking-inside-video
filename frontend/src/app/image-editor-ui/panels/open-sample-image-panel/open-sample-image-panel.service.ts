import {ElementRef, Injectable} from '@angular/core';
import {Settings} from 'common/core/config/settings.service';
import {OpenSampleImagePanelComponent} from './open-sample-image-panel.component';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {CanvasStateService} from '../../../image-editor/canvas/canvas-state.service';
import {Store} from '@ngxs/store';
import {EditorState} from '../../../image-editor/state/editor-state';

@Injectable({
    providedIn: 'root',
})
export class OpenSampleImagePanelService {
    private sampleImagePanelRef: OverlayPanelRef<OpenSampleImagePanelComponent>;

    constructor(
        private canvasState: CanvasStateService,
        private config: Settings,
        private overlayPanel: OverlayPanel,
        private store: Store,
    ) {}

    public open() {
        if ( ! this.shouldShowOpenImageDialog()) return;

        const positionStrategy = this.overlayPanel.overlay.position()
            .flexibleConnectedTo(new ElementRef(this.canvasState.wrapperEl))
            .withPositions([{overlayX: 'center', overlayY: 'center', originX: 'center', originY: 'center'}]);

        this.sampleImagePanelRef = this.overlayPanel.open(
            OpenSampleImagePanelComponent,
            {
                hasBackdrop: true,
                closeOnBackdropClick: false,
                positionStrategy: positionStrategy,
                panelClass: ['floating-panel', 'sample-image-panel']
            }
        );

        this.sampleImagePanelRef.afterClosed().subscribe(() => {
            this.sampleImagePanelRef = null;
        });
    }

    public reposition() {
        if ( ! this.sampleImagePanelRef) return;
        this.sampleImagePanelRef.updatePosition();
    }

    /**
     * Check if "open image" dialog window should be shown.
     */
    private shouldShowOpenImageDialog() {
        return this.store.selectSnapshot(EditorState.visible) &&
            !this.sampleImagePanelRef;
    }
}
