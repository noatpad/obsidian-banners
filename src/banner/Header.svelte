<script lang="ts">
  import type { IconString } from 'src/bannerData';
  import Icon from './Icon.svelte';

  export let icon: IconString;
</script>

<div class="header">
  <Icon {icon} />
</div>

<style lang="scss">
  .header {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    max-width: calc(var(--file-line-width) + (var(--file-margins) * 2));
    padding: 0 var(--file-margins);
    margin: 0 auto;
    transform: translateY(50%);
  }
</style>
