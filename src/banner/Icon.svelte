<script lang="ts">
  /* eslint-disable-next-line import/default, import/no-named-as-default,
  import/no-named-as-default-member */
  import twemoji from '@twemoji/api';
  import { createEventDispatcher } from 'svelte';
  import type { IconString } from 'src/bannerData';
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';

  const dispatch = createEventDispatcher();

  export let icon: IconString;
  $: ({ iconSize, useTwemoji } = $settings);
  $: ({ type, value } = icon);
  $: fontSize = getSetting('iconSize', iconSize);
  $: html = (type === 'emoji' && useTwemoji)
    ? twemoji.parse(value, { className: 'banner-emoji' })
    : value;
</script>

<div
  class="banner-icon"
  class:text-icon={type === 'text'}
  class:emoji-icon={type === 'emoji'}
  style:font-size={fontSize}
  on:click={() => dispatch('open-icon-modal')}
  on:keydown={(e) => e.code === 'Enter' && dispatch('open-icon-modal')}
  role="button"
  tabindex="-1"
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</div>

<style lang="scss">
  .banner-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: calc(1em + 12px);
    width: calc(1em + 12px);
    border-radius: 6px;
    cursor: pointer;
    transition: ease 0.2s background;

    :global(&.emoji-icon img.banner-emoji) {
      height: 1em;
      width: 1em;
      vertical-align: 0.15em;
    }

    &:hover {
      background: #aaa4;
    }
  }
</style>
