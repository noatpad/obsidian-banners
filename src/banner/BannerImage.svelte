<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Embedded } from 'src/reading/BannerRenderChild';
  import { getSetting } from 'src/settings';
  import settingsStore from 'src/settings/store';
  import { dragBanner } from './actions';
  import type { DragParams, XY } from './actions';

  interface BannerImageDispatch { 'drag-banner': Partial<BannerMetadata> }

  export let src: string | null;
  export let x: number;
  export let y: number;
  export let embed: Embedded;
  $: ({
    bannerDragModifier,
    enableDragInInternalEmbed,
    enableDragInPopover,
    style
  } = $settingsStore);
  let objectPos = { x, y };
  let draggable = (bannerDragModifier === 'None');
  let dragging = false;

  const dispatch = createEventDispatcher<BannerImageDispatch>();

  const dragStart = () => { dragging = true; };
  const dragMove = ({ detail }: CustomEvent<XY>) => { objectPos = detail; };
  const dragEnd = ({ detail }: CustomEvent<Partial<BannerMetadata>>) => {
    dispatch('drag-banner', detail);
    dragging = false;
  };
  const toggleDrag = ({ detail }: CustomEvent<boolean>) => { draggable = detail; };

  let dragBannerParams: DragParams;
  $: dragBannerParams = {
    x,
    y,
    embed,
    settings: {
      modKey: getSetting('bannerDragModifier', bannerDragModifier),
      enableInInternalEmbed: getSetting('enableDragInInternalEmbed', enableDragInInternalEmbed),
      enableInPopover: getSetting('enableDragInPopover', enableDragInPopover)
    }
  };
  $: gradient = (getSetting('style', style) === 'gradient');
  $: objectPosStyle = `${objectPos.x * 100}% ${objectPos.y * 100}%`;
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  class:draggable
  class:dragging
  style:object-position={objectPosStyle}
  draggable={false}
  aria-hidden={true}
  use:dragBanner={dragBannerParams}
  on:dragBannerStart={dragStart}
  on:dragBannerMove={dragMove}
  on:dragBannerEnd={dragEnd}
  on:toggleDrag={toggleDrag}
/>

<style lang="scss">
  img {
    position: relative;
    height: 100%;
    width: 100%;
    max-width: none;
    object-fit: cover;
    user-select: none;

    &.gradient {
      mask-image: linear-gradient(to bottom, black 50%, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
    }

    &.draggable { cursor: grab; }
    &.dragging { cursor: grabbing; }
  }
</style>
