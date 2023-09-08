<svelte:options accessors />

<script lang="ts">
  import type { TFile } from 'obsidian';
  import type { Embedded } from 'src/reading/BannerRenderChild';
  import { getSetting } from 'src/settings';
  import settingsStore from 'src/settings/store';
  import { updateBannerData } from 'src/utils';
  import BannerImage from './BannerImage.svelte';
  import Error from './Error.svelte';
  import Loading from './Loading.svelte';
  import { fetchImage } from './utils';

  export let source: string | undefined = undefined;
  export let x = 0.5;
  export let y = 0.5;
  export let file: TFile;
  export let embed: Embedded = false;
  let heightValue: number;

  $: {
    switch (embed) {
      case 'internal':
        heightValue = getSetting('internalEmbedHeight', $settingsStore.internalEmbedHeight);
        break;
      case 'popover':
        heightValue = getSetting('popoverHeight', $settingsStore.popoverHeight);
        break;
      default:
        heightValue = getSetting('height', $settingsStore.height);
        break;
    }
  }
  $: height = `${heightValue}px`;
</script>

<div
  class="obsidian-banner"
  class:in-internal-embed={embed === 'internal'}
  class:in-popover={embed === 'popover'}
  style:height
>
  <!-- IDEA: Add fade-in transition? -->
  {#await fetchImage(source, file)}
    <Loading />
  {:then src}
    <BannerImage
      {src}
      {x}
      {y}
      {embed}
      on:drag-banner={async ({ detail }) => updateBannerData(file, detail)}
    />
  {:catch error}
    <Error {error} />
  {/await}
</div>

<style lang="scss">
  .obsidian-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    user-select: none;
  }
</style>
