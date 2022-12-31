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
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va, titlePlacement: titlePlacement} = this.plugin.settings;
    // get inline-title class and delete it
    const wrap = document.createElement('div');
    console.log(`title-placement-${titlePlacement}`)
    wrap.addClass('obsidian-banner-header', `title-placement-${titlePlacement}`);
    wrap.addClass('obsidian-banner-icon', `h-${ha}`, `v-${va}`);
    if (this.icon) {
      const el = buildIcon(this.plugin, this.icon, this.file);
      wrap.append(el);
    }

    // title
    const titleDiv = document.createElement('div');
    titleDiv.addClass('obsidian-banner-title', 'HyperMD-header-1')
    titleDiv.textContent = this.title;
    titleDiv.contentEditable = 'true';
    titleDiv.addEventListener('blur', (e) => {

      const newTitle = titleDiv.textContent;
      if (newTitle !== this.title) {
        this.title = newTitle;
        this.metaManager.upsertBannerData(this.file, { title: newTitle });
      }
    });

    titleDiv.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        titleDiv.blur();
      }
    });

    titleDiv.addEventListener('click', (e) => {
      titleDiv.focus();
    });

    wrap.append(titleDiv);
    return wrap;
  }
}