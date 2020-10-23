export interface FontItem {
    family: string;
    category?: 'display'|'handwriting'|'monospace'|'serif'|'sans-serif';
    filePath?: string;
    type: 'basic'|'google'|'custom';
}
