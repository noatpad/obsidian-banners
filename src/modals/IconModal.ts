import * as emoji from 'node-emoji';
import { SuggestModal, TFile } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { getSetting } from 'src/settings';
import IconSuggestion from './IconSuggestion.svelte';

export interface EmojiPair { name: string; emoji: string }

export default class IconModal extends SuggestModal<EmojiPair> {
  activeFile: TFile;
  useTwemoji: boolean;

  constructor(file: TFile) {
    super(plug.app);
    this.activeFile = file;
    this.useTwemoji = getSetting('useTwemoji');
    this.limit = 50;
    this.setPlaceholder('Pick an emoji to use as an icon');
  }

  getSuggestions(query: string): EmojiPair[] {
    return emoji.search(query);
  }

  renderSuggestion(item: EmojiPair, el: HTMLElement) {
    new IconSuggestion({
      target: el,
      props: { item, useTwemoji: this.useTwemoji }
    });
  }

  onChooseSuggestion(item: EmojiPair) {
    updateBannerData(this.activeFile, { icon: item.emoji });
  }
}
