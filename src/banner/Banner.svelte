<svelte:options accessors />

<script lang="ts">
  import { Platform } from 'obsidian';
  import type { TFile } from 'obsidian';
  import { updateBannerData } from 'src/bannerData';
  import type { IconString } from 'src/bannerData';
  import type { Embedded } from 'src/reading/BannerRenderChild';
  import { getSetting } from 'src/settings';
  import settingsStore from 'src/settings/store';
  import BannerImage from './BannerImage.svelte';
  import Error from './Error.svelte';
  import Header from './Header.svelte';
  import Loading from './Loading.svelte';
  import { fetchImage } from './utils';

  export let source: string | undefined = undefined;
  export let x = 0.5;
  export let y = 0.5;
  export let icon: IconString | undefined = undefined;

  export let file: TFile;
  export let embed: Embedded = false;
  // export let heights: [string, string];
  // let height: string;
  // $: {
  //   if (source) height = heights[0];
  //   else height = heights[1];
  // }

  let heightValue: number;
  $: ({
    height,
    mobileHeight,
    popoverHeight,
    internalEmbedHeight
  } = $settingsStore);

  $: {
    if (Platform.isMobile) {
      heightValue = getSetting('mobileHeight', mobileHeight);
    } else {
      switch (embed) {
        case 'internal':
          heightValue = getSetting('internalEmbedHeight', internalEmbedHeight);
          break;
        case 'popover':
          heightValue = getSetting('popoverHeight', popoverHeight);
          break;
        default:
          heightValue = getSetting('height', height);
          break;
      }
    }
  }
  $: heightStyle = `${heightValue}px`;
</script>

<header
  class="obsidian-banner"
  class:in-internal-embed={embed === 'internal'}
  class:in-popover={embed === 'popover'}
  style:height={heightStyle}
>
  <!-- IDEA: Add fade-in transition? -->
  {#if source}
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
  {/if}
  {#if icon}
    <Header {icon} />
  {/if}
</header>

<style lang="scss">
  .obsidian-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    user-select: none;
  }
</style>
