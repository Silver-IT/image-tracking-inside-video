import {arraysAreEqual} from './arrays-are-equal';

export function objectsAreEqual(a: object, b: object, strict = true): boolean {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);

    if (aProps.length !== bProps.length) {
        return false;
    }

    for (let i = 0; i < aProps.length; i++) {
        const propName = aProps[i],
            propA = a[propName],
            propB = b[propName];

        // variable types must match
        if (propA != null && propB != null) {
            if (propA.constructor !== propB.constructor) return false;

            // compare arrays
            if (propA.constructor === Array) {
                return arraysAreEqual(a[propName], b[propName]);
            }
        }

        // If values of same property are not equal, objects are not equivalent
        if (strict) {
            if (a[propName] !== b[propName]) return false;
        } else {
            if (a[propName] != b[propName]) return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}
