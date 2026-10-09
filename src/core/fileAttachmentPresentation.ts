/** VS Code-only filename hints. These are editable presentation suggestions,
 * never Core evidence classification, MIME verification or custody authority. */
export function suggestedMaterialKind(filename: string): string {
  const extension = String(filename || '').split(/[\\/]/).pop()?.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || '';
  const kinds: Record<string, string> = {
    png: 'PNG image', jpg: 'JPEG image', jpeg: 'JPEG image', webp: 'WebP image',
    gif: 'GIF image', svg: 'SVG image', mp4: 'MP4 video', mov: 'MOV video',
    webm: 'WebM video', pdf: 'PDF document', md: 'Markdown document',
    txt: 'text document', json: 'JSON document', csv: 'CSV table',
    wav: 'WAV audio', mp3: 'MP3 audio'
  };
  return kinds[extension] || '';
}

/** A stable *local entry label*, not a semantic Role or evidence claim. */
export function suggestedMaterialEntryName(filename: string): string {
  const basename = String(filename || '').split(/[\\/]/).pop() || '';
  const stem = basename.replace(/\.[^.]+$/, '').toLowerCase();
  return stem.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 64) || 'material';
}
