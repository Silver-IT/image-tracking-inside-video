import {InjectionToken} from '@angular/core';
import {Frame} from './tools/frame/frame';
import {BasicShape, defaultShapes} from './tools/shapes/default-shapes';
import {defaultStickers, StickerCategory} from './tools/shapes/default-stickers';
import {BrushSizes, BrushTypes} from './tools/draw/draw-defaults';
import {FontItem} from '../image-editor-ui/toolbar-controls/widgets/google-fonts-panel/font-item';
import {EditorMode} from './enums/editor-mode.enum';
import {EditorTheme} from './enums/editor-theme.enum';
import {NavPosition} from './enums/control-positions.enum';
import {DrawerName} from '../image-editor-ui/toolbar-controls/drawers/drawer-name.enum';
import {defaultObjectProps} from './objects/default-object-props';
import {SampleImage} from '../image-editor-ui/panels/open-sample-image-panel/sample-image';

export const MERGED_CONFIG = new InjectionToken<PixieConfig>('MERGED_CONFIG');

export const PIXIE_VERSION = '2.2.2';

export interface NavItem {
    /**
     * unique identifier for this navigation item.
     */
    name?: string;

    /**
     * Human readable name for this navigation item.
     */
    display_name?: string;

    /**
     * Action to perform when this nav item is clicked. Either name of panel to open or custom function.
     */
    action?: Function|DrawerName;

    /**
     * Name or url of icon for this navigation item.
     */
    icon?: string;

    /**
     * Whether this item is navigation button or separator.
     */
    type?: 'button'|'separator';
}

export type ToolbarItemAction = Function|'openBackgroundImage'|'openOverlayImage'|'openStateFile'|'exportImage'|'toggleHistory'|'toggleObjects'|'closeEditor';

export interface ToolbarItem {
    /**
     * Whether this item should be shown when editor is in compact mode.
     * https://support.vebto.com/help-center/articles/10/13/51/interface#compact-mode
     */
    showInCompactMode?: boolean;

    /**
     * Whether this item should only be shown when editor is in compact mode.
     * https://support.vebto.com/help-center/articles/10/13/51/interface#compact-mode
     */
    compactModeOnly?: boolean;

    /**
     * Type for this toolbar item.
     */
    type: 'button'|'zoomWidget'|'undoWidget'|'panelNameWidget'|'image';

    /**
     * Url for image when toolbar item type is set to "image".
     */
    src?: string;

    /**
     * Icon that should be shown for this item.
     */
    icon?: string;

    /**
     * Text that should be shown for this item.
     */
    text?: string;

    /**
     * Action that should be performed when user clicks on this item.
     */
    action?: ToolbarItemAction;

    /**
     * List of dropdown menu items that will be shown when this button is clicked.
     */
    dropdownItems?: {label: string, action: ToolbarItemAction}[];

    /**
     * Left margin for this toolbar in pixels.
     */
    marginLeft?: string;

    /**
     * Right margin for this toolbar in pixels.
     */
    marginRight?: string;

    /**
     * Condition that must be true for this item to show. Accepts config key and value.
     * For example: {'tools.zoom.allowUserZoom': true}
     */
    condition?: {[key: string]: string|boolean};
}

export interface ObjectDefaults {
    /**
     * Whether object resize handles should be solid or not.
     */
    transparentCorners?: boolean;

    /**
     * Whether object can be resized via corner handle (will change object aspect ratio).
     */
    lockUniScaling?: boolean;

    /**
     * Whether resize handles should be hidden when object is being dragged. 0 to 1.
     */
    borderOpacityWhenMoving?: number;

    /**
     * Whether resize handles should be round or square.
     */
    cornerStyle?: 'circle'|'rect';

    /**
     * Color for resize handles.
     */
    cornerColor?: string;

    /**
     * Color for border of resize handles.
     */
    cornerStrokeColor?: string;

    /**
     * Size for border of resize handles.
     */
    cornerSize?: number;

    /**
     * Object border color.
     */
    stroke?: string;

    /**
     * Object border width.
     */
    strokeWidth?: number;

    /**
     * Default object background color.
     */
    fill?: string;

    /**
     * Default align for text added via pixie.
     */
    textAlign?: 'initial'|'left'|'center'|'right'|'justify'|'justify-left'|'justify-center'|'justify-right';

    /**
     * Whether text should have an underline.
     */
    underline?: false;

    /**
     * Whether text should have a strikethrough line.
     */
    linethrough?: false;

