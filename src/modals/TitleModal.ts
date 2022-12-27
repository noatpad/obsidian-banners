import { FuzzyMatch, FuzzySuggestModal, TFile } from 'obsidian';
import emojiRegex from 'emoji-regex';
import twemoji from 'twemoji';
import allEmojis from 'node-emoji/lib/emoji.json';

import BannersPlugin from '../main';
import MetaManager from '../MetaManager';

const EMOJI_REGEX = emojiRegex();

interface Iinput { text: string }

export default class TitleModal extends FuzzySuggestModal<{ text: string }> {
    plugin: BannersPlugin;
    metaManager: MetaManager;
    targetFile: TFile;

    constructor(plugin: BannersPlugin, file: TFile) {
        super(plugin.app);
        this.plugin = plugin;
        this.metaManager = plugin.metaManager;

        this.containerEl.addClass('banner-title-modal');
        this.targetFile = file;
        this.limit = 50;
        this.setPlaceholder('Pick an title for the banner');
    }
    getItemText(item: { text: string }): string {
        return item.text;
    }
    getItems(): { text: string }[] {
        return this.inputEl.value.length ? [{ text: this.inputEl.value }] : [];
    }
    async onChooseItem(item: Iinput) {
        await this.metaManager.upsertBannerData(this.targetFile, { title: item.text });
    }
}
