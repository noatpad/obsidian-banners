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

const postprocessor: MarkdownPostProcessor = (el, ctx) => {
  // Only process the frontmatter
  if (!el.querySelector('pre.frontmatter')) return;

  const { containerEl, frontmatter, sourcePath } = ctx;
  const file = plug.app.metadataCache.getFirstLinkpathDest(sourcePath, '/') as TFile;
  const bannerData = extractBannerData(frontmatter);
  const showBanner = bannerData.src;
  const pusher = containerEl.querySelector('.markdown-preview-pusher') as HTMLElement;

  if (showBanner) {
    const banner = new BannerRenderChild(el, bannerData, file);
    ctx.addChild(banner);

    if (pusher) {
      pusher.setCssStyles({ marginTop: '300px' });
    } else {
      // For edge cases when `.markdown-preview-pusher` has yet to be added
      pusherObserver.observe(containerEl, { childList: true });
    }
  } else {
    pusher.setCssStyles({ marginTop: '' });
  }
};

export default postprocessor;
