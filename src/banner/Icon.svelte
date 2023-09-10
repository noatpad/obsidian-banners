<script lang="ts">
  import type { IconString } from 'src/bannerData';

  export let icon: IconString;
</script>

<div class="icon">
  <span>{icon.value}</span>
</div>

<style lang="scss">
  .icon {
    display: inline-block;
    font-size: 3em;
  }
</style>
