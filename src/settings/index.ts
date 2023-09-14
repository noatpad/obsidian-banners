import { plug } from 'src/main';
import { SettingsTab } from './SettingsTab';
import store from './store';
import { DEFAULT_SETTINGS, TEXT_SETTINGS } from './structure';
import type { BannerSettings, LengthValue } from './structure';
import { areSettingsOutdated, updateSettings } from './updater';

export const loadSettings = async () => {
  // Update settings from an older version if needed
  const data = await plug.loadData();
  if (areSettingsOutdated(data)) updateSettings(data);

  // Apply default settings where needed
  const settings = Object.assign(
    {},
    DEFAULT_SETTINGS,
    data,
    { version: plug.manifest.version }
  ) as BannerSettings;
  for (const [key, val] of Object.entries(settings) as [keyof BannerSettings, unknown][]) {
    if (
      DEFAULT_SETTINGS[key] === val &&
      (typeof val === 'number' || TEXT_SETTINGS.includes(key))
    ) delete settings[key];
  }

  // Load up settings and settings tab
  plug.settings = settings;
  await saveSettings();
  plug.addSettingTab(new SettingsTab());
};

export const saveSettings = async (changed: Partial<BannerSettings> = {}) => {
  await plug.saveData(plug.settings);
  store.set(plug.settings);
  plug.events.trigger('setting-change', changed);
  console.log(plug.settings);
};

/* NOTE: The `value` parameter is redundant, but is implemented for Svelte store values.
 * Perhaps think of something cleaner */
export const getSetting = <T extends keyof BannerSettings>(
  key: T,
  value?: BannerSettings[T]
): BannerSettings[T] => (value ?? plug.settings[key] ?? DEFAULT_SETTINGS[key]);

export const parseCssSetting = (value: LengthValue): string => (
  typeof value === 'number' ? `${value}px` : value
);
