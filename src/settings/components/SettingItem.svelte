<script lang="ts">
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { rawSettings } from '../store';
  import type { BannerSettings } from '../structure';

  export let key: keyof BannerSettings | undefined = undefined;
  const indent = getContext<number>('level') ?? 0;

  const update = (value: unknown) => {
    if (key) rawSettings.updateSetting(key, value);
  };

  $: value = key ? ($rawSettings[key] ?? '') : null;
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
