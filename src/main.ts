import { Events, Plugin } from 'obsidian';
import BannersProcessor, { FileData } from './BannersProcessor';
import SettingsTab, { DEFAULT_SETTINGS, ISettings } from './Settings';
import './styles.scss';

export default class Banners extends Plugin {
  fileData: FileData;
  settings: ISettings;
  bannersProcessor: BannersProcessor;
  events: Events;

  async saveData() {
    super.saveData({ settings: this.settings, fileData: this.fileData });
  }

  async onload() {
    console.log('Loading Banners...');

    const data = await this.loadData();
    this.fileData = Object.assign({}, data?.fileData);
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data?.settings);
    this.events = new Events();
    this.addSettingTab(new SettingsTab(this));
    this.bannersProcessor = new BannersProcessor(this);
  }

  async onunload() {
    console.log('Unloading Banners...');
  }
}
