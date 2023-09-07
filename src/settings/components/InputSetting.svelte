<script lang="ts">
  import type { HTMLInputTypeAttribute } from 'svelte/elements';
  import { DEFAULT_SETTINGS } from '..';
  import type { BannerSettings } from '..';
  import SettingItem from './SettingItem.svelte';

  export let key: keyof BannerSettings;
  export let type: HTMLInputTypeAttribute = 'text';
  $: placeholder = (DEFAULT_SETTINGS[key] as number).toString();
</script>

<SettingItem {key}>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <input
    slot="setting"
    let:value
    let:update
    {type}
    {value}
    {placeholder}
    on:change={(e) => update(e.currentTarget.value || undefined)}
  />
</SettingItem>
