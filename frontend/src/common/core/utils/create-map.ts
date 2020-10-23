export function createMap<K, V extends {id: number}>(items: V[]): Map<number, V> {
    return new Map((items || []).map(item => [item.id, item]));
}
