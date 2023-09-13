import { FuzzySuggestModal, Notice, TFile } from 'obsidian';
import { TFolder } from 'obsidian';
import type { FuzzyMatch } from 'obsidian';
import { IMAGE_FORMATS, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { DEFAULT_SETTINGS, getSetting } from 'src/settings';
import LocalImageSuggestion from './LocalImageSuggestion.svelte';

export default class LocalImageModal extends FuzzySuggestModal<TFile> {
  activeFile: TFile;
  showPreview: boolean;

  constructor(file: TFile) {
    super(plug.app);
    this.activeFile = file;
    this.showPreview = getSetting('showPreviewInLocalModal');

    this.limit = getSetting('localModalSuggestionLimit');
    this.setPlaceholder('Pick an image to use as a banner');
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
    el.setCssStyles({ whiteSpace: 'normal' });
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
