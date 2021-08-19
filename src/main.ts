import { Events, MetadataCache, Plugin, TFile, Vault, Workspace } from 'obsidian';

import './styles.scss';
import BannersProcessor from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS, SettingsOptions } from './Settings';
import MetaManager from './MetaManager';
import LocalImageModal from './LocalImageModal';
export default class Banners extends Plugin {
  settings: SettingsOptions;
  workspace: Workspace;
  vault: Vault;
  metadataCache: MetadataCache

  bannersProcessor: BannersProcessor;
  events: Events;
  metaManager: MetaManager;

  async onload() {
    console.log('Loading Banners...');

    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.workspace = this.app.workspace;
    this.vault = this.app.vault;
    this.metadataCache = this.app.metadataCache;

    this.events = new Events();
    this.metaManager = new MetaManager(this);
    this.bannersProcessor = new BannersProcessor(this);

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

  prepareCommands() {
    this.addCommand({
      id: 'banners:addLocal',
      name: 'Add/Change banner with local image',
      editorCallback: (_, view) => { new LocalImageModal(this, view.file).open() }
    });

    this.addCommand({
      id: 'banners:addClipboard',
      name: 'Add/Change banner from clipboard',
      editorCallback: async (_, view) => {
        const clipboard = await navigator.clipboard.readText();
        this.metaManager.upsertBannerData(view.file, { banner: clipboard });
      }
    });

    this.addCommand({
      id: 'banners:remove',
      name: 'Remove banner',
      editorCallback: (_, view) => {
        const { file } = view;
        this.metaManager.removeBannerData(file);
        this.bannersProcessor.updateBannerElements((b) => this.bannersProcessor.removeBanner(b), file.path);
      }
    });
  }

  prepareListeners() {
    const { bannersProcessor } = this;

    // When resizing panes, update the banner image positioning
    this.workspace.on('resize', () => {
      bannersProcessor.updateBannerElements((b) => bannersProcessor.setBannerOffset(b));
    });

    // Remove banner when creating a new file or opening an empty file
    this.workspace.on('file-open', async (file) => {
      if (!file || file.stat.size > 0) { return }
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });

    // When duplicating a file, update banner's filepath reference
    this.vault.on('create', (file) => {
      if (!(file instanceof TFile) || file.extension !== 'md') { return }

      // Only continue if the file is indeed a duplicate
      const dupe = this.findDuplicateOf(file);
      if (!dupe) { return }
      bannersProcessor.updateFilepathAttr(file.path, dupe.path);
    });

    // When renaming a file, update banner's filepath reference
    this.vault.on('rename', ({ path }, oldPath) => {
      bannersProcessor.updateFilepathAttr(oldPath, path);
    });

    // Fallback listener for manually removing the banner metadata
    // NOTE: This takes a few seconds to take effect, so the 'Remove banner' command is recommended
    this.metadataCache.on('changed', (file) => {
      if (this.metaManager.getBannerData(file).banner) { return }
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });

    // When settings change, restyle the banners with the current settings
    this.events.on('settingsSave', () => {
      bannersProcessor.updateBannerElements((b) => {
        bannersProcessor.restyleBanner(b);
        bannersProcessor.setBannerOffset(b);
      });
    });

    // Handler to remove banner upon command
    this.events.on('cmdRemove', (file: TFile) => {
      bannersProcessor.updateBannerElements((b) => bannersProcessor.removeBanner(b), file.path);
    });
  }

  // Helper to find the file that was duplicated from a given file, if that's the case
  findDuplicateOf({ basename, extension, parent }: TFile): TFile {
    const words = basename.split(' ');
    words.pop();
    const potentialName = words.join(' ');

    const siblings = parent.children.filter(a => a instanceof TFile) as TFile[];
    return siblings.find(f => f.basename === potentialName && f.extension === extension);
  }
}
