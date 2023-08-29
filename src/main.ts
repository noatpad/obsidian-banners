import { Plugin } from "obsidian";
import postprocessor from "./reading";
import { bannerExtender, bannerField, loadEditingViewListeners } from "./editing";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  async onload() {
    console.log('Loading Banners 2...');

    plug = this;
    this.loadProcessor();
    this.loadExtension();
    this.loadListeners();
  }

  async onunload() {
    console.log('Unloading Banners 2...');
  }

  // MD processor for Reading views
  loadProcessor() {
    this.registerMarkdownPostProcessor(postprocessor);
  }

  // CM6 extensions for Editing views
  loadExtension() {
    this.registerEditorExtension([
      bannerExtender,
      bannerField
    ]);
  }

  loadListeners() {
    loadEditingViewListeners();
  }
}
