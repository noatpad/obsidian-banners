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
const resizePusher = (pusher: HTMLElement | null, reset = false) => {
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
  const pusher = containerEl.querySelector<HTMLElement>('.markdown-preview-pusher')!;

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
    // Listen for setting changes
    plug.events.on('setting-change', (changed) => {
      // Resize "preview pusher" when resizing banner size
      if (changed.hasOwnProperty('height')) {
        plug.app.workspace.iterateRootLeaves((leaf) => {
          if (doesLeafHaveMarkdownMode(leaf, 'reading')) {
            const pusher = leaf.view.containerEl.querySelector<HTMLElement>('.markdown-preview-pusher')!;
            resizePusher(pusher);
          }
        });
      }
    })
  ]);
};

/**
 * BUG: This won't rerender the Properties view and the inline title on the reading view until you manually
 * switch out and back into reading view; or reload the app
 */
export const unloadReadingViewBanners = () => {
  plug.app.workspace.iterateRootLeaves((leaf) => {
    const { containerEl, previewMode } = leaf.view;
    const pusher = containerEl.querySelector<HTMLElement>('.markdown-preview-pusher')!;
    if (doesLeafHaveMarkdownMode(leaf, 'reading')) {
      previewMode.rerender(true);
      resizePusher(pusher, true);
    }
  });
};
