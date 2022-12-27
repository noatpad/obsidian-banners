import { TFile } from 'obsidian';
import { WidgetType } from '@codemirror/view';
import buildIcon from '../Icon';
import BannersPlugin from '../main';
import { PartialSettings } from '../Settings';
import MetaManager from '../MetaManager';

export default class HeaderWidget extends WidgetType {
  plugin: BannersPlugin;
  title: string;
  icon: string;
  file: TFile;
  settingsFacet: PartialSettings;
  metaManager: MetaManager;

  constructor(title: string, icon: string, plugin: BannersPlugin, file: TFile, settingsFacet: PartialSettings) {
    super();
    this.plugin = plugin;
    this.title = title;
    this.icon = icon;
    this.file = file;
    this.settingsFacet = settingsFacet;
    this.metaManager = plugin.metaManager;
  }

  eq(widget: HeaderWidget): boolean {
    const { title, icon, file, settingsFacet } = widget;
    return (
      this.title === title &&
      this.icon === icon &&
      this.file === file &&
      this.settingsFacet === settingsFacet
    );
  }

  toDOM(): HTMLElement {
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va } = this.plugin.settings;
    // get inline-title class and delete it
    const wrap = document.createElement('div');
    wrap.addClass('obsidian-banner-header');

    if (this.icon) {
      wrap.addClass('obsidian-banner-icon', 'cm6-banner-icon', `h-${ha}`, `v-${va}`);

      const el = buildIcon(this.plugin, this.icon, this.file);
      wrap.append(el);
    }

    // title
    const titleDiv = document.createElement('div');
    titleDiv.addClass('banner-title', 'HyperMD-header-1')

    titleDiv.textContent = this.title;
    titleDiv.contentEditable = 'true';

    titleDiv.addEventListener('blur', (e) => {
      const newTitle = titleDiv.textContent;
      if (newTitle !== this.title) {
        this.title = newTitle;
        this.metaManager.upsertBannerData(this.file, { title: newTitle });
      }
    });

    titleDiv.addEventListener('click', (e) => {
      titleDiv.focus();
    });

    wrap.append(titleDiv);
    return wrap;
  }
}