    /**
     * Default font style for text added via pixie.
     */
    fontStyle?: 'normal'|'italic'|'oblique';

    /**
     * Default font family for text added via pixie.
     */
    fontFamily?: 'Times New Roman';

    /**
     * Default font weight text added via pixie.
     */
    fontWeight?: 'bold'|'normal'|100|200|300|400|500|600|700|800|900;
}

export interface PixieConfig {
    selector?: string;

    /**
     * Image or pixie state that should be loaded into editor with initial load.
     * Will accept url or image/state data.
    */
    image?: string|HTMLImageElement;

    /**
     * Whether images loaded into pixie will be hosted on another domain from where pixie is hosted.
     */
    crossOrigin?: boolean;

    /**
     * Opens new empty canvas at specified size. Alternative to image or pixie state.
     */
    blankCanvasSize?: {width: number; height: number};

    /**
     * Adds specified text as watermark on downloaded or exported image.
     */
    watermarkText?: string;

    /**
     * Maximum memory pixie will use when applying filters.
     * https://support.vebto.com/help-center/articles/10/45/164/filter-texture-size
     */
    textureSize?: number;

    /**
     * From where should pixie assets be loaded.
     * https://support.vebto.com/help-center/articles/10/45/150/specifying-base-url
     */
    baseUrl?: string;

    ui?: {
        /**
         * Whether pixie should be visible initially.
         */
        visible: boolean;

        /**
         * Pixie theme that should be used by default.
         */
        defaultTheme: string,

        /**
         * Whether inline or overlay mode should be used.
         */
        mode: EditorMode,

        /**
         * Whether user should be able to close editor while in overlay mode.
         */
        allowEditorClose?: boolean,

        /**
         * Width of pixie editor in pixels or percentages.
         */
        width?: string,

        /**
         * Height of pixie editor in pixels or percentages.
         */
        height?: string,

        /**
         * Whether compact mode should be used initially.
         * Compact mode will activate automatically if there is not enough screen space.
         */
        compact?: boolean,

        /**
         * When enabled, keyboard on mobile devices will not push pixie up on the screen.
         */
        ignoreMobileKeyboard?: boolean;

        /**
         * When user clicks on "save" button, show panel where image format, name and quality can be selected before download.
         */
        showExportPanel?: boolean,

        /**
         * Preset colors that will be shown in pixie color widgets.
         */
        colorPresets?: {
            /**
             * Lists of colors in hex or rgba format.
             */
            items: string[],

            /**
             * Whether default pixie colors should be overwritten with specified ones.
             */
            replaceDefault: boolean,
        },

        /**
         * Navigation bar configuration.
         */
        nav: {
            /**
             * At which predefined position should navigation bar be displayed.
             */
            position: NavPosition,

            /**
             * Whether specified navigation items should replace default ones.
             */
            replaceDefault?: boolean,

            /**
             * What Items should be shown in the navigation bar.
             */
            items: NavItem[],
        },

        /**
         * If not image or state is loaded into pixie, this panel can be opened to allow
         * user to select from sample images, upload new image, or enter blank canvas size.
         */
        openImageDialog?: {
            /**
             * Whether this panel should be shown.
             */
            show: boolean,

            /**
             * Sample images that user should be able to pick from.
             */
            sampleImages?: SampleImage[],
        },

        /**
         * Toolbar appearance and items configuration.
         */
        toolbar?: {
            /**
             * Whether toolbar should be visible.
             */
            hide?: boolean,

            /**
             * What items should appear on the left side of toolbar.
             */
            leftItems?: ToolbarItem[];

            /**
             * Which items should appear in toolbar center.
             */
            centerItems?: ToolbarItem[];

            /**
             * Which items should appear on the right side of toolbar.
             */
            rightItems?: ToolbarItem[];
        },
    };

    /**
     * Localization configuration.
     */
    languages?: {
        /**
         * Currently active language for the editor.
         */
        active: string,

        /**
         * List of custom language objects.
         */
        custom?: {[key: string]: {[key: string]: string}[]},
    };

    /**
     * On "save" button click pixie will automatically send image data to specified url.
     */
    saveUrl?: string;

    /**
     * Called when image is saved via save button, export panel or pixie API.
     */
    onSave?: Function;

    /**
     * Called when pixie editor is fully loaded.
     */
    onLoad?: Function;

    /**
     * Called when editor is closed (via pixie API or close button click)
     */
    onClose?: Function;

