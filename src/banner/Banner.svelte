<script lang="ts">
  import type { TFile } from "obsidian";
  import { fetchImage } from "./utils";
  import Loading from "./Loading.svelte";
  import Error from "./Error.svelte";
  import settingsStore from "src/settings/store";
  import { getSetting } from "src/settings";
  import BannerImage from "./BannerImage.svelte";
  import { plug } from "src/main";

  export let source: string | undefined;
  export let x: number | undefined;
  export let y: number | undefined;
  export let file: TFile;

  // TODO: The key should be a dynamic prefix + property value
  const getBannerKey = (key: keyof BannerMetadata): string => (
    (key === 'source') ? 'banner' : `banner_${key}`
  );

  const updateBannerData = ({ detail }: CustomEvent<Partial<BannerMetadata>>) => {
    plug.app.fileManager.processFrontMatter(file, async (frontmatter) => {
      for (const [key, val] of Object.entries(detail)) {
        frontmatter[getBannerKey(key as keyof BannerMetadata)] = val;
      }
    });
  };

  $: height = `${getSetting('height', $settingsStore.height)}px`;
</script>

<div class="obsidian-banner" style:height>
  <!-- IDEA: Add fade-in transition? -->
  {#await fetchImage(source, file)}
    <Loading />
  {:then src}
    <BannerImage {src} {x} {y} on:drag-banner={updateBannerData} />
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
</style>

<svelte:options accessors />
