<script lang="ts">
  /* eslint-disable-next-line import/default, import/no-named-as-default,
  import/no-named-as-default-member */
  import twemoji from '@twemoji/api';
  import type { IconString } from 'src/bannerData';
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';

  export let icon: IconString;
  $: ({ iconSize, useTwemoji } = $settings);
  $: ({ type, value } = icon);
  $: fontSize = getSetting('iconSize', iconSize);
  $: html = (type === 'emoji' && useTwemoji)
    ? twemoji.parse(value, { className: 'banner-emoji' })
    : value;
</script>

<div
  class="icon"
  class:text-icon={type === 'text'}
  class:emoji-icon={type === 'emoji'}
  style:font-size={fontSize}
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</div>

<style lang="scss">
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: calc(1em + 4px);
    width: calc(1em + 4px);
  }

  // Twemoji styling
  :global(img.banner-emoji) {
    height: 1em;
    width: 1em;
    vertical-align: 0.15em;
  }
</style>
