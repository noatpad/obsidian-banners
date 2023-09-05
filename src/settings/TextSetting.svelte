<script lang="ts">
  import SettingItem from './SettingItem.svelte';
  import { DEFAULT_SETTINGS } from '.';
  import type { BannerSettings } from '.';

  export let key: keyof BannerSettings;
  $: placeholder = (DEFAULT_SETTINGS[key] as number).toString();
</script>

<SettingItem {key}>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <input
    slot="setting"
    let:value
    let:update
    type="number"
    {value}
    {placeholder}
    on:change={(e) => update(e.currentTarget.value || undefined)}
  />
</SettingItem>
