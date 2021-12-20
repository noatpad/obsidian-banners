import { PluginSettingTab, Setting } from 'obsidian';
import BannersPlugin from './main';

type StyleOption = 'solid' | 'gradient';
export interface SettingsOptions {
  height: number,
  style: StyleOption,
  showInEmbed: boolean,
  embedHeight: number,
  frontmatterField: string,
  showPreviewInLocalModal: boolean,
  localSuggestionsLimit: number,
  bannersFolder: string,
  allowMobileDrag: boolean
}

export const INITIAL_SETTINGS: SettingsOptions = {
  height: null,
  style: 'solid',
  showInEmbed: true,
  embedHeight: null,
  frontmatterField: null,
  showPreviewInLocalModal: true,
  localSuggestionsLimit: null,
  bannersFolder: null,
  allowMobileDrag: false
}

export const DEFAULT_VALUES: Partial<SettingsOptions> = {
  height: 250,
  embedHeight: 120,
  frontmatterField: 'banner',
  localSuggestionsLimit: 10,
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

  async saveSettings(changed: Partial<SettingsOptions>, { reloadSettings = false, refreshViews = false } = {}) {
    this.plugin.settings = { ...this.plugin.settings, ...changed };
    await this.plugin.saveData(this.plugin.settings);
    this.plugin.loadStyles();

    if (reloadSettings) { this.display() }
    if (refreshViews) { this.plugin.refreshViews() }
  }

  display() {
    const { containerEl } = this;
    const {
      height,
      style,
      showInEmbed,
      embedHeight,
      frontmatterField,
      showPreviewInLocalModal,
      localSuggestionsLimit,
      bannersFolder,
      allowMobileDrag
    } = this.plugin.settings;
    containerEl.empty();

    this.createHeader(
      "Banners",
      "A nice, lil' thing to add some presentation to your notes"
    );

    // Banner height
    new Setting(containerEl)
      .setName('Banner height')
      .setDesc('Set how big the banner should be in pixels')
      .addText(text => {
        text.inputEl.type = 'number';
        text.setValue(`${height}`);
        text.setPlaceholder(`${DEFAULT_VALUES.height}`);
        text.onChange(async (val) => this.saveSettings({ height: val ? parseInt(val) : null }));
      });

    // Banner style
    new Setting(containerEl)
      .setName('Banner style')
      .setDesc('Set a style for all of your banners')
      .addDropdown(dropdown => dropdown
        .addOptions(STYLE_OPTIONS)
        .setValue(style)
        .onChange(async (val: StyleOption) => this.saveSettings({ style: val }, { refreshViews: true })));

    // Show banner in embed
    new Setting(containerEl)
      .setName('Show banner in preview embed')
      .setDesc('Choose whether to display the banner in the page preview embed')
      .addToggle(toggle => toggle
        .setValue(showInEmbed)
        .onChange(async (val) => this.saveSettings({ showInEmbed: val }, { reloadSettings: true, refreshViews: true })));

    // Embed banner height
    if (this.plugin.settings.showInEmbed) {
      new Setting(containerEl)
        .setName('Embed banner height')
        .setDesc('Set the banner size inside the file preview embed')
        .addText(text => {
          text.inputEl.type = 'number';
          text.setValue(`${embedHeight}`);
          text.setPlaceholder(`${DEFAULT_VALUES.embedHeight}`);
          text.onChange(async (val) => this.saveSettings({ embedHeight: val ? parseInt(val) : null }));
        });
    }

    // Customizable banner metadata fields
    new Setting(containerEl)
      .setName('Frontmatter field name')
      .setDesc(createFragment(frag => {
        frag.appendText('Set a customizable frontmatter field to use for banner data');
        frag.createEl('br');
        frag.appendText('For example, the default value ')
        frag.createEl('code', { text: DEFAULT_VALUES.frontmatterField })
        frag.appendText(' will use the fields ')
        frag.createEl('code', { text: DEFAULT_VALUES.frontmatterField })
        frag.appendText(', ');
        frag.createEl('code', { text: `${DEFAULT_VALUES.frontmatterField}_x` })
        frag.appendText(', ');
        frag.createEl('code', { text: `${DEFAULT_VALUES.frontmatterField}_y` })
        frag.appendText(', and so on...');
      }))
      .addText(text => text
        .setValue(frontmatterField)
        .setPlaceholder(DEFAULT_VALUES.frontmatterField)
        .onChange(async (val) => this.saveSettings({ frontmatterField: val || null }, { refreshViews: true })));

    this.createHeader(
      'Local Image Modal',
      'For the modal that shows when you run the "Add/Change banner with local image" command'
    );

    // Show preview images in local image modal
    new Setting(containerEl)
      .setName('Show preview images')
      .setDesc('Enabling this will display a preview of the images suggested')
      .addToggle(toggle => toggle
        .setValue(showPreviewInLocalModal)
        .onChange(async (val) => this.saveSettings({ showPreviewInLocalModal: val })));

    // Limit of suggestions in local image modal
    new Setting(containerEl)
      .setName('Suggestions limit')
      .setDesc(createFragment(frag => {
        frag.appendText('Show up to this many suggestions when searching through local images.');
        frag.createEl('br');
        frag.createEl('b', { text: 'NOTE: '});
        frag.appendText('Using a high number while ');
        frag.createEl('span', { text: 'Show preview images ', attr: { style: 'color: var(--text-normal)' } });
        frag.appendText('is on can lead to some slowdowns');
      }))
      .addText(text => {
        text.inputEl.type = 'number';
        text.setValue(`${localSuggestionsLimit}`);
        text.setPlaceholder(`${DEFAULT_VALUES.localSuggestionsLimit}`);
        text.onChange(async (val) => this.saveSettings({ localSuggestionsLimit: val ? parseInt(val) : null }));
      });

    // Search in a specific folder for banners
    new Setting(containerEl)
      .setName('Banners folder')
      .setDesc(createFragment(frag => {
        frag.appendText('Select a folder to exclusively search for banner files in.');
        frag.createEl('br');
        frag.appendText('If empty, it will search the entire vault for image files');
      }))
      .addText(text => text
        .setValue(bannersFolder)
        .setPlaceholder(DEFAULT_VALUES.bannersFolder)
        .onChange(async (val) => this.saveSettings({ bannersFolder: val || null } )));

    this.createHeader(
      'Experimental Things',
      'Not as well-tested and probably finicky'
    );

    // Drag banners in mobile
    new Setting(containerEl)
      .setName('Allow mobile drag')
      .setDesc(createFragment(frag => {
        frag.appendText('Allow dragging the banner on mobile devices.');
        frag.createEl('br');
        frag.createEl('b', { text: 'NOTE: ' });
        frag.appendText('App reload might be necessary');
      }))
      .addToggle(toggle => toggle
        .setValue(allowMobileDrag)
        .onChange(async (val) => this.saveSettings({ allowMobileDrag: val }, { refreshViews: true })));
  }

  createHeader(text: string, desc: string = null) {
    const header = this.containerEl.createDiv({ cls: 'setting-item setting-item-heading banner-setting-header' });
    header.createEl('p', { text });
    if (desc) {
      header.createEl('p', { text: desc, cls: 'banner-setting-header-description' });
    }
  }
}
