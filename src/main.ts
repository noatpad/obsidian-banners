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

    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
    this.events = new Events();
    this.metaManager = new MetaManager(this);
    this.bannersProcessor = new BannersProcessor(this);

    this.addSettingTab(new SettingsTab(this));
  }

  async onunload() {
    console.log('Unloading Banners...');
  }
}
