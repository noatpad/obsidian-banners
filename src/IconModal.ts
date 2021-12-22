import { FuzzyMatch, FuzzySuggestModal, TFile } from 'obsidian';
import twemoji from 'twemoji';
import allEmojis from 'node-emoji/lib/emoji.json';

import BannersPlugin from './main';
import MetaManager from './MetaManager';

interface EmojiPair {
  code: string,
  emoji: string
}

export default class IconModal extends FuzzySuggestModal<EmojiPair> {
  plugin: BannersPlugin;
  metaManager: MetaManager;
  targetFile: TFile;
  emojis: EmojiPair[];

  constructor(plugin: BannersPlugin, file: TFile) {
    super(plugin.app);
    this.plugin = plugin;
    this.metaManager = plugin.metaManager;

    this.containerEl.addClass('banner-icon-modal');
    this.targetFile = file;
    this.emojis = Object.entries(allEmojis).map(([code, emoji]) => ({ code, emoji }));
    this.limit = 50;
  }

  getItems(): EmojiPair[] {
    return this.emojis;
  }

  getItemText(item: EmojiPair): string {
    return item.code;
  }

  renderSuggestion(match: FuzzyMatch<EmojiPair>, el: HTMLElement): void {
    super.renderSuggestion(match, el);
    const { useTwemoji } = this.plugin.settings;
    const { emoji } = match.item;
    const html = useTwemoji ? twemoji.parse(emoji) : `<span class="regular-emoji">${emoji} </span>`;
    el.insertAdjacentHTML('afterbegin', html);
  }

  async onChooseItem(item: EmojiPair) {
    const field = this.plugin.getSettingValue('frontmatterField');
    await this.metaManager.upsertBannerData(this.targetFile, { [`${field}_icon`]: item.emoji });
  }
}
