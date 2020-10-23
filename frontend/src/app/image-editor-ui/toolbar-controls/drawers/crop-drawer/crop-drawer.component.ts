import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {Settings} from '@common/core/config/settings.service';
import {CropZoneService} from '../../../../image-editor/tools/crop/crop-zone.service';
import {CanvasStateService} from '../../../../image-editor/canvas/canvas-state.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'crop-drawer',
    templateUrl: './crop-drawer.component.html',
    styleUrls: ['./crop-drawer.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {'class': 'controls-drawer'},
})
export class CropDrawerComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChildren('ratioPreview') ratioPreviews: QueryList<ElementRef>;

    public presets: {ratio: string, name: string}[];
    public cropzoneHeight: number;
    public cropzoneWidth: number;
    private subscription: Subscription;

    constructor(
        public cropZone: CropZoneService,
        public config: Settings,
        public canvasState: CanvasStateService,
        private cd: ChangeDetectorRef,
    ) {
        this.subscription = this.config.all$().subscribe(() => {
            this.presets = this.config.get('pixie.tools.crop.presets');
            this.cropZone.aspectRatio = this.config.get('pixie.tools.crop.defaultRatio');
        });
    }

    ngAfterViewInit() {
        this.ratioPreviews.forEach(el => {
            const adjusted = this.cropZone.getAdjustedSize(el.nativeElement.dataset.ratio, 40, 30);
            el.nativeElement.style.width = adjusted.width + 'px';
            el.nativeElement.style.height = adjusted.height + 'px';
        });
    }

    ngOnInit() {
        this.cropZone.draw();
        this.updateZoneSize();
        this.cropZone.resize$.subscribe(() => this.updateZoneSize());
    }

    ngOnDestroy() {
        this.cropZone.remove();
        this.subscription.unsubscribe();
    }

    public applyAspectRatio(aspectRatio: string) {
        this.cropZone.changeAspectRatio(aspectRatio);
        this.updateZoneSize();
    }

    private updateZoneSize() {
        const size = this.cropZone.getSize();
        this.cropzoneHeight = Math.floor(size.height);
        this.cropzoneWidth = Math.floor(size.width);
        this.cd.markForCheck();
    }

    public resizeCropzone() {
        this.cropZone.resize(this.cropzoneWidth || this.canvasState.original.width, this.cropzoneHeight);
    }
}
