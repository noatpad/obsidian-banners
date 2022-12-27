import { MarkdownRenderChild, TFile } from 'obsidian';

import BannersPlugin from '../main';
import buildIcon from '../Icon';

export default class Header extends MarkdownRenderChild {
  plugin: BannersPlugin;
  wrapper: HTMLElement;
  file: TFile;
  icon: string;
  title: string;
  constructor(title: string, icon: string, plugin: BannersPlugin, wrapper: HTMLElement, file: TFile) {
    super(document.createElement('div'));
    this.plugin = plugin;
    this.wrapper = wrapper;
    this.icon = icon;
    this.title = title;
    this.file = file;
  }

  onload() {
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va } = this.plugin.settings;
    /*
    this.wrapper.addClass('has-banner-header');
    this.containerEl.addClass('obsidian-banner-icon', 'cm5-banner-icon', `h-${ha}`, `v-${va}`);

    const el = buildIcon(this.plugin, this.icon, this.file);
    this.containerEl.append(el);
    this.wrapper.prepend(this.containerEl);
    */
    this.wrapper.addClass('has-banner-header');
    const titleSpan = document.createElement('span');
    titleSpan.addClass('title-box', 'cm-header', 'cm-header-1', 'HyperMD-header', 'HyperMD-header-1');
    titleSpan.textContent = this.title;

    if (this.icon) {
      this.containerEl.addClass('obsidian-banner-icon', 'cm5-banner-icon', `h-${ha}`, `v-${va}`);

      const el = buildIcon(this.plugin, this.icon, this.file);
      this.wrapper.append(el);
      this.wrapper.prepend(this.containerEl);
    }
    this.wrapper.append(titleSpan);
  }
}
