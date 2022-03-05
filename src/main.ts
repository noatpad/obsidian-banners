import { MarkdownView, MetadataCache, Notice, Plugin, TFile, Vault, Workspace } from 'obsidian';
import isURL from 'validator/lib/isURL';

import './styles/styles.scss';
import IconModal from './IconModal';
import LocalImageModal from './LocalImageModal';
import MetaManager from './MetaManager';
import SettingsTab, { INITIAL_SETTINGS, DEFAULT_VALUES, ISettingsOptions } from './Settings';
import getPostProcessor from './cm5';
import getExtension from './cm6';

export default class BannersPlugin extends Plugin {
  settings: ISettingsOptions;
  workspace: Workspace;
  vault: Vault;
  metadataCache: MetadataCache

  metaManager: MetaManager;

  async onload() {
    console.log('Loading Banners...');

    this.settings = Object.assign({}, INITIAL_SETTINGS, await this.loadData());
    this.workspace = this.app.workspace;
    this.vault = this.app.vault;
    this.metadataCache = this.app.metadataCache;
    this.metaManager = new MetaManager(this);

    this.loadProcessor();
    this.loadExtension();
    this.loadCommands();
    this.loadStyles();
    this.loadFilePrecheck();

    this.addSettingTab(new SettingsTab(this));

    this.refreshViews();
  }

  async onunload() {
    console.log('Unloading Banners...');

    this.unloadBanners();
    this.unloadStyles();
  }

  loadProcessor() {
    const processor = getPostProcessor(this);
    this.registerMarkdownPostProcessor(processor);
  }

  loadExtension() {
    const extension = getExtension(this);
    this.registerEditorExtension(extension);
  }

  loadCommands() {
    this.addCommand({
      id: 'banners:addBanner',
      name: 'Add/Change banner with local image',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        new LocalImageModal(this, file).open();
      }
    });

    this.addCommand({
      id: 'banners:addIcon',
      name: 'Add/Change emoji icon',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        new IconModal(this, file).open();
      }
    });

    this.addCommand({
      id: 'banners:pasteBanner',
      name: 'Paste banner from clipboard',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        this.pasteBanner(file);
      }
    });

    this.addCommand({
      id: 'banners:removeBanner',
      name: 'Remove banner',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) {
          if (!file) { return false }
          return !!this.metaManager.getBannerDataFromFile(file)?.src;
        }
        this.removeBanner(file);
      }
    });

    this.addCommand({
      id: 'banners:removeIcon',
      name: 'Remove icon',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) {
          if (!file) { return false }
          return !!this.metaManager.getBannerDataFromFile(file)?.icon;
        }
        this.removeIcon(file);
      }
    });
  }

  loadStyles() {
    document.documentElement.style.setProperty('--banner-height', `${this.getSettingValue('height')}px`);
    document.documentElement.style.setProperty('--banner-internal-embed-height', `${this.getSettingValue('internalEmbedHeight')}px`);
    document.documentElement.style.setProperty('--banner-preview-embed-height', `${this.getSettingValue('previewEmbedHeight')}px`);
  }

  loadFilePrecheck() {
    // Wrap banner source in quotes to prevent errors later in CM6 extension
    const files = this.workspace.getLeavesOfType('markdown').map((leaf) => (leaf.view as MarkdownView).file);
    const uniqueFiles = [...new Set(files)];
    uniqueFiles.forEach((file) => this.lintBannerSource(file));
    this.workspace.on('file-open', (file) => this.lintBannerSource(file));
  }

  unloadBanners() {
    this.workspace.containerEl
      .querySelectorAll('.obsidian-banner-wrapper')
      .forEach((wrapper) => {
        wrapper.querySelector('.obsidian-banner')?.remove();
        wrapper.querySelector('.obsidian-banner-icon')?.remove();
        wrapper.removeClasses(['obsidian-banner-wrapper', 'has-banner-icon']);
      });
  }

  unloadStyles() {
    document.documentElement.style.removeProperty('--banner-height');
    document.documentElement.style.removeProperty('--banner-internal-embed-height');
    document.documentElement.style.removeProperty('--banner-preview-embed-height');
  }

  // Helper to refresh markdown views
  refreshViews() {
    this.workspace.updateOptions();
    this.workspace.getLeavesOfType('markdown').forEach((leaf) => {
      if (leaf.getViewState().state.mode.includes('preview')) {
        (leaf.view as MarkdownView).previewMode.rerender(true);
      }
    });
  }

  // Helper to use clipboard for banner
  async pasteBanner(file: TFile) {
    const clipboard = await navigator.clipboard.readText();
    if (!isURL(clipboard)) {
      new Notice('Your clipboard didn\'t had a valid URL! Please try again (and check the console if you wanna debug).');
      console.error({ clipboard });
    } else {
      await this.metaManager.upsertBannerData(file, { src: `"${clipboard}"` });
      new Notice('Pasted a new banner!');
    }
  }

  // Helper to remove banner
  removeBanner(file: TFile) {
    this.metaManager.removeBannerData(file, ['src', 'x', 'y']);
    new Notice(`Removed banner for ${file.name}!`);
  }

  // Helper to remove banner icon
  removeIcon(file: TFile) {
    this.metaManager.removeBannerData(file, ['icon']);
    new Notice(`Removed banner icon for ${file.name}!`);
  }

  // Helper to wrap banner source in quotes if not already (Patch for previous versions)
  lintBannerSource(file: TFile) {
    if (!file) { return }
    const { frontmatter } = this.metadataCache.getFileCache(file);
    const src = this.metaManager.getBannerData(frontmatter)?.src;
    if (!src || (src.startsWith('"') && src.endsWith('"'))) { return }
    this.metaManager.upsertBannerData(file, { src: `"${src}"` });
  }

  // Helper to get setting value (or the default setting value if not set)
  getSettingValue<K extends keyof ISettingsOptions>(key: K): Partial<ISettingsOptions>[K] {
    return this.settings[key] ?? DEFAULT_VALUES[key];
  }
}
