<script lang="ts">
  import { getSetting } from "src/settings";
  import settingsStore from "src/settings/store";
  import { clamp } from "./utils";

  export let src: string|null;
  export let x: number;
  export let y: number;

  $: gradient = (getSetting('style', $settingsStore.style) === 'gradient');
  $: clampedX = clamp(0, x, 1) * 100;
  $: clampedY = clamp(0, y, 1) * 100;
</script>

<img
  {src}
  alt="Banner"
  class:gradient
  style:object-position={`${clampedX}% ${clampedY}%`}
  draggable={false}
>

<style lang="scss">
  img {
    position: relative;
    object-fit: cover;
    max-width: none;
    height: 100%;
    width: 100%;

    &.gradient {
      mask-image: linear-gradient(to bottom, black 50%, transparent);
      -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent);
    }
  }
</style>
