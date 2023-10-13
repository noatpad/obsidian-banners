import { derived, writable } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { plug } from 'src/main';
import { DEFAULT_SETTINGS, LENGTH_SETTINGS } from './structure';
import type { BannerSettings } from './structure';
import { parseCssSetting, saveSettings } from '.';

interface Store extends Writable<BannerSettings> {
  updateSetting: (key: keyof BannerSettings, value: unknown) => void;
}

export const rawSettings: Store = {
  ...writable<BannerSettings>(),
  updateSetting: async (key, value) => {
    const changed = { [key]: value };
    if (value !== undefined) {
      plug.settings = { ...plug.settings, ...changed };
    } else {
      delete plug.settings[key];
    }
    await saveSettings(changed);
  }
};

export const settings = derived(rawSettings, ($settings) => {
  const processed = { ...DEFAULT_SETTINGS, ...$settings } as Record<keyof BannerSettings, unknown>;
  let key: keyof BannerSettings;
  for (key in processed) {
    if (LENGTH_SETTINGS.includes(key)) {
      processed[key] = parseCssSetting(processed[key] as string);
    }
  }
  return processed as BannerSettings;
});

export default rawSettings;
