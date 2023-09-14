<script lang="ts">
  import { SELECT_OPTIONS_MAP } from '../structure';
  import SettingItem from './SettingItem.svelte';

  export let key: keyof typeof SELECT_OPTIONS_MAP;
  $: options = Object.entries(SELECT_OPTIONS_MAP[key]);
</script>

<SettingItem {key}>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <select
    slot="setting"
    let:value
    let:update
    class="dropdown"
    {value}
    on:change={(e) => update(e.currentTarget.value)}
  >
    {#each options as [value, label]}
      <option {value}>{label}</option>
    {/each}
  </select>
</SettingItem>
