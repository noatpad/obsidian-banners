<script lang="ts">
    import SettingItem from './SettingItem.svelte';

    export let text: string;
    export let disabled = false;
    export let onClick: () => void;
</script>

<SettingItem>
  <slot slot="name" name="name" />
  <slot slot="description" name="description" />
  <button slot="setting" {disabled} on:click={onClick}>
    {text}
  </button>
</SettingItem>
