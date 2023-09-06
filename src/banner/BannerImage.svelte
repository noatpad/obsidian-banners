<script lang="ts">
  import { createEventDispatcher  } from 'svelte';
  import { getSetting } from 'src/settings';
  import settingsStore from 'src/settings/store';
  import { dragBanner } from './actions';
  import type { XY } from './actions';

  export let src: string | null;
  export let x: number;
  export let y: number;
  let objectPos = { x, y };

  const dispatch = createEventDispatcher<{
    'drag-banner': Partial<BannerMetadata>;
  }>();
  let dragging = false;

  const dragStart = () => { dragging = true; };
  const dragMove = ({ detail }: CustomEvent<XY>) => { objectPos = detail; };
  const dragEnd = ({ detail }: CustomEvent<Partial<BannerMetadata>>) => {
    dispatch('drag-banner', detail);
    dragging = false;
  };

  $: gradient = (getSetting('style', $settingsStore.style) === 'gradient');
  $: objectPosStyle = `${objectPos.x * 100}% ${objectPos.y * 100}%`;
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  class:dragging
  style:object-position={objectPosStyle}
  draggable={false}
  aria-hidden={true}
  use:dragBanner={{ x, y }}
  on:dragBannerStart={dragStart}
  on:dragBannerMove={dragMove}
  on:dragBannerEnd={dragEnd}
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

    &.dragging {
      cursor: grabbing;
    }
  }
</style>
