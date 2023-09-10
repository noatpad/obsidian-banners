import { MarkdownRenderChild, TFile } from 'obsidian';
import type { MarkdownPostProcessorContext } from 'obsidian';
import Banner from '../banner/Banner.svelte';

export type Embedded = 'internal' | 'popover' | false;

const PUSHER_CLASS = 'markdown-preview-pusher';

export default class BannerRenderChild extends MarkdownRenderChild {
  banner!: Banner;
  bannerData: Partial<BannerMetadata>;
  contentEl: HTMLElement;
  file: TFile;
  embedded: Embedded;

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
  }

  // Helper to grab the pusher element once it's loaded in
  private waitForPusher() {
    const observer = new MutationObserver((mutations, observer) => {
      observer.disconnect();
      for (const { addedNodes } of mutations) {
        addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.hasClass(PUSHER_CLASS)) {
            this.banner.$set({ sizerEl: node });
          }
        });
      }
    });
    observer.observe(this.contentEl, { childList: true });
  }

  prepareSwap() {
    this.banner.$set({ isSwapping: true });
  }

  onload() {
    // Resize "pusher" element
    const sizerEl = this.contentEl.querySelector<HTMLElement>(`.${PUSHER_CLASS}`);
    if (!sizerEl) this.waitForPusher();

    // Create banner
    this.containerEl.addClass('obsidian-banner-wrapper');
    this.banner = new Banner({
      target: this.containerEl,
      props: {
        ...this.bannerData,
        viewType: 'reading',
        embed: this.embedded,
        file: this.file,
        sizerEl
      }
    });
  }

  onunload() {
    this.banner?.$destroy();
    this.containerEl.remove();
  }
}
