import { MarkdownRenderChild, MetadataCache } from 'obsidian';
import twemoji from 'twemoji';
import emojiRegex from 'emoji-regex';

import BannersPlugin, { MPPCPlus } from './main';
import IconModal from './IconModal';
import { BannerMetadata } from './MetaManager';
import { DEFAULT_VALUES } from './Settings';

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
    const { iconHorizontalAlignment, iconVerticalAlignment, useTwemoji } = this.plugin.settings;
    const { banner_icon } = this.bannerData;

    this.wrapper.addClass('has-banner-icon');
    this.containerEl.addClass('obsidian-banner-icon', `h-${iconHorizontalAlignment}`, `v-${iconVerticalAlignment}`);

    const iconBox = document.createElement('span');
    const iconText = banner_icon.match(EMOJI_REGEX)?.join('') ?? banner_icon[0];
    iconBox.className = 'icon-box';
    if (useTwemoji) {
      iconBox.innerHTML = twemoji.parse(iconText);
    } else {
      iconBox.textContent = iconText;
    }
    iconBox.onclick = async () => {
      const { sourcePath } = this.ctx;
      new IconModal(this.plugin, this.metadataCache.getFirstLinkpathDest(sourcePath, '/')).open();
    }
    iconBox.style.transform = this.getIconTransform();

    this.containerEl.append(iconBox);
    this.wrapper.prepend(this.containerEl);
  }

  private getIconTransform() {
    const { iconHorizontalAlignment, iconVerticalAlignment } = this.plugin.settings;
    const { iconHorizontalTransform: dH, iconVerticalTransform: dV } = DEFAULT_VALUES;
    const h = iconHorizontalAlignment === 'custom' ? this.plugin.getSettingValue('iconHorizontalTransform') : dH;
    const v = iconVerticalAlignment === 'custom' ? this.plugin.getSettingValue('iconVerticalTransform') : dV;
    return h !== dH || v !== dV ? `translate(${h}, ${v})` : null;
  }
}
