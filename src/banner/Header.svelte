<script lang="ts">
  import type { IconString } from 'src/bannerData';
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';
  import Icon from './Icon.svelte';
  import { getIconTransform } from './utils';

  export let icon: IconString | undefined;
  export let header: string | undefined;
  $: ({
    headerSize,
    iconHorizontalAlignment,
    iconHorizontalTransform,
    iconVerticalAlignment,
    iconVerticalTransform
  } = $settings);
  $: horizontal = getSetting('iconHorizontalAlignment', iconHorizontalAlignment);
  $: hTransform = getSetting('iconHorizontalTransform', iconHorizontalTransform);
  $: vertical = getSetting('iconVerticalAlignment', iconVerticalAlignment);
  $: vTransform = getSetting('iconVerticalTransform', iconVerticalTransform);
  $: transform = getIconTransform(horizontal, hTransform, vertical, vTransform);
  $: fontSize = getSetting('headerSize', headerSize);
</script>

<div
  class="banner-header"
  class:align-left={horizontal === 'left'}
  class:align-center={horizontal === 'center'}
  class:align-right={horizontal === 'right'}
  class:center-of-banner={vertical === 'center'}
  style:transform
  style:font-size={fontSize}
>
  {#if icon}
    <Icon {icon} on:open-icon-modal />
  {/if}
  {#if header}
    <h1 class="banner-header-title">{header}</h1>
  {/if}
</div>

<style lang="scss">
  // TODO: Adjust for when 'Readable line length' core setting is off
  .banner-header {
    display: flex;
    align-items: center;
    gap: 0.2em;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: calc(var(--file-line-width) + (var(--file-margins) * 2));
    padding: 4px var(--file-margins);
    margin: 0 auto;

    &.align-left { justify-content: start; }
    &.align-center { justify-content: center; }
    &.align-right { justify-content: end; }
    &.center-of-banner { bottom: 50%; }
  }

  .banner-header-title {
    font-size: 1em;
    margin: 0;
  }
</style>
