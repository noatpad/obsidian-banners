import { MarkdownRenderChild, TFile } from 'obsidian';

import Banner from '../banner/Banner.svelte';

export default class BannerRenderChild extends MarkdownRenderChild {
  banner!: Banner;
  bannerData: BannerMetadata;
  file: TFile;

  constructor(containerEl: HTMLElement, bannerData: BannerMetadata, file: TFile) {
    super(containerEl);
    this.bannerData = bannerData;
    this.file = file;
  }

  onload() {
    this.containerEl.addClass('obsidian-banner-wrapper');
    this.banner = new Banner({
      target: this.containerEl,
      props: { ...this.bannerData, file: this.file }
    });
  }

  onunload() {
    this.banner?.$destroy();
    this.containerEl.remove();
  }
}
