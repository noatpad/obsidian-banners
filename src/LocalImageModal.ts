import { html } from 'common-tags';
import { FuzzyMatch, FuzzySuggestModal, MetadataCache, TFile, Vault } from 'obsidian';

import BannersPlugin from './main';
import MetaManager from './MetaManager';
import { SettingsOptions } from './Settings';

const IMAGE_FORMATS = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'png', 'webp'];

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  plugin: BannersPlugin;
  vault: Vault;
  metadataCache: MetadataCache;
  settings: SettingsOptions;
  metaManager: MetaManager;
  targetFile: TFile;

  constructor(plugin: BannersPlugin, file: TFile) {
    super(plugin.app);
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.metadataCache = plugin.app.metadataCache;
    this.settings = plugin.settings;
    this.metaManager = plugin.metaManager;

    this.targetFile = file;
    this.limit = this.plugin.getSettingValue('localSuggestionsLimit');
    this.setPlaceholder('Pick an image to use as a banner');
  }

  getItems(): TFile[] {
    const { bannersFolder } = this.settings;
    return this.vault.getFiles().filter(f => (
      IMAGE_FORMATS.includes(f.extension) &&
      (!bannersFolder || f.parent.path.contains(bannersFolder))
    ));
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  renderSuggestion(match: FuzzyMatch<TFile>, el: HTMLElement) {
    super.renderSuggestion(match, el);

    const { showPreviewInLocalModal } = this.settings;
    if (showPreviewInLocalModal) {
      const content = el.innerHTML;
      el.addClass('banner-suggestion-item');
      el.innerHTML = html`
        <p class="suggestion-text">${content}</p>
        <div class="suggestion-image-wrapper">
          <img src="${this.vault.getResourcePath(match.item)}" />
        </div>
      `;
    }
  }

  async onChooseItem(image: TFile) {
    const banner = this.plugin.getSettingValue('frontmatterField');
    const link = this.metadataCache.fileToLinktext(image, this.targetFile.path);
    await this.metaManager.upsertBannerData(this.targetFile, { [banner]: `"[[${link}]]"` });
  }
}
