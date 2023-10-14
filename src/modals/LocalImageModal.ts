import { FuzzySuggestModal, Notice, TFile } from 'obsidian';
import { TFolder } from 'obsidian';
import type { FuzzyMatch } from 'obsidian';
import { IMAGE_EXTENSIONS, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { getSetting } from 'src/settings';
import { DEFAULT_SETTINGS } from 'src/settings/structure';
import LocalImageSuggestion from './LocalImageSuggestion.svelte';

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  activeFile: TFile;
  path: string;

  constructor(file: TFile) {
    super(plug.app);
    this.activeFile = file;

    this.limit = getSetting('localModalSuggestionLimit');
    this.path = getSetting('bannersFolder');
    this.containerEl.addClass('banners-local-image-modal');
    this.setPlaceholder('Pick an image to use as a banner');
  }

  private getImagesInFolder(folder: TFolder): TFile[] {
    return folder.children.reduce((files, abFile) => {
      if (abFile instanceof TFolder) {
        files.push(...this.getImagesInFolder(folder));
      } else if (abFile instanceof TFile && IMAGE_EXTENSIONS.includes(abFile.extension)) {
        files.push(abFile);
      }
      return files;
    }, [] as TFile[]);
  }

  getItems(): TFile[] {
    if (this.path === DEFAULT_SETTINGS.bannersFolder) {
      return this.app.vault.getFiles()
        .filter((file) => IMAGE_EXTENSIONS.includes(file.extension));
    }

    const folder = this.app.vault.getAbstractFileByPath(this.path);
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
        matches: match.matches
      }
    });
  }

  onChooseItem(item: TFile): void {
    const link = this.app.metadataCache.fileToLinktext(item, this.activeFile.path);
    updateBannerData(this.activeFile, { source: `[[${link}]]` });
  }
}
