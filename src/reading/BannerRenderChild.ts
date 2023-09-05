import { MarkdownRenderChild, TFile, type MarkdownPostProcessorContext } from 'obsidian';

import Banner from '../banner/Banner.svelte';

import { plug } from 'src/main';
import { getSetting } from 'src/settings';

export default class BannerRenderChild extends MarkdownRenderChild {
  banner!: Banner;
  bannerData: BannerMetadata;
  contentEl: HTMLElement;
  pusherEl?: HTMLElement | null;
  file: TFile;
  prepareSwap = false;

  constructor(
    el: HTMLElement,
    ctx: MarkdownPostProcessorContext,
    bannerData: BannerMetadata,
    file: TFile
  ) {
    super(el);
    this.contentEl = ctx.containerEl;
    this.bannerData = bannerData;
    this.file = file;
  }

  private resizePusher(reset = false) {
    const height = reset ? '' : `${getSetting('height')}px`;
    this.pusherEl!.setCssStyles({ height });
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

  onload() {
    // Resize "pusher" element
    this.pusherEl = this.contentEl.querySelector<HTMLElement>('.markdown-preview-pusher');
    if (this.pusherEl) {
      this.resizePusher();
    } else {  // For edge cases when `.markdown-preview-pusher` has yet to be added
      this.waitForPusher();
    }

    // Listen for setting changes
    this.registerEvent(
      plug.events.on('setting-change', (changed) => {
        if ('height' in changed) {
          this.resizePusher();
        }
      })
    );

    // Create banner
    this.containerEl.addClass('obsidian-banner-wrapper');
    this.banner = new Banner({
      target: this.containerEl,
      props: { ...this.bannerData, file: this.file }
    });

  }

  onunload() {
    if (!this.prepareSwap) this.resizePusher(true);
    this.banner?.$destroy();
    this.containerEl.remove();
  }
}
