import { Plugin } from 'obsidian';
import BannersProcessor, { FileData } from './BannersProcessor';
import SettingsTab from './Settings';
import './styles.scss';

// const DEFAULT_SETTINGS: ISettings = {
//   data: {},
//   settings: {
//     style: 'solid'
//   }
// }

export default class Banners extends Plugin {
  fileData: FileData;
  // settings: ISettings;
  bannersProcessor: BannersProcessor;

  async saveData() {
    super.saveData({ fileData: this.fileData });
  }

  async onload() {
    console.log('Loading Banners...');

    const data = await this.loadData();
    this.fileData = Object.assign({}, data?.fileData);
    // this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.addSettingTab(new SettingsTab(this));

    this.bannersProcessor = new BannersProcessor(this);
  }

  async onunload() {
    console.log('Unloading Banners...');
  }
}
