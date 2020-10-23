import {ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {delay, finalize} from 'rxjs/operators';
import {TextEditorComponent} from '@common/text-editor/text-editor.component';
import {CustomPage} from '@common/core/types/models/CustomPage';
import {Pages} from '@common/core/pages/shared/pages.service';
import {Toast} from '@common/core/ui/toast.service';
import {BehaviorSubject} from 'rxjs';
import {FormBuilder} from '@angular/forms';
import {CUSTOM_PAGE_CONFIG_TOKEN, CustomPageManagerConfig} from '@common/core/pages/manager/custom-page-config';
import {bindSlugTo} from '@common/shared/form-controls/slug-control/bind-slug-to';
import {BackendErrorResponse} from '@common/core/types/backend-error-response';

@Component({
    selector: 'crupdate-page',
    templateUrl: './crupdate-page.component.html',
    styleUrls: ['./crupdate-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrupdatePageComponent implements OnInit {
    @ViewChild(TextEditorComponent) textEditor: TextEditorComponent;
    public loading$ = new BehaviorSubject<boolean>(false);
    public updating$ = new BehaviorSubject<boolean>(false);
    public page: CustomPage;
    public form = this.fb.group({
        title: [''],
        slug: [''],
        body: [''],
        type: [''],
    });
    public errors$ = new BehaviorSubject<{
        body?: string,
        slug?: string,
        title?: string,
    }>({});

    constructor(
        private pages: Pages,
        private route: ActivatedRoute,
        private toast: Toast,
        private router: Router,
        private fb: FormBuilder,
        @Inject(CUSTOM_PAGE_CONFIG_TOKEN) public config: CustomPageManagerConfig[],
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.getPage(params.id);
        });

        bindSlugTo(this.form.get('title'));
    }

    public crupdatePage() {
        this.loading$.next(true);
        const request = this.updating$.value ?
            this.pages.update(this.page.id, this.getPayload()) :
            this.pages.create(this.getPayload());

        request.pipe(finalize(() => this.loading$.next(false)))
            .subscribe(() => {
                this.router.navigate(this.backRoute(), {relativeTo: this.route});
                this.toast.open(this.updating$.value ? 'Page updated' : 'Page created');
            }, (errResponse: BackendErrorResponse) => this.errors$.next(errResponse.errors));
    }

    public getPage(id: number) {
        if ( ! id) return;
        this.loading$.next(true);
        this.pages.get(id).pipe(delay(0)).subscribe(response => {
            this.updating$.next(true);
            this.page = response.page;
            this.form.patchValue(response.page);
            this.textEditor.setContents(response.page.body || '');
            this.loading$.next(false);
        });
    }

    private getPayload(): CustomPage {
        const payload = {...this.form.value};
        if ( ! payload.type) {
            payload.type = this.config[0].type;
        }
        return payload;
    }

    public setBody(content: string) {
        this.form.patchValue({body: content});
    }

    public backRoute() {
        return this.page ? ['../../'] : ['../'];
    }

    public slugPrefix() {
        return 'pages/' + (this.page ? this.page.id : '*');
    }
}
