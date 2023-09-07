<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import type { BannerSettings } from '..';
  import settings from '../store';

  export let on: keyof BannerSettings | (() => boolean);
  setContext('level', (getContext<number>('level') ?? 0) + 1);

  $: show = (typeof on === 'string') ? $settings[on] : on();
</script>

{#if show}
  <slot />
{/if}
