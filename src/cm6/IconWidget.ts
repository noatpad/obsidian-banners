import { TFile } from 'obsidian';
import { WidgetType } from '@codemirror/view';

import BannersPlugin from '../main';
import getIconElement from '../Icon';

export default class IconWidget extends WidgetType {
  plugin: BannersPlugin;
  icon: string;
  file: TFile;
  hasBanner: boolean;

  constructor(plugin: BannersPlugin, icon: string, file: TFile, hasBanner: boolean) {
    super();
    this.plugin = plugin;
    this.icon = icon;
    this.file = file;
    this.hasBanner = hasBanner;
  }

  eq(widget: IconWidget): boolean {
    const { icon, file, hasBanner } = widget;
    return this.icon === icon && this.file === file && this.hasBanner === hasBanner;
  }

  toDOM(): HTMLElement {
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va } = this.plugin.settings;
    const wrap = document.createElement('div');
    wrap.addClass('obsidian-banner-icon', 'cm6-banner-icon', `h-${ha}`, `v-${va}`);

    // Add extra styling rules when a banner is present
    if (this.hasBanner) {
      wrap.addClass('has-banner');
    }

    const el = getIconElement(this.plugin, this.icon, this.file);
    wrap.append(el);
    return wrap;
  }
}
