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
  let div: HTMLElement;
  $: ({ iconSize, useTwemoji } = $settings);
  $: ({ type, value } = icon);
  $: fontSize = getSetting('iconSize', iconSize);
  $: html = (type === 'emoji' && useTwemoji)
    ? twemoji.parse(value, { className: 'banner-emoji' })
    : value;
  $: if (div && html) {
    div.querySelector<HTMLElement>('img.banner-emoji')?.setCssStyles({
      height: '1em',
      width: '1em'
    });
  }
</script>

<div
  class="banner-icon"
  class:text-icon={type === 'text'}
  class:emoji-icon={type === 'emoji'}
  style:font-size={fontSize}
  role="button"
  tabindex="-1"
  on:click={() => dispatch('open-icon-modal')}
  on:keydown={(e) => e.code === 'Enter' && dispatch('open-icon-modal')}
  bind:this={div}
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html html}
</div>

<style lang="scss">
  .banner-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: calc(1em + 8px);
    width: calc(1em + 8px);
    border-radius: 6px;
    cursor: pointer;
    transition: ease 0.2s background;

    &:hover {
      background: #aaa4;
    }
  }
</style>
