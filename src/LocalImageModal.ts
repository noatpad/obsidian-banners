import { html } from 'common-tags';
import { FuzzyMatch, FuzzySuggestModal, TFile, Vault } from 'obsidian';

import BannersPlugin from './main';
import MetaManager from './MetaManager';
import { DEFAULT_VALUES, SettingsOptions } from './Settings';

const IMAGE_FORMATS = ['apng', 'avif', 'gif', 'jpg', 'jpeg', 'jpe', 'jif', 'jfif', 'png', 'webp'];

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  plugin: BannersPlugin;
  vault: Vault;
  settings: SettingsOptions;
  metaManager: MetaManager;
  targetFile: TFile;

  constructor(plugin: BannersPlugin, file: TFile) {
    super(plugin.app);
    this.plugin = plugin;
    this.vault = plugin.app.vault;
    this.settings = plugin.settings;
    this.metaManager = plugin.metaManager;

    const { localSuggestionsLimit } = this.settings;
    this.targetFile = file;
    this.limit = localSuggestionsLimit ?? DEFAULT_VALUES.localSuggestionsLimit;
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
    const banner = this.plugin.getSettingValue('frontmatterField') as string;
    await this.metaManager.upsertBannerData(this.targetFile, { [banner]: image.path });
  }
}
