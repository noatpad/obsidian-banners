import { PluginSettingTab, Setting } from 'obsidian';
import { title } from 'process';

import BannersPlugin from './main';

type StyleOption = 'solid' | 'gradient';
export type BannerDragModOption = 'none' | 'shift' | 'ctrl' | 'alt' | 'meta';
type IconHorizontalOption = 'left' | 'center' | 'right' | 'custom';
type IconVerticalOption = 'above' | 'center' | 'below' | 'custom';
type TitlePlacementOption = 'below-icon' | 'next-to-icon';

export interface ISettingsOptions {
  height: number,
  style: StyleOption,
  showInInternalEmbed: boolean,
  internalEmbedHeight: number,
  showInPreviewEmbed: boolean,
  previewEmbedHeight: number,
  frontmatterField: string,
  bannerDragModifier: BannerDragModOption,
  iconHorizontalAlignment: IconHorizontalOption,
  iconHorizontalTransform: string,
  iconVerticalAlignment: IconVerticalOption,
  iconVerticalTransform: string,
  useTwemoji: boolean,
  showPreviewInLocalModal: boolean,
  localSuggestionsLimit: number,
  bannersFolder: string,
  allowMobileDrag: boolean,
  titlePlacement: TitlePlacementOption
};
export type PartialSettings = Partial<ISettingsOptions>;

interface ISaveOptions {
  reloadSettings?: boolean,
  refreshViews?: boolean
}

export const INITIAL_SETTINGS: ISettingsOptions = {
  height: null,
  style: 'solid',
  showInInternalEmbed: true,
  internalEmbedHeight: null,
  showInPreviewEmbed: true,
  previewEmbedHeight: null,
  frontmatterField: null,
  bannerDragModifier: 'none',
  iconHorizontalAlignment: 'left',
  iconHorizontalTransform: null,
  iconVerticalAlignment: 'center',
  iconVerticalTransform: null,
  useTwemoji: true,
  showPreviewInLocalModal: true,
  localSuggestionsLimit: null,
  bannersFolder: null,
  allowMobileDrag: false,
  titlePlacement: 'next-to-icon'
};

export const DEFAULT_VALUES: PartialSettings = {
  height: 250,
  internalEmbedHeight: 200,
  previewEmbedHeight: 120,
  frontmatterField: 'banner',
  iconHorizontalTransform: '0px',
  iconVerticalTransform: '0px',
  localSuggestionsLimit: 10,
  bannersFolder: '/'
};

const STYLE_OPTIONS: Record<StyleOption, string> = {
  solid: 'Solid',
  gradient: 'Gradient'
};

const BANNER_DRAG_MOD_OPTIONS: Record<BannerDragModOption, string> = {
  none: 'None',
  shift: '⇧ Shift',
  ctrl: '⌃ Ctrl',
  alt: '⎇ Alt',
  meta: '⌘ Meta'
}

const ICON_HORIZONTAL_OPTIONS: Record<IconHorizontalOption, string> = {
  left: 'Left',
  center: 'Center',
  right: 'Right',
  custom: 'Custom'
};

const ICON_VERTICAL_OPTIONS: Record<IconVerticalOption, string> = {
  above: 'Above',
  center: 'Center',
  below: 'Below',
  custom: 'Custom'
};
const TITLE_PLACEMENT_OPTIONS: Record<TitlePlacementOption, string> = {
  'below-icon': 'Below icon',
  'next-to-icon': 'Next to icon on the right'
};

export default class SettingsTab extends PluginSettingTab {
  plugin: BannersPlugin;

  constructor(plugin: BannersPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
    this.containerEl.addClass('banner-settings');
  }

  async saveSettings(changed: PartialSettings, options: ISaveOptions = {}) {
    this.plugin.settings = { ...this.plugin.settings, ...changed };
    await this.plugin.saveData(this.plugin.settings);
    this.plugin.loadStyles();

    const { refreshViews, reloadSettings } = options;
    if (reloadSettings) { this.display() }
    if (refreshViews) { this.plugin.refreshViews() }
  }

