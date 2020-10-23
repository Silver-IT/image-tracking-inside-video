import {FormBuilder} from '@angular/forms';

export class ActiveObjectForm {
    static build(fb: FormBuilder) {
        return fb.group({
            fill: [],
            backgroundColor: [],
            stroke: [],
            strokeWidth: [],
            opacity: [],
            shadow: fb.group({
                color: [],
                blur: [],
                offsetX: [],
                offsetY: [],
            }),
            textAlign: [],
            underline: [],
            linethrough: [],
            fontStyle: [],
            fontFamily: [],
            fontWeight: [],
        });
    }
}
