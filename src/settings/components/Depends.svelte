<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import settings from '../store';
  import type { BannerSettings } from '../structure';

  export let on: keyof BannerSettings | boolean;
  setContext('level', (getContext<number>('level') ?? 0) + 1);

  $: show = (typeof on === 'string') ? $settings[on] : on;
</script>

{#if show}
  <slot />
{/if}
