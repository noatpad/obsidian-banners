<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { BannerDataWrite } from 'src/bannerData';
  import { settings } from 'src/settings/store';
  import dragBanner from './actions/dragBanner';
  import type { DragParams, XY } from './actions/dragBanner';
  import lockIcon from './actions/lockIcon';
  import type { Embedded } from '.';

  interface BannerImageDispatch {
    'drag-banner': Partial<BannerDataWrite>;
    'toggle-lock': null;
  }
  const dispatch = createEventDispatcher<BannerImageDispatch>();

  export let src: string | null;
  export let x: number;
  export let y: number;
  export let lock: boolean;
  export let embed: Embedded;
  $: ({
    adjustWidthToReadableLineWidth: readableWidth,
    bannerDragModifier,
    enableDragInInternalEmbed,
    enableDragInPopover,
    enableLockButton,
    style
  } = $settings);
  let objectPos = { x, y };
  let hovering = false;
  let draggable = !bannerDragModifier;
  let dragging = false;

  const hoverOn = () => { hovering = true; };
  const hoverOff = () => { hovering = false; };
  const dragStart = () => { dragging = true; };
  const dragMove = ({ detail }: CustomEvent<XY>) => { objectPos = detail; };
  const dragEnd = ({ detail }: CustomEvent<Partial<BannerDataWrite>>) => {
    dispatch('drag-banner', detail);
    dragging = false;
  };
  const toggleDrag = ({ detail }: CustomEvent<boolean>) => { draggable = detail; };
  const toggleLock = () => dispatch('toggle-lock');

  let dragParam: boolean;
  $: {
    if (lock) dragParam = false;
    if (embed === 'internal') dragParam = enableDragInInternalEmbed;
    if (embed === 'popover') dragParam = enableDragInPopover;
    dragParam = true;
  }

  let dragBannerParams: DragParams;
  $: dragBannerParams = {
    x,
    y,
    draggable: dragParam,
    modKey: bannerDragModifier
  };
  $: gradient = (style === 'gradient');
  $: objectPosStyle = `${objectPos.x * 100}% ${objectPos.y * 100}%`;
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  class:readable-width={readableWidth}
  class:draggable
  class:dragging
  style:object-position={objectPosStyle}
  draggable={false}
  aria-hidden={true}
  on:mouseenter={hoverOn}
  on:mouseleave={hoverOff}
  use:dragBanner={dragBannerParams}
  on:dragBannerStart={dragStart}
  on:dragBannerMove={dragMove}
  on:dragBannerEnd={dragEnd}
  on:toggleDrag={toggleDrag}
/>
{#if enableLockButton}
  <button
    class="lock-button"
    class:show={hovering}
    on:click={toggleLock}
    on:mouseenter={hoverOn}
    use:lockIcon={lock}
  />
{/if}

<style lang="scss">
  img {
    display: block;
    position: relative;
    width: 100%;
    max-width: none;
    object-fit: cover;
    user-select: none;

    :global(.obsidian-banner-wrapper) & { height: var(--banners-height); }
    :global(.is-mobile .obsidian-banner-wrapper) & { height: var(--banners-mobile-height); }
    :global(.obsidian-banner-wrapper.in-popover) & { height: var(--banners-popover-height); }
    :global(.obsidian-banner-wrapper.in-internal-embed) & {
      height: var(--banners-internal-embed-height);
    }

    &.gradient {
      mask-image: linear-gradient(to bottom, black 50%, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
    }

    &.readable-width {
      max-width: var(--file-line-width);
      margin: 0 auto;
    }

    &.draggable { cursor: grab; }
    &.dragging { cursor: grabbing; }
  }

  .lock-button {
    position: absolute;
    top: 0;
    right: 0;
    height: 42px;
    width: 42px;
    margin: 6px;
    opacity: 0;
    cursor: pointer;
    transition: 0.2s ease opacity;

    &.show { opacity: 1; }
  }
</style>
