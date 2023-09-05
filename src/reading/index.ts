import type { MarkdownPostProcessor } from 'obsidian';

import BannerRenderChild from './BannerRenderChild';

import { plug } from 'src/main';
import { getSetting } from 'src/settings';
import { extractBannerData } from 'src/utils';

const rerender = () => {
  for (const leaf of plug.app.workspace.getLeavesOfType('markdown')) {
    const { previewMode } = leaf.view;
    const sections = previewMode.renderer.sections.filter((s) => (
      s.el.querySelector('.frontmatter, .internal-embed')
    ));
    for (const section of sections) {
      section.rendered = false;
      section.html = '';
    }
    previewMode.renderer.queueRender();
  }
};

const postprocessor: MarkdownPostProcessor = (el, ctx) => {
  // Only process the frontmatter
  if (!el.querySelector('pre.frontmatter')) return;

  const { containerEl, frontmatter, sourcePath } = ctx;
  console.log(getSetting('showInInternalEmbed'));
  if (!getSetting('showInInternalEmbed') && containerEl.closest('.internal-embed')) return;

  const file = plug.app.metadataCache.getFirstLinkpathDest(sourcePath, '/')!;
  const bannerData = extractBannerData(frontmatter);

  if (bannerData.source) {
    ctx.addChild(new BannerRenderChild(el, bannerData, ctx, file));
  }
};

export const loadPostProcessor = () => {
  plug.registerMarkdownPostProcessor(postprocessor);
  rerender();
};

export const registerReadingBannerEvents = () => {
  plug.registerEvent(
    plug.events.on('setting-change', (changed) => {
      if ('showInInternalEmbed' in changed) {
        rerender();
      }
    })
  );
};

/* BUG: This doesn't rerender banners in internal embeds within an Editing view.
Reload app or manually edit the view/contents to fix */
export const unloadReadingViewBanners = () => {
  rerender();
};
