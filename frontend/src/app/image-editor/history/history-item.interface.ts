import {SerializedCanvas} from './serialized-canvas';

export interface HistoryItem extends SerializedCanvas {
    name: string;
    id: string;
    icon: string;
    zoom: number;
    activeObjectId?: string;
}
