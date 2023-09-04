<script lang="ts">
  import type { TFile } from "obsidian";
  import { fetchImage } from "./utils";
  import Loading from "./Loading.svelte";
  import Error from "./Error.svelte";
  import settingsStore from "src/settings/store";
  import { getSetting } from "src/settings";

  export let source: string|null = null;
  export let x: number|null = 0.5;
  export let y: number|null = 0.5;
  export let file: TFile;
  $: height = `${getSetting('height', $settingsStore.height)}px`;
</script>

<div class="obsidian-banner">
  {#await fetchImage(source, file)}
    <Loading />
  {:then src}
    <img
      {src}
      alt="Banner"
      style:height
    >
  {:catch error}
    <Error {error} />
  {/await}
</div>

<style lang="scss">
  .obsidian-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    user-select: none;
  }

  img {
    position: relative;
    object-fit: cover;
    max-width: none;
    height: 100%;
    width: 100%;
  }
</style>

<svelte:options accessors />
