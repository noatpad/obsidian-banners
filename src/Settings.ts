import { PluginSettingTab, Setting } from "obsidian"
import Banners from "./main";
import { SettingsOptions, StyleOption } from "./types";

export const DEFAULT_SETTINGS: SettingsOptions = {
  height: 250,
  style: 'solid'
}

const STYLE_OPTIONS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
}

export default class SettingsTab extends PluginSettingTab {
  plugin: Banners;

  constructor(plugin: Banners) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  async saveSettings() {
    await this.plugin.saveData(this.plugin.settings);
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

    new Setting(containerEl)
      .setName('Banner style')
      .setDesc('Set a style for all of your banners')
      .addDropdown(dropdown => dropdown
        .addOptions(STYLE_OPTIONS)
        .setValue(style)
        .onChange(async (val: StyleOption) => {
          this.plugin.settings.style = val;
          await this.saveSettings();
        }));
  }
}
