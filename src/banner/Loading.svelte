<script lang="ts">
  import { settings } from 'src/settings/store';
  import { getBannerHeight } from './utils';
  import type { Embedded } from '.';

  export let embed: Embedded;

  $: ({
    height: desktopHeight,
    mobileHeight,
    internalEmbedHeight,
    popoverHeight
  } = $settings);
  $: height = getBannerHeight({
    desktopHeight: desktopHeight as string,
    mobileHeight: mobileHeight as string,
    internalEmbedHeight: internalEmbedHeight as string,
    popoverHeight: popoverHeight as string
  }, embed);
</script>

<div class="wrapper" style:height>
  <div class="loading">Loading...</div>
</div>

<style lang="scss">
  @import './mixins.scss';
  .wrapper { @include info-box-wrapper; }
  .loading { @include info-box; }
</style>
