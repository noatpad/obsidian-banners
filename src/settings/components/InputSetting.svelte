<script lang="ts">
  import { DEFAULT_SETTINGS } from '..';
  import SettingItem from './SettingItem.svelte';
  import type { BannerSettings } from '..';
  import type { HTMLInputTypeAttribute } from 'svelte/elements';

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
