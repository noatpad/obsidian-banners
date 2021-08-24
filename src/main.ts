import { EventRef, Events, MetadataCache, Notice, Plugin, TFile, Vault, Workspace } from 'obsidian';
import isURL from 'validator/lib/isURL';

import './styles.scss';
import BannersProcessor from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS, SettingsOptions } from './Settings';
import MetaManager from './MetaManager';
import LocalImageModal from './LocalImageModal';

interface Listener {
  component: 'workspace' | 'vault' | 'metadataCache' | 'events',
  ref: EventRef
}
export default class Banners extends Plugin {
  settings: SettingsOptions;
  workspace: Workspace;
  vault: Vault;
  metadataCache: MetadataCache

  events: Events;
  metaManager: MetaManager;
  bannersProcessor: BannersProcessor;
  localImageModal: LocalImageModal;
  listeners: Listener[]

  async onload() {
    console.log('Loading Banners...');

    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.workspace = this.app.workspace;
    this.vault = this.app.vault;
    this.metadataCache = this.app.metadataCache;

    this.events = new Events();
    this.metaManager = new MetaManager(this);
    this.bannersProcessor = new BannersProcessor(this);
    this.localImageModal = new LocalImageModal(this);
    this.listeners = [];

    this.bannersProcessor.load();
    this.prepareCommands();
    this.prepareListeners();
    this.prepareStyles();

    this.addSettingTab(new SettingsTab(this));

    // Refresh the layout to trigger postprocessor
    this.workspace.onLayoutReady(() => {
      this.workspace.changeLayout(this.workspace.getLayout());
    });
  }

  async onunload() {
    console.log('Unloading Banners...');

    this.bannersProcessor.unload();
    this.removeListeners();
    this.removeStyles();
  }

  prepareCommands() {
    this.addCommand({
      id: 'banners:addLocal',
      name: 'Add/Change banner with local image',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        this.localImageModal.launch(file);
      }
    });

    this.addCommand({
      id: 'banners:addClipboard',
      name: 'Add/Change banner from clipboard',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        this.pasteBanner(file);
      }

    });

    this.addCommand({
      id: 'banners:remove',
      name: 'Remove banner',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file && !!this.metaManager.getBannerData(file)?.banner }
        this.removeBanner(file);
      }
    });
  }

  prepareListeners() {
    const { bannersProcessor } = this;

    // When resizing panes, update all banner image positions
    const resizeRef = this.workspace.on('resize', () => {
      bannersProcessor.updateBannerElements((b) => bannersProcessor.setBannerOffset(b));
    });

    // Remove banner when creating a new file or opening an empty file
    const fileOpenRef = this.workspace.on('file-open', async (file) => {
      if (!file || file.stat.size > 0) { return }
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });

    // When duplicating a file, update banner's filepath reference
    const vaultOpenRef = this.vault.on('create', (file) => {
      if (!(file instanceof TFile) || file.extension !== 'md') { return }

      // Only continue if the file is indeed a duplicate
      const dupe = this.findDuplicateOf(file);
      if (!dupe) { return }
      bannersProcessor.updateFilepathAttr(file.path, dupe.path);
    });

    // When renaming a file, update banner's filepath reference
    const vaultRenameRef = this.vault.on('rename', ({ path }, oldPath) => {
      bannersProcessor.updateFilepathAttr(oldPath, path);
    });

    // Fallback listener for manually removing the banner metadata
    // NOTE: This can take a few seconds to take effect, so the 'Remove banner' command is recommended
    const metadataChangeRef = this.metadataCache.on('changed', (file) => {
      if (this.metaManager.getBannerData(file).banner) { return }
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });

    // When settings change, restyle the banners with the current settings
    const settingsSaveRef = this.events.on('settingsSave', () => {
      bannersProcessor.updateBannerElements((b) => bannersProcessor.restyleBanner(b));
    });

    // Handler to remove banner upon command
    const commandRemoveRef = this.events.on('cmdRemove', (file: TFile) => {
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });

    this.listeners = [
      { component: 'workspace', ref: resizeRef },
      { component: 'workspace', ref: fileOpenRef },
      { component: 'vault', ref: vaultOpenRef },
      { component: 'vault', ref: vaultRenameRef },
      { component: 'metadataCache', ref: metadataChangeRef },
      { component: 'events', ref: settingsSaveRef },
      { component: 'events', ref: commandRemoveRef },
    ];
  }

  prepareStyles() {
    const { embedHeight, height, showInEmbed } = this.settings;
    document.documentElement.style.setProperty('--banner-height', `${height}px`);
    document.documentElement.style.setProperty('--banner-embed-height', `${embedHeight}px`);
    if (showInEmbed) {
      document.body.removeClass('no-banner-in-embed');
    } else {
      document.body.addClass('no-banner-in-embed');
    }
  }

  removeListeners() {
    this.listeners.forEach(({ component, ref }) => {
      this[component].offref(ref);
    });
  }

  removeStyles() {
    document.documentElement.style.removeProperty('--banner-height');
    document.documentElement.style.removeProperty('--banner-embed-height');
    document.body.removeClass('no-banner-in-embed');
  }

  // Helper to find the file that was duplicated from a given file, if that's the case
  findDuplicateOf({ basename, extension, parent }: TFile): TFile {
    const words = basename.split(' ');
    words.pop();
    const potentialName = words.join(' ');

    const siblings = parent.children.filter(a => a instanceof TFile) as TFile[];
    return siblings.find(f => f.basename === potentialName && f.extension === extension);
  }

  // Helper to use clipboard for banner
  async pasteBanner(file: TFile) {
    const clipboard = await navigator.clipboard.readText();
    if (!isURL(clipboard)) {
      new Notice('Your clipboard didn\'t had a valid URL! Please try again (and check the console if you wanna debug).');
      console.error({ clipboard });
    } else {
      this.metaManager.upsertBannerData(file, { banner: clipboard });
      new Notice('Pasted a new banner!');
    }
  }

  // Helper to remove banner
  removeBanner(file: TFile) {
    this.metaManager.removeBannerData(file);
    this.bannersProcessor.updateBannerElements((b) => this.bannersProcessor.removeBanner(b), file.path);
    new Notice(`Removed banner for ${file.name}!`);
  }
}
