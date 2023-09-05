/* eslint-disable @typescript-eslint/no-this-alias */
import { Plugin } from 'obsidian';

import BannerEvents from './BannerEvents';
import { loadExtensions, unloadEditingViewBanners } from './editing';
import { loadPostProcessor, unloadReadingViewBanners } from './reading';
import { loadSettings, type BannerSettings } from './settings';

export let plug: BannersPlugin;

/* BUG: Scrolling with linked editing/reading views are not synced properly
 * (maybe use `margin` instead of `height` for the "pusher" elements?) */
export default class BannersPlugin extends Plugin {
  settings!: BannerSettings;
  events!: BannerEvents;

  async onload() {
    console.log('Loading Banners 2...');
    plug = this;
    this.events = new BannerEvents();

    await loadSettings();
    loadPostProcessor();
    loadExtensions();
    this.events.loadEvents();
  }

  async onunload() {
    console.log('Unloading Banners 2...');

    unloadEditingViewBanners();
    unloadReadingViewBanners();
  }
}
