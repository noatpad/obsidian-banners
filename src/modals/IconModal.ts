import { FuzzyMatch, FuzzySuggestModal, TFile } from 'obsidian';
import emojiRegex from 'emoji-regex';
import twemoji from 'twemoji';
import allEmojis from 'node-emoji/lib/emoji.json';

import BannersPlugin from '../main';
import MetaManager from '../MetaManager';

const EMOJI_REGEX = emojiRegex();

interface IEmojiPair { code: string, emoji: string }

export default class IconModal extends FuzzySuggestModal<IEmojiPair> {
  plugin: BannersPlugin;
  metaManager: MetaManager;
  targetFile: TFile;
  emojis: IEmojiPair[];

  constructor(plugin: BannersPlugin, file: TFile) {
    super(plugin.app);
    this.plugin = plugin;
    this.metaManager = plugin.metaManager;

    this.containerEl.addClass('banner-icon-modal');
    this.targetFile = file;
    this.emojis = Object.entries(allEmojis).map(([code, emoji]) => ({ code, emoji }));
    this.limit = 50;
    this.setPlaceholder('Pick an emoji to use as an icon');
  }

  getItems(): IEmojiPair[] {
    return this.inputEl.value.length ? this.emojis : [];
  }

  getItemText(item: IEmojiPair): string {
    return item.code;
  }

  getSuggestions(query: string): FuzzyMatch<IEmojiPair>[] {
    const emojiText = query.match(EMOJI_REGEX)?.join('');
    return emojiText ? ([{
      item: { code: 'Paste inputted emoji(s)', emoji: emojiText },
      match: { score: 1, matches: [] }
    }]) : super.getSuggestions(query);
  }

  renderSuggestion(match: FuzzyMatch<IEmojiPair>, el: HTMLElement): void {
    super.renderSuggestion(match, el);
    const { useTwemoji } = this.plugin.settings;
    const { emoji } = match.item;
    const html = useTwemoji ? twemoji.parse(emoji) : `<span class="regular-emoji">${emoji} </span>`;
    el.insertAdjacentHTML('afterbegin', html);
  }

  async onChooseItem(item: IEmojiPair) {
    await this.metaManager.upsertBannerData(this.targetFile, { icon: item.emoji });
  }
}
