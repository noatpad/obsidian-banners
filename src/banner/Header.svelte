<script lang="ts">
  import type { IconString } from 'src/bannerData';
  import { settings } from 'src/settings/store';
  import sizedMargin from './actions/sizedMargin';
  import type { ActionParams } from './actions/sizedMargin';
  import Icon from './Icon.svelte';

  export let icon: IconString | undefined;
  export let header: string | undefined;
  export let withBanner: boolean;
  export let isEmbed: boolean;

  let clientHeight = 0;
  $: ({
    headerDecor: decor,
    headerHorizontalAlignment: horizontal,
    headerVerticalAlignment: vertical
  } = $settings);

  let params: ActionParams;
  $: params = { vertical, height: clientHeight, withBanner };
</script>

<div
  class="banner-header"
  class:with-banner={withBanner}
  class:shadow={decor === 'shadow'}
  class:border={decor === 'border'}
  class:h-left={horizontal === 'left'}
  class:h-center={horizontal === 'center'}
  class:h-right={horizontal === 'right'}
  class:h-custom={horizontal === 'custom'}
  class:v-center-banner={vertical === 'center'}
  class:v-above={vertical === 'above'}
  class:v-edge={vertical === 'edge'}
  class:v-below={vertical === 'below'}
  class:v-custom={vertical === 'custom'}
  bind:clientHeight
  use:sizedMargin={params}
>
  {#if icon}
    <Icon
      {icon}
      {isEmbed}
      on:open-icon-modal
    />
  {/if}
  {#if header}
    <h1 class="banner-header-title">{header}</h1>
  {/if}
</div>

<style lang="scss">
  .banner-header {
    display: flex;
    align-items: center;
    gap: 0.2em;
    margin: 0 auto;
    font-size: var(--banners-header-font-size);

    :global(.is-readable-line-width) & {
      max-width: calc(var(--file-line-width) + (var(--file-margins) * 2));
    }

    :global(.is-mobile .is-readable-line-width) & {
      max-width: calc(var(--file-line-width) + (var(--size-4-5) * 2));
    }

    &.shadow { text-shadow: var(--background-primary) 0 0 6px; }
    &.border { -webkit-text-stroke: 2px var(--background-primary); }

    &.h-left {
      justify-content: start;
      text-align: left;
    }
    &.h-center {
      justify-content: center;
      text-align: center;
    }
    &.h-right {
      justify-content: end;
      text-align: right;
    }
    &.h-custom { transform: var(--banners-header-transform); }

    &.with-banner {
      padding: 0 var(--file-margins);

      :global(.is-mobile .is-readable-line-width) & {
        padding: 0 var(--size-4-5);
      }

      &.v-above,
      &.v-edge { position: relative; }
      &.v-center-banner {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
      }
      &.v-custom { transform: var(--banners-header-transform); }
    }
  }

  .banner-header-title {
    font-size: 1em;
    padding: 0.25em 0;
    margin: 0;
  }
</style>
