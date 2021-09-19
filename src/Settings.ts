import { PluginSettingTab, Setting } from 'obsidian';
import BannersPlugin from './main';

type StyleOption = 'solid' | 'gradient';
export interface SettingsOptions {
  height: number,
  style: StyleOption,
  showInEmbed: boolean,
  embedHeight: number,
  showPreviewInLocalModal: boolean,
  bannersFolder: string,
  allowMobileDrag: boolean
}

export const DEFAULT_SETTINGS: SettingsOptions = {
  height: null,
  style: 'solid',
  showInEmbed: true,
  embedHeight: null,
  showPreviewInLocalModal: true,
  bannersFolder: '',
  allowMobileDrag: false
}

export const INITIAL_SETTINGS: Partial<SettingsOptions> = {
  height: 250,
  embedHeight: 120,
  bannersFolder: '/'
}

const STYLE_OPTIONS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
}

export default class SettingsTab extends PluginSettingTab {
  plugin: BannersPlugin;

  constructor(plugin: BannersPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  async saveSettings({ rerenderSettings = false, refreshViews = false } = {}) {
    await this.plugin.saveData(this.plugin.settings);
    this.plugin.loadStyles();

    if (rerenderSettings) { this.display() }
    if (refreshViews) { this.plugin.refreshViews() }
  }

  display() {
    const { containerEl } = this;
    const {
      height,
      style,
      showInEmbed,
      embedHeight,
      showPreviewInLocalModal,
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
        text.setPlaceholder(`${INITIAL_SETTINGS.height}`);
        text.onChange(async (val) => {
          this.plugin.settings.height = val ? parseInt(val) : null;
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
          await this.saveSettings({ refreshViews: true });
        }));

    // Show banner in embed
    new Setting(containerEl)
      .setName('Show banner in preview embed')
      .setDesc('Choose whether to display the banner in the page preview embed')
      .addToggle(toggle => toggle
        .setValue(showInEmbed)
        .onChange(async (val) => {
          this.plugin.settings.showInEmbed = val;
          await this.saveSettings({ rerenderSettings: true, refreshViews: true });
        }));

    // Embed banner height
    if (this.plugin.settings.showInEmbed) {
      new Setting(containerEl)
        .setName('Embed banner height')
        .setDesc('Set the banner size inside the file preview embed')
        .addText(text => {
          text.inputEl.type = 'number';
          text.setValue(`${embedHeight}`);
          text.setPlaceholder(`${INITIAL_SETTINGS.embedHeight}`);
          text.onChange(async (val) => {
            this.plugin.settings.embedHeight = val ? parseInt(val) : null;
            await this.saveSettings();
          });
        });
    }

    this.createHeader(
      'Local Image Modal',
      'Settings for the modal when you run the "Add/Change banner with local image" command'
    );

    new Setting(containerEl)
      .setName('Show preview images')
      .setDesc('Enabling this will display a preview of the images suggested')
      .addToggle(toggle => toggle
        .setValue(showPreviewInLocalModal)
        .onChange(async (val) => {
          this.plugin.settings.showPreviewInLocalModal = val;
          await this.saveSettings();
        }));

    this.createHeader(
      'Experimental Things',
      'Not as well-tested and probably have some finicky stuff in them'
    );

    // Drag banners in mobile
    new Setting(containerEl)
      .setName('Allow mobile drag')
      .setDesc('Allow dragging the banner on mobile devices. App reload might be necessary')
      .addToggle(toggle => toggle
        .setValue(allowMobileDrag)
        .onChange(async (val) => {
          this.plugin.settings.allowMobileDrag = val;
          await this.saveSettings({ refreshViews: true });
        }));
  }

  createHeader(text: string, desc: string = null) {
    const header = this.containerEl.createDiv({ cls: 'setting-item setting-item-heading banner-setting-header' });
    header.createEl('p', { text });
    if (desc) {
      header.createEl('p', { text: desc, cls: 'banner-setting-header-description' });
    }
  }
}
