import { MarkdownRenderChild, TFile, type MarkdownPostProcessorContext } from 'obsidian';

import Banner from '../banner/Banner.svelte';

import { plug } from 'src/main';
import { getSetting } from 'src/settings';

const currentBanners: Record<string, boolean> = {};

export default class BannerRenderChild extends MarkdownRenderChild {
  banner!: Banner;
  bannerData: BannerMetadata;
  contentEl: HTMLElement;
  pusherEl?: HTMLElement | null;
  docId: string;
  file: TFile;

  constructor(
    el: HTMLElement,
    bannerData: BannerMetadata,
    ctx: MarkdownPostProcessorContext,
    file: TFile
  ) {
    super(el);
    this.bannerData = bannerData;
    this.contentEl = ctx.containerEl;
    this.docId = ctx.docId;
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

  /* Helper to "register" a banner instance, so that the pusher can be properly styled when
  a banner is being reloaded or removed */
  private registerInstance() {
    if (!(this.docId in currentBanners)) currentBanners[this.docId] = false;
    else if (!currentBanners[this.docId]) currentBanners[this.docId] = true;
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

    // Register banner instance for a view
    this.registerInstance();
  }

  onunload() {
    if (currentBanners[this.docId]) {
      currentBanners[this.docId] = false;
    } else {
      this.resizePusher(true);
      delete currentBanners[this.docId];
    }
    this.banner?.$destroy();
    this.containerEl.remove();
  }
}
