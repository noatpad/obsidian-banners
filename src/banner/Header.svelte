<script lang="ts">
  import type { IconString } from 'src/bannerData';
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';
  import Icon from './Icon.svelte';

  export let icon: IconString;
  $: ({ iconHorizontalAlignment, iconHorizontalTransform } = $settings);
  $: horizontal = getSetting('iconHorizontalAlignment', iconHorizontalAlignment);
  $: hTransform = getSetting('iconHorizontalTransform', iconHorizontalTransform);
  $: alignLeft = (horizontal === 'left');
  $: alignCenter = (horizontal === 'center');
  $: alignRight = (horizontal === 'right');
  $: transform = (horizontal === 'custom') ?
    `translate(${hTransform}, 50%)`
    : null;
</script>

<div
  class="header"
  class:align-left={alignLeft}
  class:align-center={alignCenter}
  class:align-right={alignRight}
  style:transform
>
  <Icon {icon} />
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
    padding: 0 var(--file-margins);
    margin: 0 auto;
    transform: translateY(50%);
  }

  .align-left { justify-content: start; }
  .align-center { justify-content: center; }
  .align-right { justify-content: end; }
</style>
