import {IBaseFilter} from 'fabric/fabric-impl';

export interface Filter {
    name: string;
    uses?: string;
    options?: {[key: string]: any};
    initialConfig?: {[key: string]: any};
    matrix?: number[];
    apply?: Function;
}

export const filtersList: Filter[] = [
    {name: 'grayscale'},
    {name: 'blackWhite'},
    {
        name: 'sharpen',
        uses: 'Convolute',
        matrix: [0, -1, 0, -1, 5, -1, 0, -1, 0]
    },
    {name: 'invert'},
    {name: 'vintage'},
    {name: 'polaroid'},
    {name: 'kodachrome'},
    {name: 'technicolor'},
    {name: 'brownie'},
    {name: 'sepia'},
    {
        name: 'removeColor',
        options: {
            distance: {type: 'slider', current: 0.1, min: 0, max: 1, step: 0.01},
            color: {current: '#fff', type: 'colorPicker'}
        }
    },
    {
        name: 'brightness',
        options: {
            brightness: {type: 'slider', current: 0.1, min: -1, max: 1, step: 0.1}
        }
    },
    {
        name: 'gamma',
        options: {
            red: {type: 'slider', current: 0.1, min: 0.2, max: 2.2, step: 0.003921},
            green: {type: 'slider', current: 0.1, min: 0.2, max: 2.2, step: 0.003921},
            blue: {type: 'slider', current: 0.1, min: 0.2, max: 2.2, step: 0.003921},
        },
        apply: (filter: IBaseFilter, name: string, value: number) => {
            filter['gamma'] = [filter['red'], filter['green'], filter['blue']];
        }
    },
    {
        name: 'noise',
        options: {
            noise: {type: 'slider', current: 40, max: 600}
        }
    },
    {
        name: 'pixelate',
        options: {
            blocksize: {type: 'slider', min: 1, max: 40, current: 6}
        }
    },
    {
        name: 'blur',
        uses: 'Convolute',
        matrix: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9]
    },
    {
        name: 'emboss',
        uses: 'Convolute',
        matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
    },
    {
        name: 'blendColor',
        options: {
            mode: {current: 'add', type: 'select', available: ['add', 'multiply', 'subtract', 'diff', 'screen', 'lighten', 'darken']},
            alpha: {type: 'slider', current: 0.5, min: 0.1, max: 1, step: 0.1},
            color: {type: 'colorPicker', current: '#FF4081'}
        }
    }
];
