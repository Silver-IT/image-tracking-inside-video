import {IObjectOptions, IText, ITextOptions, Object, Shadow} from 'fabric/fabric-impl';
import {defaultObjectProps} from '../objects/default-object-props';

export function getFabricObjectProps(obj: Object) {
    if ( ! obj) return {};
    const shadow = obj.shadow as Shadow;

    const props = {
        fill: obj.fill,
        opacity: obj.opacity,
        backgroundColor: obj.backgroundColor,
        stroke: obj.stroke,
        strokeWidth: obj.strokeWidth,
    } as ITextOptions;

    if (shadow) {
        props.shadow = {
            color: shadow.color || defaultObjectProps.shadow.color,
            blur: shadow.blur || defaultObjectProps.shadow.blur,
            offsetX: shadow.offsetX || defaultObjectProps.shadow.offsetX,
            offsetY: shadow.offsetY || defaultObjectProps.shadow.offsetY,
        };
    }

    if (obj.type === 'i-text') {
        const text = obj as IText;
        props.textAlign = text.textAlign;
        props.underline = text.underline;
        props.linethrough = text.linethrough;
        props.fontStyle = text.fontStyle;
        props.fontFamily = text.fontFamily;
        props.fontWeight = text.fontWeight;
    }

    return props;
}
