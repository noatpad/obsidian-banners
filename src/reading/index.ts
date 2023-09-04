import type { MarkdownPostProcessor, TFile } from "obsidian";
import { plug } from "src/main";
import BannerRenderChild from "./BannerRenderChild";
import { doesLeafHaveMarkdownMode, extractBannerData, registerEvents } from "src/utils";
import { getSetting } from "src/settings";

const pusherObserver = new MutationObserver((mutations, observer) => {
  observer.disconnect();
  for (const { addedNodes } of mutations) {
    addedNodes.forEach((node) => {
      if (node instanceof HTMLElement && node.hasClass('markdown-preview-pusher')) {
        resizePusher(node);
      }
    });
  }
});

// Helper function to style the "preview pusher" for banners
const resizePusher = (pusher: HTMLElement | undefined, reset = false) => {
  if (reset) {
    pusher?.setCssStyles({ height: '' });
    return;
  }
  pusher?.setCssStyles({ height: `${getSetting('height')}px` });
}

const postprocessor: MarkdownPostProcessor = (el, ctx) => {
  // Only process the frontmatter
  if (!el.querySelector('pre.frontmatter')) return;

  const { containerEl, frontmatter, sourcePath } = ctx;
  const file = plug.app.metadataCache.getFirstLinkpathDest(sourcePath, '/') as TFile;
  const bannerData = extractBannerData(frontmatter);
  const pusher = containerEl.querySelector('.markdown-preview-pusher') as HTMLElement;

  if (bannerData.source) {
    const banner = new BannerRenderChild(el, bannerData, file);
    ctx.addChild(banner);
    if (pusher) {
      resizePusher(pusher);
    } else {
      // For edge cases when `.markdown-preview-pusher` has yet to be added
      pusherObserver.observe(containerEl, { childList: true });
    }
  } else {
    resizePusher(pusher, true);
  }
};

export const loadPostProcessor = () => {
  plug.registerMarkdownPostProcessor(postprocessor);

  // Properly insert a banner upon loading the plugin
  plug.app.workspace.iterateRootLeaves((leaf) => {
    if (doesLeafHaveMarkdownMode(leaf, 'reading')) {
      leaf.view.previewMode.rerender(true);
    }
  });
};

export const registerReadingBannerEvents = () => {
  registerEvents([
    plug.events.on('setting-change', (changed) => {
      if (changed.hasOwnProperty('height')) {
        plug.app.workspace.iterateRootLeaves((leaf) => {
          if (doesLeafHaveMarkdownMode(leaf, 'reading')) {
            const pusher = leaf.view.containerEl.querySelector('.markdown-preview-pusher') as HTMLElement;
            resizePusher(pusher);
          }
        });
      }
    })
  ]);
};

export const unloadReadingViewBanners = () => {
  plug.app.workspace.iterateRootLeaves((leaf) => {
    const { containerEl, currentMode, previewMode } = leaf.view;
    const pusher = containerEl.querySelector('.markdown-preview-pusher') as HTMLElement;
    if (currentMode.type === 'preview') {
      // BUG: This won't rerender the Properties view and the inline title until you manually reload the view
      previewMode.rerender(true);
      resizePusher(pusher, true);
    }
  });
};
