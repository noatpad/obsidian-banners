import { MarkdownView, MetadataCache, Notice, Plugin, TFile, Vault, Workspace } from 'obsidian';
import { Extension } from '@codemirror/state';
import isURL from 'validator/lib/isURL';

import './styles/styles.scss';
import IconModal from './modals/IconModal';
import LocalImageModal from './modals/LocalImageModal';
import TitleModal from './modals/TitleModal';
import MetaManager from './MetaManager';
import SettingsTab, { INITIAL_SETTINGS, DEFAULT_VALUES, ISettingsOptions, PartialSettings } from './Settings';
import getPostProcessor from './cm5';
import getViewPlugin from './cm6';
import { bannerDecorFacet, iconDecorFacet } from './cm6/helpers';

export default class BannersPlugin extends Plugin {
  settings: ISettingsOptions;
  workspace: Workspace;
  vault: Vault;
  metadataCache: MetadataCache;
  extensions: Extension[];
  metaManager: MetaManager;

  holdingDragModKey: boolean

  async onload() {
    console.log('Loading Banners...');

    this.settings = Object.assign({}, INITIAL_SETTINGS, await this.loadData());
    this.workspace = this.app.workspace;
    this.vault = this.app.vault;
    this.metadataCache = this.app.metadataCache;
    this.metaManager = new MetaManager(this);
    this.holdingDragModKey = false;

    this.loadProcessor();
    this.loadExtension();
    this.loadCommands();
    this.loadStyles();
    this.loadListeners();
    this.loadPrecheck();

    this.addSettingTab(new SettingsTab(this));

    this.refreshViews();
  }

  async onunload() {
    console.log('Unloading Banners...');

    this.unloadListeners();
    this.unloadBanners();
    this.unloadStyles();
  }

  loadListeners() {
    window.addEventListener('keydown', this.isDragModHeld);
    window.addEventListener('keyup', this.isDragModHeld);
  }

  loadProcessor() {
    const processor = getPostProcessor(this);
    this.registerMarkdownPostProcessor(processor);
  }

  loadExtension() {
    this.extensions = [
      bannerDecorFacet.of(this.settings),
      iconDecorFacet.of(this.settings),
      getViewPlugin(this)
    ];
    this.registerEditorExtension(this.extensions);
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
      id: 'banners:addTitle',
      name: 'Add/Change title',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        new TitleModal(this, file).open();
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
      id: 'banners:lockBanner',
      name: 'Lock/Unlock banner position',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        this.toggleBannerLock(file);
      }
    })

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

    this.addCommand({
      id: 'banners:removeTitle',
      name: 'Remove title',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) {
          if (!file) { return false }
          return !!this.metaManager.getBannerDataFromFile(file)?.title;
        }
        this.removeTitle(file);
      }
    });
  }

  loadStyles() {
    document.documentElement.style.setProperty('--banner-height', `${this.getSettingValue('height')}px`);
    document.documentElement.style.setProperty('--banner-internal-embed-height', `${this.getSettingValue('internalEmbedHeight')}px`);
    document.documentElement.style.setProperty('--banner-preview-embed-height', `${this.getSettingValue('previewEmbedHeight')}px`);
  }

  loadPrecheck() {
    // Wrap banner source in quotes to prevent errors later in CM6 extension
    const files = this.workspace.getLeavesOfType('markdown').map((leaf) => (leaf.view as MarkdownView).file);
    const uniqueFiles = [...new Set(files)];
    uniqueFiles.forEach((file) => this.lintBannerSource(file));
    this.registerEvent(this.workspace.on('file-open', (file) => {
      this.lintBannerSource(file)
    }));
  }

  unloadListeners() {
    window.removeEventListener('keydown', this.isDragModHeld);
    window.removeEventListener('keyup', this.isDragModHeld);
  }

  unloadBanners() {
    this.workspace.containerEl
      .querySelectorAll('.obsidian-banner-wrapper')
      .forEach((wrapper) => {
        wrapper.querySelector('.obsidian-banner')?.remove();
        wrapper.querySelector('.obsidian-banner-icon')?.remove();
        wrapper.removeClasses(['obsidian-banner-wrapper', 'has-banner-header']);
      });
  }

  unloadStyles() {
    document.documentElement.style.removeProperty('--banner-height');
    document.documentElement.style.removeProperty('--banner-internal-embed-height');
    document.documentElement.style.removeProperty('--banner-preview-embed-height');
  }

  // Helper to check if the drag modifier key is being held down or not, if specified
  isDragModHeld = (e?: KeyboardEvent) => {
    let ret: boolean;
    if (e) {
      switch (this.settings.bannerDragModifier) {
        case 'alt': ret = e.altKey; break;
        case 'ctrl': ret = e.ctrlKey; break;
        case 'meta': ret = e.metaKey; break;
        case 'shift': ret = e.shiftKey; break;
        default: ret = true;
      }
    } else {
      ret = (this.settings.bannerDragModifier === 'none');
    }
    this.holdingDragModKey = ret;
    this.toggleBannerCursor(ret);
  }

  // Helper to refresh views
  refreshViews() {
    // Reconfigure CM6 extensions and update Live Preview views
    this.extensions[0] = bannerDecorFacet.of(this.settings);
    this.extensions[1] = iconDecorFacet.of(this.settings);
    this.workspace.updateOptions();

    // Rerender Reading views
    this.workspace.getLeavesOfType('markdown').forEach((leaf) => {
      if (leaf.getViewState().state.mode.includes('preview')) {
        (leaf.view as MarkdownView).previewMode.rerender(true);
      }
    });

    // Refresh banners' drag state
    this.isDragModHeld();
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

  // Helper to apply grab cursor for banner images
  // TODO: This feels fragile, perhaps look for a better way
  toggleBannerCursor = (val: boolean) => {
    document.querySelectorAll('.banner-image').forEach((el) => el.toggleClass('draggable', val));
  }

  // Helper to toggle banner position locking
  async toggleBannerLock(file: TFile) {
    const { lock = false } = this.metaManager.getBannerDataFromFile(file);
    if (lock) {
      await this.metaManager.removeBannerData(file, 'lock');
      new Notice(`Unlocked banner position for ${file.name}!`);
    } else {
      await this.metaManager.upsertBannerData(file, { lock: true });
      new Notice(`Locked banner position for ${file.name}!`);
    }
  }

  // Helper to remove banner
  async removeBanner(file: TFile) {
    await this.metaManager.removeBannerData(file, ['src', 'x', 'y', 'lock']);
    new Notice(`Removed banner for ${file.name}!`);
  }

  // Helper to remove banner icon
  async removeIcon(file: TFile) {
    await this.metaManager.removeBannerData(file, 'icon');
    new Notice(`Removed banner icon for ${file.name}!`);
  }

  async removeTitle(file: TFile) {
    await this.metaManager.removeBannerData(file, 'title');
    new Notice(`Removed banner title for ${file.name}!`);
  }

  // Helper to wrap banner source in quotes if not already (Patch for previous versions)
  async lintBannerSource(file: TFile) {
    if (!file) { return }
    const { src } = this.metaManager.getBannerDataFromFile(file) ?? {};
    if (src && typeof src === 'string') {
      await this.metaManager.upsertBannerData(file, { src: `"${src}"` });
    }
  }

  // Helper to get setting value (or the default setting value if not set)
  getSettingValue<K extends keyof ISettingsOptions>(key: K): PartialSettings[K] {
    return this.settings[key] ?? DEFAULT_VALUES[key];
  }
}
