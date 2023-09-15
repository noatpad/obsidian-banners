<script lang="ts">
  import { getSetting } from 'src/settings';
  import settings from 'src/settings/store';

  export let error: string;
  $: ({ frontmatterField } = $settings);
  $: field = getSetting('frontmatterField', frontmatterField);
</script>

<div class="error markdown-rendered">
  <p>Couldn't load the banner! Is the <code>{field}</code> field correct?</p>
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