  display() {
    const { containerEl } = this;
    const {
      height,
      style,
      showInInternalEmbed,
      internalEmbedHeight,
      showInPreviewEmbed,
      previewEmbedHeight,
      frontmatterField,
      bannerDragModifier,
      iconHorizontalAlignment,
      iconHorizontalTransform,
      iconVerticalAlignment,
      iconVerticalTransform,
      useTwemoji,
      showPreviewInLocalModal,
      localSuggestionsLimit,
      bannersFolder,
      allowMobileDrag,
      titlePlacement
    } = this.plugin.settings;
    containerEl.empty();

    this.createHeader(
      "Banners",
      "A nice, lil' thing to add some flair to your notes"
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

    // Show banner in internal embed
    new Setting(containerEl)
      .setName('Show banner in internal embed')
      .setDesc(createFragment(frag => {
        frag.appendText('Choose whether to display the banner in the internal embed. This is the embed that appears when you write ');
        frag.createEl('code', { text: '![[file]]' });
        frag.appendText(' in a file');
      }))
      .addToggle(toggle => toggle
        .setValue(showInInternalEmbed)
        .onChange(async (val) => this.saveSettings({ showInInternalEmbed: val }, { reloadSettings: true, refreshViews: true })));

    // Internal embed banner height
    if (this.plugin.settings.showInInternalEmbed) {
      new Setting(containerEl)
        .setName('Internal embed banner height')
        .setDesc('Set the banner size inside the internal embed')
        .addText(text => {
          text.inputEl.type = 'number';
          text.setValue(`${internalEmbedHeight}`);
          text.setPlaceholder(`${DEFAULT_VALUES.internalEmbedHeight}`);
          text.onChange(async (val) => this.saveSettings({ internalEmbedHeight: val ? parseInt(val) : null }));
        });
    }

    // Show banner in preview embed
    new Setting(containerEl)
      .setName('Show banner in preview embed')
      .setDesc(createFragment(frag => {
        frag.appendText('Choose whether to display the banner in the page preview embed. This is the embed that appears from the ');
        frag.createEl('span', { text: 'Page Preview ', attr: { style: 'color: --var(text-normal)' } });
        frag.appendText('core plugin')
      }))
      .addToggle(toggle => toggle
        .setValue(showInPreviewEmbed)
        .onChange(async (val) => this.saveSettings({ showInPreviewEmbed: val }, { reloadSettings: true })));

    // Preview embed banner height
    if (this.plugin.settings.showInPreviewEmbed) {
      new Setting(containerEl)
        .setName('Preview embed banner height')
        .setDesc('Set the banner size inside the page preview embed')
        .addText(text => {
          text.inputEl.type = 'number';
          text.setValue(`${previewEmbedHeight}`);
          text.setPlaceholder(`${DEFAULT_VALUES.previewEmbedHeight}`);
          text.onChange(async (val) => this.saveSettings({ previewEmbedHeight: val ? parseInt(val) : null }));
        });
    }

    // Customizable banner metadata fields
    new Setting(containerEl)
      .setName('Frontmatter field name')
      .setDesc(createFragment(frag => {
        frag.appendText('Set a customizable frontmatter field to use for banner data.');
        frag.createEl('br');
        frag.appendText('For example, the default value ');
        frag.createEl('code', { text: DEFAULT_VALUES.frontmatterField });
        frag.appendText(' will use the fields ');
        frag.createEl('code', { text: DEFAULT_VALUES.frontmatterField });
        frag.appendText(', ');
        frag.createEl('code', { text: `${DEFAULT_VALUES.frontmatterField}_x` });
        frag.appendText(', ');
        frag.createEl('code', { text: `${DEFAULT_VALUES.frontmatterField}_y` });
        frag.appendText(', and so on...');
      }))
      .addText(text => text
        .setValue(frontmatterField)
        .setPlaceholder(DEFAULT_VALUES.frontmatterField)
        .onChange(async (val) => this.saveSettings({ frontmatterField: val || null }, { refreshViews: true })));

    // Banner drag modifier key
    new Setting(containerEl)
      .setName('Banner drag modifier key')
      .setDesc(createFragment(frag => {
        frag.appendText('Set a modifier key that must be used to drag a banner.');
        frag.createEl('br');
        frag.appendText('For example, setting it to ');
        frag.createEl('b', { text: '⇧ Shift' });
        frag.appendText(' means that you must hold down Shift as you drag the banner to move it. This can help to avoid accidental banner shifts.');
      }))
      .addDropdown(dropdown => dropdown
        .addOptions(BANNER_DRAG_MOD_OPTIONS)
        .setValue(bannerDragModifier)
        .onChange(async (val: BannerDragModOption) => {
          await this.saveSettings({ bannerDragModifier: val }, { refreshViews: true });
          this.plugin.toggleBannerCursor(val === 'none');
        }));

    this.createHeader(
      'Banner Header',
      'Give people a lil\' notion of what your note is about'
    );

    // Horizontal icon alignment
    const settingHIA = new Setting(containerEl)
      .setName('Horizontal alignment')
      .setDesc(createFragment(frag => {
        frag.appendText('Align the icon horizontally.');
        frag.createEl('br');;
        frag.appendText('If set to ');
        frag.createEl('b', { text: 'Custom' });
        frag.appendText(', you can set an offset, relative to the left side of the note. This can be any valid ');
        frag.createEl('a', { text: 'CSS length value', href: 'https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths' });
        frag.appendText(', such as ');
        frag.createEl('code', { text: '10px' });
        frag.appendText(', ');
        frag.createEl('code', { text: '-30%' });
        frag.appendText(', ');
        frag.createEl('code', { text: 'calc(1em + 10px)' });
        frag.appendText(', and so on...');
      }));
    if (iconHorizontalAlignment === 'custom') {
      settingHIA.addText(text => text
        .setValue(iconHorizontalTransform)
        .setPlaceholder(DEFAULT_VALUES.iconHorizontalTransform)
        .onChange(async (val) => this.saveSettings({ iconHorizontalTransform: val || null }, { refreshViews: true })));
    }
    settingHIA.addDropdown(dd => dd
      .addOptions(ICON_HORIZONTAL_OPTIONS)
      .setValue(iconHorizontalAlignment)
      .onChange(async (val: IconHorizontalOption) => this.saveSettings({ iconHorizontalAlignment: val }, { reloadSettings: true, refreshViews: true })));

    // Vertical icon alignment
    const settingVIA = new Setting(containerEl)
      .setName('Vertical alignment')
      .setDesc(createFragment(frag => {
        frag.appendText('Align the icon vertically, relative to a banner (if any).');
        frag.createEl('br');;
        frag.appendText('If set to ');
        frag.createEl('b', { text: 'Custom' });
        frag.appendText(', you can set an offset, relative to the center of a banner\'s lower edge. This follows the same format as the setting above.');
      }));
    if (iconVerticalAlignment === 'custom') {
      settingVIA.addText(text => text
        .setValue(iconVerticalTransform)
        .setPlaceholder(DEFAULT_VALUES.iconVerticalTransform)
        .onChange(async (val) => this.saveSettings({ iconVerticalTransform: val || null }, { refreshViews: true })));
    }
    settingVIA.addDropdown(dd => dd
      .addOptions(ICON_VERTICAL_OPTIONS)
      .setValue(iconVerticalAlignment)
      .onChange(async (val: IconVerticalOption) => this.saveSettings({ iconVerticalAlignment: val }, { reloadSettings: true, refreshViews: true })));

    new Setting(containerEl)
      .setName('Use Twemoji')
      .setDesc(createFragment(frag => {
        frag.appendText('Twitter\'s emoji have better support here. ');
        frag.createEl('b', { text: 'NOTE: ' })
        frag.appendText('This is only applied in the Icon modal and the banner icon in the preview view');
      }))
      .addToggle(toggle => toggle
        .setValue(useTwemoji)
        .onChange(async (val) => this.saveSettings({ useTwemoji: val }, { refreshViews: true })));


    new Setting(containerEl)
      .setName('Banner title placement')
      .setDesc('Set the position of the banner title')
      .addDropdown(dropdown => dropdown
        .addOptions(TITLE_PLACEMENT_OPTIONS)
        .setValue(titlePlacement)
        .onChange(async (val: TitlePlacementOption) => {
          // For some reason it doesn't update instantly when I just save the setting and refresh the view
          if (val === 'below-icon') {
            const bannerHeader = document.querySelector('.obsidian-banner-header');
            if (bannerHeader) {
              bannerHeader.classList.add('title-placement-below-icon');
              bannerHeader.classList.remove('title-placement-next-to-icon');
            }
          } else if (val === 'next-to-icon') {
            const bannerHeader = document.querySelector('.obsidian-banner-header');
            if (bannerHeader) {
              bannerHeader.classList.add('title-placement-next-to-icon');
              bannerHeader.classList.remove('title-placement-below-icon');
            }
          }
          this.saveSettings({ titlePlacement: val }, { reloadSettings: true, refreshViews: true })
        }));

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
        frag.createEl('b', { text: 'NOTE: ' });
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
        .onChange(async (val) => this.saveSettings({ bannersFolder: val || null })));

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

  private createHeader(text: string, desc: string = null) {
    const header = this.containerEl.createDiv({ cls: 'setting-item setting-item-heading banner-setting-header' });
    header.createEl('p', { text, cls: 'banner-setting-header-title' });
    if (desc) {
      header.createEl('p', { text: desc, cls: 'banner-setting-header-description' });
    }
  }
}
