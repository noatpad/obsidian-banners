import { PluginSettingTab } from 'obsidian';


import Settings from './Settings.svelte';
import store from './store';

import { plug } from 'src/main';

type StyleOption = 'solid' | 'gradient';

export interface BannerSettings {
  height: number;
  style: StyleOption;
  showInInternalEmbed: boolean;
  internalEmbedHeight: number;
}

export const DEFAULT_SETTINGS: BannerSettings = {
  height: 300,
  style: 'solid',
  showInInternalEmbed: true,
  internalEmbedHeight: 200
};

const STYLE_OPTION_LABELS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
};

export const SELECT_OPTIONS_MAP = { style: STYLE_OPTION_LABELS };

class SettingsTab extends PluginSettingTab {
  component: Settings | undefined;

  constructor() {
    super(plug.app, plug);
  }

  display() {
    this.component = this.component || new Settings({ target: this.containerEl });
  }

  hide() {
    this.component?.$destroy();
    this.component = undefined;
  }
}

/* TODO: The `value` parameter is redundant, but is implemented for Svelte store values.
 * Perhaps think of something cleaner */
export const getSetting = <T extends keyof BannerSettings>(
  key: T,
  value?: BannerSettings[T]
): BannerSettings[T] => (value ?? plug.settings[key] ?? DEFAULT_SETTINGS[key]);

export const loadSettings = async () => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, await plug.loadData()) as BannerSettings;
  for (const [key, val] of Object.entries(settings) as [keyof BannerSettings, unknown][]) {
    if (DEFAULT_SETTINGS[key] === val && typeof val === 'number') delete settings[key];
  }
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
