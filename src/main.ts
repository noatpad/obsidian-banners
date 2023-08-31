import { Plugin } from "obsidian";
import { loadPostProcessor, unloadReadingViewBanners } from "./reading";
import { loadExtensions, unloadEditingViewBanners } from "./editing";
import { loadSettings, type BannerSettings } from "./settings";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  settings!: BannerSettings;

  async onload() {
    console.log('Loading Banners 2...');

    plug = this;
    await loadSettings();
    loadPostProcessor();
    loadExtensions();
  }

  async onunload() {
    console.log('Unloading Banners 2...');

    unloadEditingViewBanners();
    unloadReadingViewBanners();
  }
}
