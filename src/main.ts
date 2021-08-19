import { Events, Plugin } from 'obsidian';

import './styles.scss';
import BannersProcessor from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS } from './Settings';
import MetaManager from './MetaManager';
import LocalImageModal from './LocalImageModal';
import { SettingsOptions } from './types';
export default class Banners extends Plugin {
  settings: SettingsOptions;
  bannersProcessor: BannersProcessor;
  events: Events;
  metaManager: MetaManager;

  async onload() {
    console.log('Loading Banners...');

    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.events = new Events();
    this.metaManager = new MetaManager(this);
    this.bannersProcessor = new BannersProcessor(this);

    this.prepareStyles();
    this.prepareCommands();

    this.addSettingTab(new SettingsTab(this));
  }

  async onunload() {
    console.log('Unloading Banners...');
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
      name: 'Add/Change banner with clipboard',
      editorCallback: async (_, view) => {
        const clipboard = await navigator.clipboard.readText();
        this.metaManager.upsertBannerData(view.file, { banner: clipboard });
      }
    });

    // this.addCommand({
    //   id: 'banners:remove',
    //   name: 'Remove banner',
    //   editorCallback: (_, view) => { this.metaManager.removeBannerData(view.file) }
    // });
  }
}
