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
    const { iconHorizontalAlignment: ha, iconVerticalAlignment: va, titlePlacement: titlePlacement} = this.plugin.settings;

    this.containerEl.addClass('obsidian-banner-header');
    this.containerEl.addClass('obsidian-banner-icon', 'cm6-banner-icon', `h-${ha}`, `v-${va}`, `title-placement-${titlePlacement}`);
    this.wrapper.addClass('has-banner-header');
    if (this.icon) {
      const el = buildIcon(this.plugin, this.icon, this.file);
      this.containerEl.append(el);
    }

    if (this.title) {
      const titleSpan = document.createElement('span');
      titleSpan.addClass('obsidian-banner-title', 'HyperMD-header-1')

      titleSpan.textContent = this.title;
      this.containerEl.append(titleSpan);
    }
    this.wrapper.prepend(this.containerEl);
  }
}
