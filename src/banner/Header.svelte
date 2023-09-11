<script lang="ts">
  import type { IconString } from 'src/bannerData';
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';
  import Icon from './Icon.svelte';
  import { getIconTransform } from './utils';

  export let icon: IconString;
  $: ({
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
</script>

<div
  class="header"
  class:align-left={horizontal === 'left'}
  class:align-center={horizontal === 'center'}
  class:align-right={horizontal === 'right'}
  class:center-of-banner={vertical === 'center'}
  style:transform
>
  <Icon {icon} on:open-icon-modal />
</div>

<style lang="scss">
  // TODO: Adjust for when 'Readable line length' core setting is off
  .header {
    display: flex;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: calc(var(--file-line-width) + (var(--file-margins) * 2));
    padding: 4px var(--file-margins);
    margin: 0 auto;
  }

  .align-left { justify-content: start; }
  .align-center { justify-content: center; }
  .align-right { justify-content: end; }
  .center-of-banner { bottom: 50%; }
</style>
