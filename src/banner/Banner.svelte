<script lang="ts">
  import type { TFile } from "obsidian";
  import { parseInternalLink } from "./utils";
  import Loading from "./Loading.svelte";
  import Error from "./Error.svelte";

  export let bannerData: BannerMetadata;
  export let file: TFile;

  const fetchImage = async (src: Maybe<string>) => {
    // Just return the bad link to get the error
    if (!src) return src;

    // Check if it's an internal link and use that if it is
    const internalLink = parseInternalLink(src, file);
    if (internalLink) return internalLink;

    try {
      const resp = await fetch(src);
      const blob = await resp.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error)
      });
    } catch (error) {
      throw error;
    }
  };
</script>

<div class="obsidian-banner">
  {#await fetchImage(bannerData.src)}
    <Loading />
  {:then src}
    <img {src} alt="Banner">
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
    height: 300px;
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
