<script lang="ts">
  import { slide } from 'svelte/transition';
  import settings from './store';
  import type { BannerSettings } from '.';

  export let key: keyof BannerSettings;
  const update = (value: any) => settings.updateSetting(key, value);
  $: value = $settings[key] ?? '';
</script>

<div class="setting-item" transition:slide>
  <div class="setting-item-info">
    <div class="setting-item-name">
      <slot name="name" />
    </div>
    <div class="setting-item-description">
      <slot name="description" />
    </div>
  </div>
  <div class="setting-item-control">
    <slot name="setting" {value} {update} />
  </div>
</div>
