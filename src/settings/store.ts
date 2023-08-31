import { writable, type Readable } from "svelte/store";
import type { BannerSettings } from ".";
import { plug } from "src/main";

interface SettingsStore extends Readable<BannerSettings> {
  set: (value: BannerSettings) => void,
  updateSetting: (key: keyof BannerSettings, value: any) => void
}

const { subscribe, set } = writable<BannerSettings>();
const settingsStore: SettingsStore = {
  subscribe,
  set,
  updateSetting: async (key, value) => {
    if (value !== undefined) {
      plug.settings = { ...plug.settings, [key]: value };
    } else {
      delete plug.settings[key];
    }
    await plug.saveData(plug.settings);
    set(plug.settings);
    console.log(plug.settings);
  }
}
export default settingsStore;
