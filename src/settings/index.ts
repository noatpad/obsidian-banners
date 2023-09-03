import { PluginSettingTab } from "obsidian";
import { plug } from "src/main";
import store from './store';
import Settings from './Settings.svelte';

type StyleOption = 'solid' | 'gradient';

export interface BannerSettings {
  height: number,
  style: StyleOption,
  showInInternalEmbed: boolean
};

export const DEFAULT_SETTINGS: BannerSettings = {
  height: 300,
  style: 'solid',
  showInInternalEmbed: true
};

const STYLE_OPTION_LABELS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
};

export const SELECT_OPTIONS_MAP = {
  style: STYLE_OPTION_LABELS
}

class SettingsTab extends PluginSettingTab {
  component: Maybe<Settings>;

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

export const getSetting = <T extends keyof BannerSettings>(key: T, value?: BannerSettings[T]): BannerSettings[T] => (
  value ?? plug.settings[key] ?? DEFAULT_SETTINGS[key]
);

export const loadSettings = async () => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, await plug.loadData()) as BannerSettings;
  for (const [key, val] of Object.entries(settings) as [keyof BannerSettings, any][]) {
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
}
