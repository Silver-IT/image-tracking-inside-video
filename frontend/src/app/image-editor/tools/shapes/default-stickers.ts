import {emoticonsList} from './emoticons';

export interface StickerCategory {
    name: string;
    items?: number;
    list?: string[];
    type: 'svg' | 'png';
    thumbnailUrl?: string;
    darkBg?: boolean;
}

export const defaultStickers: StickerCategory[] = [
    {name: 'emoticons', list: emoticonsList, type: 'svg', thumbnailUrl: 'images/ui/emoticon.svg'},
    {name: 'doodles', items: 100, type: 'svg', thumbnailUrl: 'images/ui/doodles.svg'},
    {name: 'landmarks', items: 100, type: 'svg', thumbnailUrl: 'images/ui/landmark.svg'},
    {name: 'stars', items: 6, type: 'png', darkBg: true, thumbnailUrl: 'images/ui/star.svg'},
    {name: 'clouds', items: 15, type: 'png', darkBg: true, thumbnailUrl: 'images/ui/clouds.svg'},
    {name: 'bubbles', items: 104, type: 'png', thumbnailUrl: 'images/ui/speech-bubble.svg'},
    {name: 'transportation', items: 22, type: 'svg', thumbnailUrl: 'images/ui/transportation.svg'},
    {name: 'beach', items: 22, type: 'svg', thumbnailUrl: 'images/ui/beach.svg'},
];
