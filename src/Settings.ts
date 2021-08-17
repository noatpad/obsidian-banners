import { PluginSettingTab, Setting } from "obsidian"
import Banners from "./main";

// export interface ISettings {
//   data: { [key: string]: {
//     x: number,
//     y: number
//   }},
//   settings: {
//     style: 'solid' | 'gradient'
//   }
// }

export default class SettingsTab extends PluginSettingTab {
  plugin: Banners;

  constructor(plugin: Banners) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  // async saveSettings() {
  //   await this.plugin.saveData(this.plugin.settings);
  // }

  display() {
    const { containerEl } = this;
    containerEl.empty();
  }
}
