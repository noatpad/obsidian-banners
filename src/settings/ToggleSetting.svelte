<script lang="ts">
  import SettingItem from './SettingItem.svelte';

  import type { BannerSettings } from '.';

  export let key: keyof BannerSettings;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<SettingItem {key}>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <!-- input only covers part of the toggle element. on:click here covers the rest -->
  <div
    slot="setting"
    let:value={checked}
    let:update
    class="checkbox-container"
    class:is-enabled={checked}
    on:click={() => update(!checked)}
  >
    <input type="checkbox" tabindex="0" value={checked} />
  </div>
</SettingItem>
