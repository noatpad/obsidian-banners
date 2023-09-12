import {
  App, FuzzySuggestModal, Notice, TFile
} from 'obsidian';
import { TFolder } from 'obsidian';
import type { FuzzyMatch } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
import { DEFAULT_SETTINGS, getSetting } from 'src/settings';
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
    this.limit = getSetting('localModalSuggestionLimit');
  }

  private getImagesInFolder(folder: TFolder): TFile[] {
    return folder.children.reduce((files, abFile) => {
      if (abFile instanceof TFolder) {
        files.push(...this.getImagesInFolder(folder));
      } else if (abFile instanceof TFile && IMAGE_FORMATS.includes(abFile.extension)) {
        files.push(abFile);
      }
      return files;
    }, [] as TFile[]);
  }

  getItems(): TFile[] {
    const path = getSetting('bannersFolder');

    if (path === DEFAULT_SETTINGS.bannersFolder) {
      return this.app.vault.getFiles()
        .filter((file) => IMAGE_FORMATS.includes(file.extension));
    }

    const folder = this.app.vault.getAbstractFileByPath(path);
    if (!folder || !(folder instanceof TFolder)) {
      new Notice(
        'Error: Make sure that you set the "Banners folder" setting to a valid folder',
        7000
      );
      this.close();
      return [];
    }

    return this.getImagesInFolder(folder);
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
