import { PluginSettingTab, Setting } from "obsidian"
import Banners from "./main";

export interface ISettings {
  height: number,
  style: 'solid' | 'gradient'
}

export const DEFAULT_SETTINGS: ISettings = {
  height: 250,
  style: 'solid'
}

export default class SettingsTab extends PluginSettingTab {
  plugin: Banners;

  constructor(plugin: Banners) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  async saveSettings() {
    await this.plugin.saveData();
    this.plugin.events.trigger('settingsSave');
  }

  display() {
    const { containerEl } = this;
    const { height, style } = this.plugin.settings;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Banner height')
      .setDesc('Set how big the banner should be in pixels')
      .addText(text => {
        text.inputEl.type = 'number';
        text.setValue(`${height}`);
        text.setPlaceholder(`${DEFAULT_SETTINGS.height}`);
        text.onChange(async (val) => {
          this.plugin.settings.height = val ? parseInt(val) : DEFAULT_SETTINGS.height;
          await this.saveSettings();
        });
      });
  }
}
