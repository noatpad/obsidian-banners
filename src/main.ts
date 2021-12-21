import { MarkdownPostProcessorContext, MarkdownView, MetadataCache, Notice, Plugin, TFile, Vault, Workspace } from 'obsidian';
import isURL from 'validator/lib/isURL';

import './styles.scss';
import Banner from './Banner';
import SettingsTab, { INITIAL_SETTINGS, DEFAULT_VALUES, SettingsOptions } from './Settings';
import MetaManager from './MetaManager';
import LocalImageModal from './LocalImageModal';

export interface MPPCPlus extends MarkdownPostProcessorContext {
  containerEl: HTMLElement
}
export default class BannersPlugin extends Plugin {
  settings: SettingsOptions;
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
    this.loadCommands();
    this.loadStyles();

    this.addSettingTab(new SettingsTab(this));

    this.refreshViews();
  }

  async onunload() {
    console.log('Unloading Banners...');

    this.unloadBanners();
    this.unloadStyles();
  }

  loadProcessor() {
    this.registerMarkdownPostProcessor(async (el, ctx: MPPCPlus) => {
      // Only process the frontmatter
      if (!el.querySelector('pre.frontmatter')) { return }

      const { showInInternalEmbed, showInPreviewEmbed } = this.settings;
      const { containerEl, frontmatter } = ctx;
      const fourLevelsDown = containerEl.parentElement.parentElement.parentElement.parentElement;
      const isInternalEmbed = fourLevelsDown.hasClass('internal-embed');
      const isPreviewEmbed = fourLevelsDown.hasClass('popover');

      // Stop here if no banner data is found or if a disallowed embed banner
      if (
        !this.metaManager.getBannerData(frontmatter)?.banner ||
        (isInternalEmbed && !showInInternalEmbed) ||
        (isPreviewEmbed && !showInPreviewEmbed)
      ) { return }

      const banner = document.createElement('div');
      ctx.addChild(new Banner(this, banner, el, ctx, isInternalEmbed || isPreviewEmbed));
    });
  }

  loadCommands() {
    this.addCommand({
      id: 'banners:addLocal',
      name: 'Add/Change banner with local image',
      checkCallback: (checking) => {
        const file = this.workspace.getActiveFile();
        if (checking) { return !!file }
        new LocalImageModal(this, file).open();
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
        if (checking) { return !!file && !!this.metaManager.getBannerDataFromFile(file)?.banner }
        this.removeBanner(file);
      }
    });
  }

  loadStyles() {
    document.documentElement.style.setProperty('--banner-height', `${this.getSettingValue('height')}px`);
    document.documentElement.style.setProperty('--banner-internal-embed-height', `${this.getSettingValue('internalEmbedHeight')}px`);
    document.documentElement.style.setProperty('--banner-preview-embed-height', `${this.getSettingValue('previewEmbedHeight')}px`);
  }

  unloadBanners() {
    this.workspace.containerEl
      .querySelectorAll('.obsidian-banner-wrapper')
      .forEach((wrapper) => {
        wrapper.querySelector('.obsidian-banner').remove();
        wrapper.removeClasses(['obsidian-banner-wrapper', 'loaded', 'error']);
      });
  }

  unloadStyles() {
    document.documentElement.style.removeProperty('--banner-height');
    document.documentElement.style.removeProperty('--banner-embed-height');
  }

  // Helper to refresh markdown views
  refreshViews() {
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
      const banner = this.getSettingValue('frontmatterField');
      await this.metaManager.upsertBannerData(file, { [banner]: clipboard })
      new Notice('Pasted a new banner!');
    }
  }

  // Helper to remove banner
  removeBanner(file: TFile) {
    this.metaManager.removeBannerData(file);
    new Notice(`Removed banner for ${file.name}!`);
  }

  // Helper to get setting value (or the default setting value if not set)
  getSettingValue<K extends keyof SettingsOptions>(key: K): Partial<SettingsOptions>[K] {
    return this.settings[key] ?? DEFAULT_VALUES[key];
  }
}
