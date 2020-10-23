import {Injectable} from '@angular/core';
import {fabric} from 'fabric';
import {Filter, filtersList} from './filters-list';
import {CanvasService} from '../../canvas/canvas.service';
import {IBaseFilter, Image} from 'fabric/fabric-impl';
import {Actions, ofActionSuccessful, Store} from '@ngxs/store';
import {ApplyFilter, RemoveFilter, SetAppliedFilters} from '../../../image-editor-ui/state/filter/filter.actions';
import {HistoryChanged} from '../../../image-editor-ui/state/history/history.actions';
import {ObjectNames} from '../../objects/object-names.enum';
import {ucFirst} from '@common/core/utils/uc-first';

@Injectable()
export class FilterToolService {
    private filtersList = filtersList;

    constructor(
        private canvas: CanvasService,
        private store: Store,
        private actions$: Actions,
    ) {
        this.syncWithHistory();
    }

    public apply(filterName: string) {
        const filter = this.getByName(filterName);
        if (this.applied(filter.name)) {
            return this.remove(filter.name);
        }

        this.store.dispatch(new ApplyFilter(filter.name));
        const newFilter = this.create(filter);

        this.getImages().forEach(image => {
            image.filters.push(newFilter);
            image.applyFilters();
        });

        this.canvas.render();
    }

    public remove(filterName: string) {
        const filter = this.getByName(filterName);

        this.store.dispatch(new RemoveFilter(filter.name));
        this.getImages().forEach(image => {
            const i = this.findFilterIndex(filter.name, image.filters);
            image.filters.splice(i, 1);
            image.applyFilters();
        });

        this.canvas.render();
    }

    public getAll(): Filter[] {
        return this.filtersList;
    }

    public getByName(name: string): Filter {
        return this.filtersList.find(filter => filter.name === name);
    }

    public applied(name: string): boolean {
        const mainImage = this.canvas.getMainImage();
        if ( ! mainImage) return;
        return this.findFilterIndex(name, mainImage.filters) > -1;
    }

    public hasOptions(name: string) {
        return !!this.getByName(name).options;
    }

    private findFilterIndex(name: string, filters: IBaseFilter[]): number {
        if ( ! filters.length) return;

        const filter = this.getByName(name);

        return filters.findIndex(curr => {
            const type = curr.type.toLowerCase();

            // match by type
            if (type === name.toLowerCase()) return true;

            // match by matrix
            return type === 'convolute' && this.matrixAreEqual(filter.matrix, curr['matrix']);
        });
    }

    private matrixAreEqual(matrix1: number[], matrix2: number[]): boolean {
        if ( ! matrix1 || ! matrix2 || matrix1.length !== matrix2.length) return false;

        for (let i = matrix1.length; i--;) {
            if (matrix1[i] !== matrix2[i]) return false;
        }

        return true;
    }

    public applyValue(filterName: string, optionName: string, optionValue: number|string) {
        const filter = this.getByName(filterName);

        this.getImages().forEach(image => {
            const fabricFilter = image.filters.find(curr => {
                return curr.type.toLowerCase() === filter.name.toLowerCase();
            });

            fabricFilter[optionName] = optionValue;

            // filter has a special "resize" function that needs to be invoked
            if (filter.apply) filter.apply(fabricFilter, optionName, optionValue);

            image.applyFilters();
        });

        this.canvas.render();
    }

    public create(filter: Filter): IBaseFilter {
        const initialConfig = filter.initialConfig || {};
        if (filter.uses) {
            initialConfig.matrix = filter.matrix;
            return new fabric.Image.filters[ucFirst(filter.uses)](initialConfig);
        } else {
            for (const key in filter.options) {
                initialConfig[key] = filter.options[key].current;
            }
            return new fabric.Image.filters[ucFirst(filter.name)](initialConfig);
        }
    }

    public addCustom(name: string, filter: object, editableOptions?: object, initialConfig?: object) {
        fabric.Image.filters[ucFirst(name)] = fabric.util.createClass(fabric.Image.filters.BaseFilter, filter);
        fabric.Image.filters[ucFirst(name)].fromObject = fabric.Image.filters.BaseFilter['fromObject'];
        filtersList.push({name, options: editableOptions, initialConfig});
    }

    private getImages(): Image[] {
        return this.canvas.fabric().getObjects(ObjectNames.image.name) as Image[];
    }

    private syncWithHistory() {
        this.actions$.pipe(
            ofActionSuccessful(HistoryChanged),
        ).subscribe(() => {
            const names = this.getAll()
                .filter(filter => this.applied(filter.name))
                .map(filter => filter.name);
            this.store.dispatch(new SetAppliedFilters(names));
        });
    }
}
