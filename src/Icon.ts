import { MarkdownRenderChild, MetadataCache } from 'obsidian';
import twemoji from 'twemoji';
import emojiRegex from 'emoji-regex';

import BannersPlugin, { MPPCPlus } from './main';
import IconModal from './IconModal';
import { BannerMetadata } from './MetaManager';

const EMOJI_REGEX = emojiRegex();

export default class Icon extends MarkdownRenderChild {
  wrapper: HTMLElement;
  plugin: BannersPlugin;
  metadataCache: MetadataCache;

  ctx: MPPCPlus;
  bannerData: BannerMetadata;

  constructor(
    plugin: BannersPlugin,
    el: HTMLDivElement,
    wrapper: HTMLElement,
    ctx: MPPCPlus,
    bannerData: BannerMetadata
  ) {
    super(el);
    this.wrapper = wrapper;
    this.plugin = plugin;
    this.metadataCache = plugin.metadataCache;

    this.ctx = ctx;
    this.bannerData = bannerData;
  }

  onload() {
    const { useTwemoji } = this.plugin.settings;

    this.wrapper.addClass('has-banner-icon');
    this.containerEl.addClass('obsidian-banner-icon');

    const iconBox = document.createElement('span');
    iconBox.className = 'icon-box';
    if (useTwemoji) {
      iconBox.innerHTML = twemoji.parse(this.getIconText());
    } else {
      iconBox.textContent = this.getIconText();
    }
    iconBox.onclick = async () => {
      const { sourcePath } = this.ctx;
      new IconModal(this.plugin, this.metadataCache.getFirstLinkpathDest(sourcePath, '/')).open();
    }

    this.containerEl.append(iconBox);
    this.wrapper.prepend(this.containerEl);
  }

  getIconText(): string {
    const { banner_icon } = this.bannerData;
    const emojis = banner_icon.match(EMOJI_REGEX);
    return emojis?.join('') ?? banner_icon[0];
  }
}
