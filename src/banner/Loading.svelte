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

<div class="loading" style:height>Loading...</div>
<div class="info-box">
</div>

<style lang="scss">
  @import './mixins.scss';
  .loading { @include info-box; }
</style>
