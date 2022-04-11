import { MarkdownRenderChild, TFile } from 'obsidian';

import BannersPlugin from '../main';
import buildIcon from '../Icon';

export default class Icon extends MarkdownRenderChild {
  plugin: BannersPlugin;
  wrapper: HTMLElement;
  file: TFile;
  icon: string;

  constructor(plugin: BannersPlugin, wrapper: HTMLElement, icon: string, file: TFile) {
    super(document.createElement('div'));
    this.plugin = plugin;
    this.wrapper = wrapper;
    this.icon = icon;
    this.file = file;
  }

  onload() {
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va } = this.plugin.settings;

    this.wrapper.addClass('has-banner-icon');
    this.containerEl.addClass('obsidian-banner-icon', 'cm5-banner-icon', `h-${ha}`, `v-${va}`);

    const el = buildIcon(this.plugin, this.icon, this.file);
    this.containerEl.append(el);
    this.wrapper.prepend(this.containerEl);
  }
}
