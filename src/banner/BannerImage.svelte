<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getSetting } from 'src/settings';
  import settingsStore from 'src/settings/store';
  import { dragBanner } from './actions';

  const dispatch = createEventDispatcher<{
    'drag-banner': Partial<BannerMetadata>;
  }>();

  export let src: string | null;
  export let x: number | undefined;
  export let y: number | undefined;
  $: gradient = (getSetting('style', $settingsStore.style) === 'gradient');
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  draggable={false}
  aria-hidden={true}
  use:dragBanner={{ x, y, dispatch }}
/>

<style lang="scss">
  img {
    position: relative;
    height: 100%;
    width: 100%;
    max-width: none;
    object-fit: cover;
    user-select: none;
    cursor: grab;

    &.gradient {
      mask-image: linear-gradient(to bottom, black 50%, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
    }

    &:global(.dragging) {
      cursor: grabbing;
    }
  }
</style>
