<script lang="ts">
  import { getSetting } from "src/settings";
  import settingsStore from "src/settings/store";
  import { clampAndRound, getMousePos, type MTEvent } from "./utils";
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  const dispatch = createEventDispatcher<{
    'drag-banner': Partial<BannerMetadata>
  }>();

  export let src: string | null;
  export let x: number | undefined;
  export let y: number | undefined;

  // TODO: Reimplement touch dragging
  let img: HTMLImageElement;
  let dragging = false;
  let isVerticalDrag = false;
  let imageSize = { width: 0, height: 0 };
  let startDragPos = { x: 0, y: 0 };
  let dragOffset = { x: 0, y: 0 };
  $: if (x || y) dragOffset = { x: 0, y: 0 };

  const dragStart = (e: MTEvent) => {
    const [x, y] = getMousePos(e);
    const { clientHeight, clientWidth, naturalHeight, naturalWidth } = img;
    const clientRatio = clientWidth / clientHeight;
    const naturalRatio = naturalWidth / naturalHeight;
    dragging = true;
    isVerticalDrag = (naturalRatio <= clientRatio);
    startDragPos = { x, y };
    // Get "drag area" dimensions (image size with "covered" area, then subtract image dimensions)
    imageSize = isVerticalDrag ? (
      { width: 0, height: (clientWidth / naturalRatio) - clientHeight }
    ) : (
      { width: (clientHeight * naturalRatio) - clientWidth, height: 0 }
    );
  };

  const dragMove = (e: MTEvent) => {
    if (!dragging) return;

    const [x, y] = getMousePos(e);
    const delta = { x: startDragPos.x -  x, y: startDragPos.y - y };
    dragOffset = {
      x: isVerticalDrag ? 0 : (delta.x / imageSize.width),
      y: isVerticalDrag ? (delta.y / imageSize.height) : 0
    };
  };

  const dragEnd = () => {
    if (!dragging) return;
    dragging = false;

    const data = isVerticalDrag ? { y: posY } : { x: posX };
    dispatch('drag-banner', data);
  };

  // Fire event when releasing drag from outside the image's boundaries
  onMount(() => document.addEventListener('mouseup', dragEnd));
  onDestroy(() => document.removeEventListener('mouseup', dragEnd));

  $: gradient = (getSetting('style', $settingsStore.style) === 'gradient');
  $: posX = clampAndRound(0, (x ?? 0.5) + dragOffset.x, 1);
  $: posY = clampAndRound(0, (y ?? 0.5) + dragOffset.y, 1);
  $: objectPos = `${posX * 100}% ${posY * 100}%`;
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  class:dragging
  style:object-position={objectPos}
  draggable={false}
  aria-hidden={true}
  bind:this={img}
  on:mousedown={dragStart}
  on:mousemove={dragMove}
  on:mouseup={dragEnd}
>

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
    &.dragging { cursor: grabbing; }
  }
</style>
