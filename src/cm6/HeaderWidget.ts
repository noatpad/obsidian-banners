import { TFile } from 'obsidian';
import { WidgetType } from '@codemirror/view';
import buildIcon from '../Icon';
import BannersPlugin from '../main';
import { PartialSettings } from '../Settings';
import MetaManager from '../MetaManager';

export default class TitleWidget extends WidgetType {
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

  eq(widget: TitleWidget): boolean {
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
    wrap.addClass('cm-line', 'obsidian-banner-header');

    if (this.icon) {
      wrap.addClass('obsidian-banner-icon', 'cm6-banner-icon', `h-${ha}`, `v-${va}`);

      const el = buildIcon(this.plugin, this.icon, this.file);
      wrap.append(el);
    }

    // title
    const titleSpan = document.createElement('span');
    titleSpan.addClass('title',)

    titleSpan.textContent = this.title;
    titleSpan.contentEditable = 'true';
    titleSpan.addEventListener('input', (e) => {
      this.title = titleSpan.textContent;
      this.metaManager.upsertBannerData(this.file, { title: this.title });
    });
    titleSpan.addEventListener('click', (e) => {
      titleSpan.contentEditable = 'true';
      titleSpan.focus();
    });

    wrap.append(titleSpan);
    return wrap;
  }
}