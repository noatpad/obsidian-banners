<script lang="ts">
  import type { TFile } from "obsidian";
  import { parseInternalLink } from "./utils";

  export let bannerData: BannerMetadata;
  export let file: TFile;

  const fetchImage = async () => {
    // Check if it's an internal link and use that if it is
    const { src } = bannerData;
    const internalLink = parseInternalLink(src, file);
    if (internalLink) return internalLink;

    const resp = await fetch(src);
    const blob = await resp.blob();

    if (resp.ok) {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error)
      })
    } else {
      throw new Error('huh?');
    }
  };
</script>

<div class="obsidian-banner">
  {#await fetchImage()}
    <p>Loading...</p>
  {:then src}
    <img {src} alt="Banner">
  {:catch error}
    <p>Error! {error}</p>
  {/await}
</div>

<style lang="scss">
  .obsidian-banner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    overflow: hidden;
    user-select: none;
    opacity: 0.3;
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
