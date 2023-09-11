<script lang="ts">
  /* eslint-disable-next-line import/default, import/no-named-as-default,
  import/no-named-as-default-member */
  import twemoji from '@twemoji/api';
  import type { IconString } from 'src/bannerData';
  import settings from 'src/settings/store';

  export let icon: IconString;
  $: ({ useTwemoji } = $settings);
  $: ({ type, value } = icon);
  $: test = (type === 'emoji' && useTwemoji) ? twemoji.parse(value) : value;
</script>

<div
  class="icon"
  class:text-icon={type === 'text'}
  class:emoji-icon={type === 'emoji'}
>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html test}
</div>

<style lang="scss">
  .icon {
    display: inline-block;
    font-size: 3em;
  }
</style>