    /**
     * Called when editor is opened (via pixie API or custom open button)
     */
    onOpen?: Function;

    /**
     * Called whenever a new file (image or state) is opened via file picker.
     */
    onFileOpen?: Function;

    /**
     * Called when main image is loaded (or changed) in the editor.
     */
    onMainImageLoaded?: Function;

    /**
     * Google Fonts API key for font selector.
     */
    googleFontsApiKey?: string;

    tools?: {
        /**
         * Filter tool configuration.
         */
        filter?: {
            /**
             * Whether specified filters should replace default ones.
             */
            replaceDefault?: boolean,

            /**
             * Filters that should be shown in filter panel.
             */
            items: string[],
        },

        /**
         * Resize tool configuration.
         */
        resize?: {
            /**
             * Minimum width user should be able to resize image to.
             */
            minWidth?: number;

            /**
             * Maximum width user should be able to resize image to.
             */
            maxWidth?: number;

            /**
             * Minimum height user should be able to resize image to.
             */
            minHeight?: number;

            /**
             * Maximum height user should be able to resize image to.
             */
            maxHeight?: number;
        }

        crop?: {
            /**
             * Initial aspect ratio for cropzone.
             */
            defaultRatio?: string,

            /**
             * Whether user should be able to manually enter cropzone width and height.
             */
            hideCustomControls?: boolean,

            /**
             * Whether built-in cropzone aspect ratios should be overwritten with specified ones.
             */
            replaceDefaultPresets?: boolean,

            /**
             * Custom cropzone aspect ratios.
             */
            presets: {ratio: string, name: string}[],

            /**
             * Cropzone appearance and functionality configuration.
             */
            cropZone?: {
                /**
                 * Whether cropzone should be selectable by clicking on it.
                 */
                selectable: boolean,

                /**
                 * Whether cropzone can be moved horizontally.
                 */
                lockMovementX: boolean,

                /**
                 * Whether cropzone can be moved vertically.
                 */
                lockMovementY: boolean,

                /**
                 * Whether cropzone's width can changed by dragging its left or right side.
                 */
                lockScalingX: boolean,

                /**
                 * Whether cropzone's height can changed by dragging its top or bottom.
                 */
                lockScalingY: boolean,

                /**
                 * Whether cropzone's size can be changed by dragging its corners.
                 */
                lockUniScaling: boolean,

                /**
                 * Whether corner handles for changing cropzone size are visible.
                 */
                hasControls: boolean,

                /**
                 * Whether cropzone borders are visible.
                 */
                hasBorders: boolean,
            },
        },

        /**
         * Draw tool configuration.
         */
        draw: {
            /**
             * Whether default brush sizes should be replaced.
             */
            replaceDefaultBrushSizes?: boolean,

            /**
             * Whether default brush types should be replaced.
             */
            replaceDefaultBrushTypes?: boolean,

            /**
             * Brush sizes that user should be able to pick from.
             */
            brushSizes: number[],

            /**
             * Brush types that user should be able to pick from.
             */
            brushTypes: string[],
        }
        text?: {
            /**
             * Whether default fonts should be replaced with specified custom ones.
             */
            replaceDefaultItems?: boolean,

            /**
             * Text that should be added by default when clicking on "add text" button.
             */
            defaultText?: string,

            /**
             * Initially selected category in font picker.
             */
            defaultCategory?: string,

            /**
             * Custom fonts that should be shown in font picker.
             */
            items?: FontItem[],
        }

        frame?: {
            /**
             * Whether default frames should be replaced with specified custom ones.
             */
            replaceDefault?: boolean,

            /**
             * Custom frames that user should be able to add to the image.
             */
            items?: Frame[],
        },

        shapes?: {
            /**
             * Whether default shapes should be replaced with specified custom ones.
             */
            replaceDefault?: boolean,

            /**
             * Custom shapes that user should be able to add to the image.
             */
            items?: BasicShape[],
        },

        stickers?: {
            /**
             * Whether default sticker categories should be replaced with specified custom ones.
             */
            replaceDefault?: boolean,

            /**
             * Custom sticker categories and their stickers that should appear in stickers panel.
             */
            items?: StickerCategory[],
        },

        import?: {
            /**
             * File extensions user should be able to select when opening new image.
             */
            validExtensions?: string[],

            /**
             * Maximum file size when opening new image or state file.
             */
            maxFileSize?: number; // in bytes

            /**
             * Whether new image overlays should be automatically resized to fit available canvas space.
             */
            fitOverlayToScreen?: boolean;

            /**
             * When user drags image from desktop onto pixie, should that image be opened as background or overlay.
             */
            openDroppedImageAsBackground?: boolean;
        },

        export?: {
            /**
             * Which format should images be downloaded in by default.
             */
            defaultFormat: 'png'|'jpeg'|'json',

            /**
             * What compression level should be applied to downloaded images. 0 to 1.
             */
            defaultQuality: number,

            /**
             * Default file name for downloaded images.
             */
            defaultName: string,
        },

        zoom?: {
            /**
             * Whether user should be able to manually zoom in and out via toolbar buttons.
             */
            allowUserZoom?: boolean;

            /**
             * Whether new image should be automatically zoomed so it fits into available screen space.
             */
            fitImageToScreen?: boolean;

            /**
             * Whether user should be able to zoom out below original image size.
             */
            disableMinimumZoom?: boolean;
        }
    };

