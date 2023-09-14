<script lang="ts">
  import type { BannerSettings } from '../structure';
  import ObsidianToggle from './ObsidianToggle.svelte';
  import SettingItem from './SettingItem.svelte';

  export let key: keyof BannerSettings;
</script>

<SettingItem {key}>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <ObsidianToggle
    slot="setting"
    let:value={checked}
    let:update
    checked={!!checked}
    onClick={() => update(!checked)}
  />
</SettingItem>
