import { Plugin } from "obsidian";
import { loadPostProcessor, unloadReadingViewBanners } from "./reading";
import { loadExtensions, unloadEditingViewBanners } from "./editing";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  async onload() {
    console.log('Loading Banners 2...');

    plug = this;
    loadPostProcessor();
    loadExtensions();
  }

  async onunload() {
    console.log('Unloading Banners 2....');

    unloadEditingViewBanners();
    unloadReadingViewBanners();
  }
}