    /**
     * Default styles and behaviour for various objects in pixie.
     */
    objectDefaults?: {
        /**
         * Styles and behaviour for all objects.
         */
        global?: ObjectDefaults;

        /**
         * Styles and behaviour for new basic shapes (circle, triangle etc.)
         */
        basicShape?: ObjectDefaults;

        /**
         * Styles and behaviour for new stickers.
         */
        sticker?: ObjectDefaults;

        /**
         * Styles and behaviour for text added to image via pixie.
         */
        text?: ObjectDefaults;
    };
}

export const DEFAULT_CONFIG: PixieConfig = {
    selector: 'pixie-editor',
    textureSize: 4096,
    ui: {
        visible: true,
        mode: EditorMode.INLINE,
        defaultTheme: EditorTheme.LIGHT,
        ignoreMobileKeyboard: true,
        allowEditorClose: true,
        toolbar: {
            leftItems: [
                {
                    type: 'button',
                    icon: 'photo-library',
                    text: 'Open',
                    showInCompactMode: true,
                    dropdownItems: [
                        {action: 'openBackgroundImage', label: 'Background Image'},
                        {action: 'openOverlayImage', label: 'Overlay Image'},
                        {action: 'openStateFile', label: 'Editor Project File'},
                    ]
                },
                {
                    type: 'button',
                    icon: 'file-download',
                    text: 'Save',
                    action: 'exportImage',
                }
            ],
            centerItems: [
                {
                    type: 'zoomWidget',
                    condition: {'tools.zoom.allowUserZoom': true},
                },
                {
                    type: 'panelNameWidget',
                    compactModeOnly: true,
                }
            ],
            rightItems: [
                {
                    type: 'undoWidget'
                },
                {
                    type: 'button',
                    icon: 'history',
                    action: 'toggleHistory',
                    marginLeft: '40px',
                },
                {
                    type: 'button',
                    icon: 'layers',
                    action: 'toggleObjects',
                },
                {
                    type: 'button',
                    icon: 'close',
                    action: 'closeEditor',
                    marginLeft: '25px',
                    condition: {'ui.mode': 'overlay'},
                },
                {
                    type: 'button',
                    icon: 'file-download',
                    action: 'exportImage',
                    compactModeOnly: true,
                }
            ]
        },
        nav: {
            position: NavPosition.TOP,
            replaceDefault: false,
            items: [
                {name: 'filter', icon: 'filter-custom', action: DrawerName.FILTER},
                {type: 'separator'},
                {name: 'resize', icon: 'resize-custom', action: DrawerName.RESIZE},
                {name: 'crop', icon: 'crop-custom', action: DrawerName.CROP},
                {name: 'transform', icon: 'transform-custom', action: DrawerName.TRANSFORM},
                {type: 'separator'},
                {name: 'draw', icon: 'pencil-custom', action: DrawerName.DRAW},
                {name: 'text', icon: 'text-box-custom', action: DrawerName.TEXT},
                {name: 'shapes', icon: 'polygon-custom', action: DrawerName.SHAPES},
                {name: 'stickers', icon: 'sticker-custom', action: DrawerName.STICKERS},
                {name: 'frame', icon: 'frame-custom', action: DrawerName.FRAME},
                {type: 'separator'},
                {name: 'corners', icon: 'rounded-corner-custom', action: DrawerName.CORNERS},
                {name: 'background', icon: 'background-custom', action: DrawerName.BACKGROUND},
                {name: 'merge', icon: 'merge-custom', action: DrawerName.MERGE},
            ]
        },
        openImageDialog: {
            show: true,
            sampleImages: [
                {
                    url: 'images/samples/sample1.jpg',
                    thumbnail: 'images/samples/sample1_thumbnail.jpg',
                },
                {
                    url: 'images/samples/sample2.jpg',
                    thumbnail: 'images/samples/sample2_thumbnail.jpg',
                },
                {
                    url: 'images/samples/sample3.jpg',
                    thumbnail: 'images/samples/sample3_thumbnail.jpg',
                },
            ]
        },
        colorPresets: {
            replaceDefault: false,
            items: [
                'rgb(0,0,0)',
                'rgb(255, 255, 255)',
                'rgb(242, 38, 19)',
                'rgb(249, 105, 14)',
                'rgb(253, 227, 167)',
                'rgb(4, 147, 114)',
                'rgb(30, 139, 195)',
                'rgb(142, 68, 173)',
            ],
        }
    },
    languages: {
        active: 'default',
    },
    googleFontsApiKey: 'AIzaSyDOrI6VJiMbR6XLvlp3CdCPZj1T2PzVkKs',
    objectDefaults: {
        global: {
            transparentCorners: false,
            borderOpacityWhenMoving: 1,
            cornerStyle: 'circle',
            cornerColor: '#ccc',
            cornerStrokeColor: '#fff',
            cornerSize: 16,
            strokeWidth: 0.05,
            lockUniScaling: true,
            ...defaultObjectProps,
        },
        text: {
            textAlign: 'initial',
            underline: false,
            linethrough: false,
            fontStyle: 'normal',
            fontFamily: 'Times New Roman',
            fontWeight: 400,
        }
    },
    tools: {
        filter: {
            replaceDefault: false,
            items: [
                'grayscale',
                'blackWhite',
                'sharpen',
                'invert',
                'vintage',
                'polaroid',
                'kodachrome',
                'technicolor',
                'brownie',
                'sepia',
                'removeColor',
                'brightness',
                'gamma',
                'noise',
                'pixelate',
                'blur',
                'emboss',
                'blendColor',
            ]
        },
        zoom: {
            allowUserZoom: true,
            fitImageToScreen: true,
        },
        crop: {
            replaceDefaultPresets: false,
            hideCustomControls: false,
            defaultRatio: '16:9',
            presets: [
                {ratio: '3:2', name: '3:2'},
                {ratio: '5:3', name: '5:3'},
                {ratio: '4:3', name: '4:3'},
                {ratio: '5:4', name: '5:4'},
                {ratio: '6:4', name: '6:4'},
                {ratio: '7:5', name: '7:5'},
                {ratio: '10:8', name: '10:8'},
                {ratio: '16:9', name: '16:9'},
            ]
        },
        text: {
            defaultCategory: 'handwriting',
            defaultText: 'Double click to edit',
        },
        draw: {
            brushSizes: BrushSizes,
            brushTypes: BrushTypes,
        },
        shapes: {
            replaceDefault: false,
            items: defaultShapes.slice(),
        },
        stickers: {
            replaceDefault: false,
            items: defaultStickers,
        },
        import: {
            validExtensions: ['png', 'jpg', 'jpeg', 'svg', 'json', 'gif'],
            fitOverlayToScreen: true,
            openDroppedImageAsBackground: false,
        },
        export: {
            defaultFormat: 'png',
            defaultQuality: 0.8,
            defaultName: 'image',
        },
        frame: {
            replaceDefault: false,
            items: [
                {
                    name: 'basic',
                    mode: 'basic',
                    size: {
                        min: 1,
                        max: 35,
                        default: 10,
                    }
                },
                {
                    name: 'pine',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'oak',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'rainbow',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'grunge1',
                    display_name: 'grunge #1',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'grunge2',
                    display_name: 'grunge #2',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 20,
                    }
                },
                {
                    name: 'ebony',
                    mode: 'stretch',
                    size: {
                        min: 1,
                        max: 35,
                        default: 15,
                    }
                },
                {
                    name: 'art1',
                    display_name: 'Art #1',
                    mode: 'repeat',
                    size: {
                        min: 10,
                        max: 70,
                        default: 55,
                    },
                },
                {
                    name: 'art2',
                    display_name: 'Art #2',
                    mode: 'repeat',
                    size: {
                        min: 10,
                        max: 70,
                        default: 55,
                    },
                }
            ]
        }
    }
};
