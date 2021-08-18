import { Events, Plugin } from 'obsidian';
import './styles.scss';

import BannersProcessor from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS, ISettings } from './Settings';
import MetaManager from './MetaManager';

export default class Banners extends Plugin {
  // fileData: FileData;
  settings: ISettings;
  bannersProcessor: BannersProcessor;
  events: Events;
  metaManager: MetaManager;

  // async saveData() {
  //   super.saveData({ settings: this.settings, fileData: this.fileData });
  // }

  async onload() {
    console.log('Loading Banners...');

    const data = await this.loadData();
    // this.fileData = Object.assign({}, data?.fileData);
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
