<script lang="ts">
  /* eslint-disable-next-line import/default, import/no-named-as-default,
  import/no-named-as-default-member */
  import twemoji from '@twemoji/api';
  import { onMount } from 'svelte';
  import type { EmojiPair } from './IconModal';

  export let item: EmojiPair;
  export let useTwemoji: boolean = false;
  let div: HTMLElement;

  onMount(() => {
    if (useTwemoji) twemoji.parse(div, { className: 'banner-emoji' });
  });

  $: text = `${item.emoji} ${item.name}`;
</script>

<div class="icon-suggestion" bind:this={div}>
  {text}
</div>

<style lang="scss">
  .icon-suggestion {
    display: flex;
    align-items: center;
    gap: 0.2em;

    :global(img.banner-emoji) {
      height: 1.2em;
      width: 1.2em;
    }
  }
</style>
