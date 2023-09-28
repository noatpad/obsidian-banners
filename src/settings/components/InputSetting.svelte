<script lang='ts'>
  import type { HTMLInputTypeAttribute } from 'svelte/elements';
  import { DEFAULT_SETTINGS } from '../structure';
  import type { BannerSettings } from '../structure';
  import SettingItem from './SettingItem.svelte';

  type ChangeEvent = Event & { currentTarget: EventTarget & HTMLInputElement };

  export let key: keyof BannerSettings;
  export let type: HTMLInputTypeAttribute = 'text';
  export let numOrStr = false;

  const updateSetting = (update: (value: any) => void, e: ChangeEvent) => {
    const str = e.currentTarget.value || undefined;
    if (str === undefined) {
      update(undefined);
    } else if (numOrStr) {
      const number = +str;
      update(isNaN(number) ? str : number);
    } else {
      update(str);
    }
  };

  $: placeholder = (DEFAULT_SETTINGS[key] as number | string).toString();
</script>

<SettingItem {key}>
  <slot slot='name' name='name' />
  <slot slot='description' name='description' />
  <input
    slot='setting'
    let:value
    let:update
    {type}
    {value}
    {placeholder}
    on:change={(e) => updateSetting(update, e)}
  />
</SettingItem>
