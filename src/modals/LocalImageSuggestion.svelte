<script lang="ts">
  import type { SearchMatches, TFile } from 'obsidian';
  import { plug } from 'src/main';

  interface PathPart { part: string; bold: boolean }

  export let file: TFile;
  export let matches: SearchMatches;

  const getPathParts = (_file: TFile, _matches: SearchMatches): PathPart[] => {
    const { path } = file;
    if (!matches.length) return [{ part: path.slice(0, path.length), bold: false }];

    const parts: PathPart[] = [];
    let i = 0;
    for (const [start, end] of matches) {
      if (i !== start) parts.push({ part: path.slice(i, start), bold: false });
      parts.push({ part: path.slice(start, end), bold: true });
      i = end;
    }
    if (i !== path.length) parts.push({ part: path.slice(i, path.length), bold: false });
    return parts;
  };
  $: parts = getPathParts(file, matches);
  $: src = plug.app.vault.getResourcePath(file);
</script>

<p class="suggestion-text">
  {file.name}
  <small class="filepath">
    {#each parts as { part, bold }, i (i)}
      <span class:suggestion-highlight={bold}>{part}</span>
    {/each}
  </small>
</p>
<img {src} alt="Banner for {file.name}" class="banner-preview" />

<style lang="scss">
  .suggestion-text {
    height: 0;
    padding: 0.25em 0 0.5em;
    margin: 0;
  }

  .filepath {
    color: var(--text-muted);
    font-style: italic;
  }

  .banner-preview {
    height: 200px;
    width: 100%;
    object-fit: cover;
    object-position: 50% 50%;
  }
</style>
