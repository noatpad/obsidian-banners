<script lang="ts">
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import settings from '../store';
  import type { BannerSettings } from '..';

  export let key: keyof BannerSettings;
  const indent = getContext<number>('level') ?? 0;

  const update = (value: any) => settings.updateSetting(key, value);

  $: value = $settings[key] ?? '';
  $: margin = indent ? `${indent * 1.5}em` : '';
</script>

<div class="setting-item" style:margin-left={margin} transition:slide>
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
