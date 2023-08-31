<script lang="ts">
  import { STYLE_OPTION_LABELS, type BannerSettings } from ".";
  import SettingItem from "./SettingItem.svelte";

  export let key: keyof BannerSettings;

  const options = Object.entries(STYLE_OPTION_LABELS);
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
