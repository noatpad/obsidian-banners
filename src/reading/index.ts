import type { MarkdownPostProcessor, TFile } from "obsidian";
import { plug } from "src/main";
import { BannerRenderChild } from "./BannerMD";
import { extractBannerData } from "src/utils";

const pusherObserver = new MutationObserver((mutations, observer) => {
  observer.disconnect();
  for (const { addedNodes } of mutations) {
    addedNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.hasClass('markdown-preview-pusher')) {
        node.setCssStyles({ marginTop: '300px' });
      }
    });
  }
});

const stylePusher = (toggle: boolean, containerEl: HTMLElement) => {
  const pusher = containerEl.querySelector('.markdown-preview-pusher') as Maybe<HTMLElement>;
  if (toggle) {
    if (pusher) {
      pusher.setCssStyles({ marginTop: '300px' });
    } else {
      // For edge cases when `.markdown-preview-pusher` has yet to be added
      pusherObserver.observe(containerEl, { childList: true });
    }
  } else {
    pusher?.setCssStyles({ marginTop: '' });
  }
}

const postprocessor: MarkdownPostProcessor = (el, ctx) => {
  // Only process the frontmatter
  if (!el.querySelector('pre.frontmatter')) return;

  const { containerEl, frontmatter, sourcePath } = ctx;
  const file = plug.app.metadataCache.getFirstLinkpathDest(sourcePath, '/') as TFile;
  const bannerData = extractBannerData(frontmatter);
  const showBanner = bannerData.src;

  if (showBanner) {
    const banner = new BannerRenderChild(el, bannerData, file);
    ctx.addChild(banner);
    stylePusher(true, containerEl);
  } else {
    stylePusher(false, containerEl);
  }
};

export const loadPostProcessor = () => {
  plug.registerMarkdownPostProcessor(postprocessor);

  // Properly insert a banner upon loading the plugin
  plug.app.workspace.iterateRootLeaves((leaf) => {
    const { currentMode, previewMode } = leaf.view;
    if (currentMode.type === 'preview') {
      previewMode.rerender(true);
    }
  });
};

export const unloadReadingViewBanners = () => {
  plug.app.workspace.iterateRootLeaves((leaf) => {
    const { containerEl, currentMode, previewMode } = leaf.view;
    if (currentMode.type === 'preview') {
      // BUG: This won't rerender the Properties view and the inline title until you manually reload the view
      previewMode.rerender(true);
      stylePusher(false, containerEl);
    }
  });
};
