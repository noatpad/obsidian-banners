<script lang="ts">
  import { settings } from 'src/settings/store';
  import { getBannerHeight } from './utils';
  import type { Embedded } from '.';

  export let error: string;
  export let embed: Embedded;

  $: ({
    frontmatterField,
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
  <div class="error markdown-rendered">
    <p>Couldn't load the banner! Is the <code>{frontmatterField}</code> field correct?</p>
    <code>{error}</code>
  </div>
</div>

<style lang="scss">
  @import './mixins.scss';

  .wrapper { @include info-box-wrapper; }
  .error {
    @include info-box;
    border-color: var(--background-modifier-error);
    color: var(--text-error);
  }
</style>
