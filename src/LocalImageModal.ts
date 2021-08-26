import { html } from 'common-tags';
import { FuzzyMatch, FuzzySuggestModal, TFile, Vault } from 'obsidian';

import Banners from './main';
import MetaManager from './MetaManager';

const IMAGE_FORMATS = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'png', 'webp'];

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  plugin: Banners;
  vault: Vault;
  metaManager: MetaManager;
  targetFile: TFile

  constructor(plugin: Banners) {
    super(plugin.app);
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.metaManager = plugin.metaManager;
    this.targetFile = null;
    this.setPlaceholder('Pick an image to use as a banner');
  }

  launch(file: TFile) {
    this.targetFile = file;
    super.open();
  }

  getItems(): TFile[] {
    return this.vault.getFiles().filter(f => IMAGE_FORMATS.includes(f.extension));
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  renderSuggestion(match: FuzzyMatch<TFile>, el: HTMLElement) {
    super.renderSuggestion(match, el);
    const content = el.innerHTML;
    el.addClass('banner-suggestion-item');
    el.innerHTML = html`
      <p class="suggestion-text">${content}</p>
      <div class="suggestion-image-wrapper">
        <img src="${this.vault.getResourcePath(match.item)}" />
      </div>
    `;
  }

  async onChooseItem(image: TFile) {
    this.metaManager.upsertBannerData(this.targetFile, { banner: image.path });
  }
}
