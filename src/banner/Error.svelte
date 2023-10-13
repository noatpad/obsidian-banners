<script lang="ts">
  import { settings } from 'src/settings/store';

  export let error: string;
  $: ({ frontmatterField } = $settings);
</script>

<div class="error markdown-rendered">
  <p>Couldn't load the banner! Is the <code>{frontmatterField}</code> field correct?</p>
  <code>{error}</code>
</div>

<style lang="scss">
  @import './mixins.scss';

  .error {
    @include banner-info-box;
    border-color: var(--background-modifier-error);
    color: var(--text-error);
  }
</style>
