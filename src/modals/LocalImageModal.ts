import { App, FuzzySuggestModal, TFile } from 'obsidian';
import type { FuzzyMatch } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
import { getSetting } from 'src/settings';
import LocalImageSuggestion from './LocalImageSuggestion.svelte';

const IMAGE_FORMATS = [
  'apng',
  'avif',
  'gif',
  'jpg',
  'jpeg',
  'jpe',
  'jif',
  'jfif',
  'png',
  'webp'
];

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  activeFile: TFile;
  showPreview: boolean;

  constructor(app: App, file: TFile) {
    super(app);
    this.activeFile = file;
    this.showPreview = getSetting('showPreviewInLocalModal');

    this.setPlaceholder('Pick an image to use as a banner');
  }

  // TODO: Allow only searching files within a specific directory through a setting
  getItems(): TFile[] {
    return this.app.vault.getFiles()
      .filter((file) => IMAGE_FORMATS.includes(file.extension));
  }

  getItemText(item: TFile): string {
    return item.path;
  }

  renderSuggestion({ item, match }: FuzzyMatch<TFile>, el: HTMLElement): void {
    new LocalImageSuggestion({
      target: el,
      props: {
        file: item,
        matches: match.matches,
        showPreview: this.showPreview
      }
    });
  }

  onChooseItem(item: TFile): void {
    const link = this.app.metadataCache.fileToLinktext(item, this.activeFile.path);
    updateBannerData(this.activeFile, { source: `[[${link}]]` });
  }
}
