import { MarkdownRenderChild } from 'obsidian';

import BannersPlugin from '../main';
import { IMPPCPlus } from './index';
import { IBannerMetadata } from '../MetaManager';
import getBannerElements from '../Banner';

export default class Banner extends MarkdownRenderChild {
  wrapper: HTMLElement;
  plugin: BannersPlugin;
  ctx: IMPPCPlus;
  bannerData: IBannerMetadata
  isEmbed: boolean;

  constructor(
    plugin: BannersPlugin,
    wrapper: HTMLElement,
    ctx: IMPPCPlus,
    bannerData: IBannerMetadata,
    isEmbed: boolean
  ) {
    super(document.createElement('div'));
    this.plugin = plugin;
    this.wrapper = wrapper;
    this.ctx = ctx;
    this.bannerData = bannerData;
    this.isEmbed = isEmbed;
  }

  onload() {
    const { style } = this.plugin.settings;
    const { containerEl: contentEl, sourcePath } = this.ctx;

    this.wrapper.addClass('obsidian-banner-wrapper');
    this.containerEl.addClass('obsidian-banner', 'cm5-banner', style);

    const elements = getBannerElements(this.plugin, this.bannerData, sourcePath, this.containerEl, contentEl, this.isEmbed);
    this.containerEl.append(...elements);
    this.wrapper.prepend(this.containerEl);
  }
}
