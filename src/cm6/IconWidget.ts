import { TFile } from 'obsidian';
import { WidgetType } from '@codemirror/view';

import BannersPlugin from '../main';
import buildIcon from '../Icon';
import { PartialSettings } from '../Settings';

export default class IconWidget extends WidgetType {
  plugin: BannersPlugin;
  icon: string;
  file: TFile;
  settingsFacet: PartialSettings;

  constructor(plugin: BannersPlugin, icon: string, file: TFile, settingsFacet: PartialSettings) {
    super();
    this.plugin = plugin;
    this.icon = icon;
    this.file = file;
    this.settingsFacet = settingsFacet;
  }

  eq(widget: IconWidget): boolean {
    const { icon, file, settingsFacet } = widget;
    return (
      this.icon === icon &&
      this.file === file &&
      this.settingsFacet === settingsFacet
    );
  }

  toDOM(): HTMLElement {
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va } = this.plugin.settings;
    const wrap = document.createElement('div');
    wrap.addClass('obsidian-banner-icon', 'cm6-banner-icon', `h-${ha}`, `v-${va}`);

    const el = buildIcon(this.plugin, this.icon, this.file);
    wrap.append(el);
    return wrap;
  }
}
