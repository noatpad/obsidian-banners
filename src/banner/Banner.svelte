<svelte:options accessors />

<script lang="ts">
  import type { TFile } from 'obsidian';
  import { updateBannerData } from 'src/bannerData';
  import type { IconString } from 'src/bannerData';
  import IconModal from 'src/modals/IconModal';
  import BannerImage from './BannerImage.svelte';
  import Error from './Error.svelte';
  import Header from './Header.svelte';
  import Loading from './Loading.svelte';
  import { fetchImage } from './utils';
  import type { Embedded } from '.';

  export let source: string | undefined = undefined;
  export let x = 0.5;
  export let y = 0.5;
  export let icon: IconString | undefined = undefined;
  export let header: string | undefined = undefined;
  export let lock = false;

  export let viewType: 'editing' | 'reading';
  export let file: TFile;
  export let embed: Embedded = false;

  const toggleLock = () => updateBannerData(file, { lock: !lock || undefined });
  const openIconModal = () => new IconModal(file).open();

  $: bannerX = x ?? 0.5;
  $: bannerY = y ?? 0.5;
  $: lockValue = lock ?? false;
  $: withBanner = !!source;
  $: isEmbed = !!embed;
</script>

<header
  class="obsidian-banner"
  class:editing={viewType === 'editing'}
  class:reading={viewType === 'reading'}
>
  <!-- IDEA: Add fade-in transition? -->
  {#if source}
    {#await fetchImage(source, file.path)}
      <Loading {embed} />
    {:then src}
      <BannerImage
        {src}
        x={bannerX}
        y={bannerY}
        lock={lockValue}
        {embed}
        on:drag-banner={async ({ detail }) => updateBannerData(file, detail)}
        on:toggle-lock={toggleLock}
      />
    {:catch error}
      <Error {error} {embed} />
    {/await}
  {/if}
  {#if icon || header}
    <Header
      {icon}
      {header}
      {withBanner}
      {isEmbed}
      on:open-icon-modal={openIconModal}
    />
  {/if}
</header>

<style lang="scss">
  // NOTE: This styling rule here may cause side effects to the editing view. Let's hope it doesn't
  :global(.cm-scroller) { flex-direction: column; }

  :global(.obsidian-banner-wrapper:not(.in-internal-embed)) {
    position: relative;
    width: calc(100% + 2 * var(--file-margins));
    margin: calc(-1 * var(--file-margins));
    margin-bottom: var(--file-margins);
  }

  :global(.obsidian-banner-wrapper.in-popover) {
    margin-bottom: 0;
  }

  .obsidian-banner {
    width: 100%;
    user-select: none;
  }
</style>
