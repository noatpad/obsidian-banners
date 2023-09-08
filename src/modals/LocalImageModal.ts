import { App, FuzzySuggestModal, TFile } from 'obsidian';
import type { FuzzyMatch } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
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

  constructor(app: App, file: TFile) {
    super(app);
    this.activeFile = file;
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
      props: { file: item, matches: match.matches }
    });
  }

  onChooseItem(item: TFile): void {
    const link = this.app.metadataCache.fileToLinktext(item, this.activeFile.path);
    updateBannerData(this.activeFile, { source: `[[${link}]]` });
  }
}
