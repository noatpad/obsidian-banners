import { MarkdownRenderChild, Platform, TFile } from 'obsidian';
import type { MarkdownPostProcessorContext } from 'obsidian';
import { getSetting } from 'src/settings';
import type { BannerSettings } from 'src/settings';
import { registerSettingChangeEvent } from 'src/utils';
import Banner from '../banner/Banner.svelte';

export type Embedded = 'internal' | 'popover' | false;

export default class BannerRenderChild extends MarkdownRenderChild {
  banner!: Banner;
  bannerData: Partial<BannerMetadata>;
  contentEl: HTMLElement;
  pusherEl?: HTMLElement | null;
  file: TFile;
  embedded: Embedded;
  // heights: [string, string];
  prepareSwap = false;
  heightKey: keyof BannerSettings = 'height';

  constructor(
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
    bannerData: Partial<BannerMetadata>,
    file: TFile,
    embedded: Embedded
  ) {
    super(el);
    this.contentEl = ctx.containerEl;
    this.bannerData = bannerData;
    this.file = file;
    this.embedded = embedded;
    // this.heights = this.getHeights();

    if (this.embedded === 'internal') this.heightKey = 'internalEmbedHeight';
    else if (this.embedded === 'popover') this.heightKey = 'popoverHeight';
  }

  // private getHeights(): [string, string] {
  //   let heightKey: keyof BannerSettings = 'height';
  //   if (this.embedded === 'internal') heightKey = 'internalEmbedHeight';
  //   else if (this.embedded === 'popover') heightKey = 'popoverHeight';

  //   const bannerHeight = `${getSetting(heightKey)}px`;
  //   return [bannerHeight, '3em'];
  // }

  private getPusherSize(): string | null {
    const bannerHeight = Platform.isMobile
      ? getSetting('mobileHeight')
      : getSetting(this.heightKey) as number;

    if (this.bannerData.source) {
      return `${bannerHeight}px`;
    } else if (this.bannerData.icon) {
      return '3em';
    } else {
      return null;
    }
  }

  private resizePusher(reset = false) {
    // if (reset) {
    //   this.pusherEl!.setCssStyles({ marginTop: '' });
    // } else {
    //   const size = Platform.isMobile ? getSetting('mobileHeight') : getSetting(this.heightKey);
    //   this.pusherEl!.setCssStyles({ marginTop: `${size}px` });
    // }
    if (reset) return this.pusherEl!.setCssStyles({ marginTop: '' });
    const size = this.getPusherSize();
    this.pusherEl!.setCssStyles({ marginTop: size ?? '' });
  }

  // Helper to grab the pusher element once it's loaded in
  private waitForPusher() {
    const observer = new MutationObserver((mutations, observer) => {
      observer.disconnect();
      for (const { addedNodes } of mutations) {
        addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.hasClass('markdown-preview-pusher')) {
            this.pusherEl = node;
            this.resizePusher();
          }
        });
      }
    });
    observer.observe(this.contentEl, { childList: true });
  }

  private registerListener() {
    const cb = () => this.resizePusher();
    switch (this.embedded) {
      case 'internal': return registerSettingChangeEvent('internalEmbedHeight', cb);
      case 'popover': return registerSettingChangeEvent('popoverHeight', cb);
      default: return registerSettingChangeEvent(['height', 'mobileHeight'], cb);
    }
  }

  onload() {
    // Resize "pusher" element
    this.pusherEl = this.contentEl.querySelector<HTMLElement>('.markdown-preview-pusher');
    if (this.pusherEl) {
      this.resizePusher();
    } else {  // For edge cases when `.markdown-preview-pusher` has yet to be added
      this.waitForPusher();
    }

    // Listen for setting changes
    this.registerListener();

    // Create banner
    this.containerEl.addClass('obsidian-banner-wrapper');
    this.banner = new Banner({
      target: this.containerEl,
      props: {
        ...this.bannerData,
        embed: this.embedded,
        file: this.file
      }
    });

  }

  onunload() {
    if (!this.prepareSwap) this.resizePusher(true);
    this.banner?.$destroy();
    this.containerEl.remove();
  }
}
