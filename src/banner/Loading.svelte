<div class="wrapper">
  <div class="loading">Loading...</div>
</div>

<style lang="scss">
  @import './mixins.scss';
  .wrapper {
    @include info-box-wrapper;

    :global(.obsidian-banner-wrapper) & { height: var(--banners-height); }
    :global(.is-mobile .obsidian-banner-wrapper) & { height: var(--banners-mobile-height); }
    :global(.obsidian-banner-wrapper.in-popover) & { height: var(--banners-popover-height); }
    :global(.obsidian-banner-wrapper.in-internal-embed) & {
      height: var(--banners-internal-embed-height);
    }
  }

  .loading { @include info-box; }
</style>
