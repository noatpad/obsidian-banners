import { MarkdownPostProcessor, MarkdownPostProcessorContext } from 'obsidian';

import BannersPlugin from '../main';
import Banner from './BannerMD';
import Header from './HeaderMD';

export interface IMPPCPlus extends MarkdownPostProcessorContext {
  containerEl: HTMLElement
}

type MarkdownPostProcessorFunc = (plugin: BannersPlugin) => MarkdownPostProcessor;

const getPostProcessor: MarkdownPostProcessorFunc = (plugin) => (el, ctx: IMPPCPlus) => {
  // Only process the frontmatter
  if (!el.querySelector('pre.frontmatter')) { return }

  const { showInInternalEmbed, showInPreviewEmbed } = plugin.settings;
  const { containerEl, frontmatter, sourcePath } = ctx;
  const bannerData = plugin.metaManager.getBannerData(frontmatter);
  const file = plugin.metadataCache.getFirstLinkpathDest(sourcePath, '/');
  const fourLevelsDown = containerEl?.parentElement?.parentElement?.parentElement?.parentElement;
  const isInternalEmbed = fourLevelsDown?.hasClass('internal-embed') ?? false;
  const isPreviewEmbed = fourLevelsDown?.hasClass('popover') ?? false;

  // Add icon
  if (bannerData?.icon || bannerData?.title) {
    ctx.addChild(new Header(bannerData.title, bannerData.icon ?? "", plugin, el, file));
  }

  // Add banner if allowed
  if (bannerData?.src && (!isInternalEmbed || showInInternalEmbed) && (!isPreviewEmbed || showInPreviewEmbed)) {
    ctx.addChild(new Banner(plugin, el, ctx, bannerData, isInternalEmbed || isPreviewEmbed));
  }
}

export default getPostProcessor;
