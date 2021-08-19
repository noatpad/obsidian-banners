import { Events, Plugin } from 'obsidian';
import './styles.scss';

import BannersProcessor from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS } from './Settings';
import MetaManager from './MetaManager';
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
}
