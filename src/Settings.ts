import { PluginSettingTab, Setting } from "obsidian";
import Banners from "./main";

type StyleOption = 'solid' | 'gradient';
export interface SettingsOptions {
  height: number,
  style: StyleOption,
  showInEmbed: boolean,
  embedHeight: number,
  allowMobileDrag: boolean
}

export const DEFAULT_SETTINGS: SettingsOptions = {
  height: 250,
  style: 'solid',
  showInEmbed: true,
  embedHeight: 120,
  allowMobileDrag: false
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

  async saveSettings(refresh = false) {
    await this.plugin.saveData(this.plugin.settings);
    this.plugin.prepareStyles();
    this.plugin.events.trigger('settingsSave');
    if (refresh) {
      this.display();
    }
  }

  display() {
    const { containerEl } = this;
    const {
      height,
      style,
      showInEmbed,
      embedHeight,
      allowMobileDrag
    } = this.plugin.settings;
    containerEl.empty();

    // Banner height
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

    // Banner style
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

    // Show banner in embed
    new Setting(containerEl)
      .setName('Show banner in preview embed')
      .setDesc('Choose whether to display the banner in the page preview embed')
      .addToggle(toggle => toggle
        .setValue(showInEmbed)
        .onChange(async (val) => {
          this.plugin.settings.showInEmbed = val;
          await this.saveSettings(true);
        }));

    // Embed banner height
    if (this.plugin.settings.showInEmbed) {
      new Setting(containerEl)
      .setName('Embed banner height')
      .setDesc('Set the banner size inside the file preview embed')
      .addText(text => {
        text.inputEl.type = 'number';
        text.setValue(`${embedHeight}`);
        text.setPlaceholder(`${DEFAULT_SETTINGS.embedHeight}`);
        text.onChange(async (val) => {
          this.plugin.settings.embedHeight = val ? parseInt(val) : DEFAULT_SETTINGS.embedHeight;
          await this.saveSettings();
        });
      });
    }

    // Experimental setting for dragging banners in mobile
    new Setting(containerEl)
      .setName('Allow mobile drag')
      .setDesc('EXPERIMENTAL: Allow dragging the banner on mobile devices. App reload might be necessary')
      .addToggle(toggle => toggle
        .setValue(allowMobileDrag)
        .onChange(async (val) => {
          this.plugin.settings.allowMobileDrag = val;
          await this.saveSettings();
        }));
  }
}
