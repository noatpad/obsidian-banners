import type { MarkdownPostProcessor, TFile } from "obsidian";
import { plug } from "src/main";
import BannerRenderChild from "./BannerRenderChild";
import { extractBannerData, registerEvents } from "src/utils";
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
const resizePusher = (pusher: Maybe<HTMLElement>, reset = false) => {
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
  const showBanner = bannerData.src;
  const pusher = containerEl.querySelector('.markdown-preview-pusher') as Maybe<HTMLElement>;

  if (showBanner) {
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
    const { currentMode, previewMode } = leaf.view;
    if (currentMode.type === 'preview') {
      previewMode.rerender(true);
    }
  });
};

export const registerReadingBannerEvents = () => {
  registerEvents([
    plug.events.on('setting-change', (changed) => {
      if (changed.hasOwnProperty('height')) {
        plug.app.workspace.iterateRootLeaves((leaf) => {
          const { type, state } = leaf.getViewState();
          if (type === 'markdown' && state.mode === 'preview') {
            const pusher = leaf.view.containerEl.querySelector('.markdown-preview-pusher') as Maybe<HTMLElement>;
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
    const pusher = containerEl.querySelector('.markdown-preview-pusher') as Maybe<HTMLElement>;
    if (currentMode.type === 'preview') {
      // BUG: This won't rerender the Properties view and the inline title until you manually reload the view
      previewMode.rerender(true);
      resizePusher(pusher, true);
    }
  });
};
