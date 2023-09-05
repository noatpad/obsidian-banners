import { writable  } from 'svelte/store';
import { plug } from 'src/main';
import { saveSettings } from '.';
import type { BannerSettings } from '.';
import type { Readable } from 'svelte/store';

interface SettingsStore extends Readable<BannerSettings> {
  set: (value: BannerSettings) => void;
  updateSetting: (key: keyof BannerSettings, value: any) => void;
}

const { subscribe, set } = writable<BannerSettings>();
const settingsStore: SettingsStore = {
  subscribe,
  set,
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
export default settingsStore;
