<svelte:options accessors />

<script lang="ts">
  import type { TFile } from 'obsidian';
  import { onDestroy } from 'svelte';
  import { updateBannerData } from 'src/bannerData';
  import type { IconString } from 'src/bannerData';
  import IconModal from 'src/modals/IconModal';
  import type { Embedded } from 'src/reading/BannerRenderChild';
  import settings from 'src/settings/store';
  import BannerImage from './BannerImage.svelte';
  import Error from './Error.svelte';
  import Header from './Header.svelte';
  import Loading from './Loading.svelte';
  import {
    fetchImage,
    getBannerHeight,
    getHeights,
    getSizerHeight
  } from './utils';

  export let source: string | undefined = undefined;
  export let x = 0.5;
  export let y = 0.5;
  export let icon: IconString | undefined = undefined;
  export let header: string | undefined = undefined;

  export let viewType: 'editing' | 'reading';
  export let file: TFile;
  export let embed: Embedded = false;
  export let sizerEl: HTMLElement | null;
  export let isSwapping = false;
  $: ({
    height: desktopHeight,
    mobileHeight,
    popoverHeight,
    internalEmbedHeight,
    headerSize,
    headerVerticalAlignment
  } = $settings);
  $: heights = getHeights(embed, [
    desktopHeight,
    mobileHeight,
    popoverHeight,
    internalEmbedHeight,
    headerSize
  ]);

  onDestroy(() => {
    if (!isSwapping) sizerEl?.setCssStyles({ marginTop: '' });
  });

  const openIconModal = () => new IconModal(file).open();

  $: height = getBannerHeight(heights, source, icon);
  $: if (sizerEl) {
    const marginTop = getSizerHeight(heights, source, icon, headerVerticalAlignment);
    sizerEl.setCssStyles({ marginTop });
  }
</script>

<header
  class="obsidian-banner"
  class:editing={viewType === 'editing'}
  class:reading={viewType === 'reading'}
  class:in-internal-embed={embed === 'internal'}
  class:in-popover={embed === 'popover'}
  style:height
>
  <!-- IDEA: Add fade-in transition? -->
  {#if source}
    {#await fetchImage(source, file)}
      <Loading />
    {:then src}
      <BannerImage
        {src}
        x={x ?? 0.5}
        y={y ?? 0.5}
        {embed}
        on:drag-banner={async ({ detail }) => updateBannerData(file, detail)}
      />
    {:catch error}
      <Error {error} />
    {/await}
  {/if}
  {#if icon || header}
    <Header
      {icon}
      {header}
      on:open-icon-modal={openIconModal}
    />
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
