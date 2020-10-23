import {ElementRef, Injectable} from '@angular/core';
import {OverlayPanel} from 'common/core/ui/overlay-panel/overlay-panel.service';
import {OverlayPanelRef} from 'common/core/ui/overlay-panel/overlay-panel-ref';
import {ObjectsPanelComponent} from '../panels/objects-panel/objects-panel.component';
import {CanvasStateService} from '../../image-editor/canvas/canvas-state.service';
import {OpenSampleImagePanelService} from '../panels/open-sample-image-panel/open-sample-image-panel.service';
import {HistoryPanelComponent} from '../panels/history-panel/history-panel.component';
import {ExportPanelComponent} from '../panels/export-panel/export-panel.component';
import {OverlayPanelConfig} from '@common/core/ui/overlay-panel/overlay-panel-config';
import {BreakpointsService} from '@common/core/ui/breakpoints.service';
import {Modal} from '@common/core/ui/dialogs/modal.service';
import {ImageLoadingPanelComponent} from '../panels/image-loading-panel/image-loading-panel.component';

@Injectable()
export class FloatingPanelsService {
    private historyPanelRef: OverlayPanelRef<HistoryPanelComponent>;
    private objectsPanelRef: OverlayPanelRef<ObjectsPanelComponent>;
    private imageLoadingPanelRef: OverlayPanelRef<ImageLoadingPanelComponent>;

    constructor(
        private overlayPanel: OverlayPanel,
        private state: CanvasStateService,
        private openSampleImageDialog: OpenSampleImagePanelService,
        private breakpoints: BreakpointsService,
        private dialog: Modal,
    ) {}

    public openSampleImagePanel() {
        this.openSampleImageDialog.open();
    }

    public openExportPanel() {
        this.dialog.open(ExportPanelComponent, null, {panelClass: 'export-panel-dialog-container'});
    }

    public toggleHistory() {
        this.closePanel('objects');

        if (this.panelIsOpen('history')) {
            this.historyPanelRef.close();
        } else {
            this.openHistoryPanel();
        }
    }

    public toggleObjects() {
        this.closePanel('history');

        if (this.panelIsOpen('objects')) {
            this.objectsPanelRef.close();
        } else {
            this.openObjectsPanel();
        }
    }

    public openHistoryPanel() {
        this.historyPanelRef = this.overlayPanel.open(
            HistoryPanelComponent,
            this.getPanelConfig(),
        );
    }

    public openObjectsPanel() {
        this.objectsPanelRef = this.overlayPanel.open(
            ObjectsPanelComponent,
            this.getPanelConfig(),
        );
    }

    public closePanel(name: 'history' | 'objects' | 'objectOptions') {
        switch (name) {
            case 'history':
                this.historyPanelRef && this.historyPanelRef.close();
                break;
            case 'objects':
                this.objectsPanelRef && this.objectsPanelRef.close();
                break;
        }
    }

    public panelIsOpen(name: 'history' | 'objects'): boolean {
        const ref = (name === 'history' ? this.historyPanelRef : this.objectsPanelRef);
        return ref && ref.isOpen();
    }

    private getPanelConfig(): OverlayPanelConfig {
        return {
            hasBackdrop: false,
            positionStrategy: this.getPositionStrategy(),
            panelClass: ['floating-panel-container', this.breakpoints.isMobile$.value ? 'is-mobile' : null],
        };
    }

    private getPositionStrategy() {
        if (this.breakpoints.isMobile$.value) {
            return this.overlayPanel.overlay.position()
                .flexibleConnectedTo(new ElementRef(this.state.wrapperEl))
                .withPositions([{overlayX: 'center', overlayY: 'center', originX: 'center', originY: 'center'}]);
        }

        return this.overlayPanel.overlay.position()
            .flexibleConnectedTo(new ElementRef(this.state.wrapperEl))
            .withPositions([{
                overlayX: 'end',
                overlayY: 'bottom',
                originX: 'end',
                originY: 'bottom',
                offsetY: -10,
                offsetX: -10
            }]);
    }

    public toggleImageLoading() {
        if ( ! this.imageLoadingPanelRef) {
            this.imageLoadingPanelRef = this.overlayPanel.open(ImageLoadingPanelComponent, {});
        } else {
            this.imageLoadingPanelRef.close();
            this.imageLoadingPanelRef = null;
        }
    }
}
