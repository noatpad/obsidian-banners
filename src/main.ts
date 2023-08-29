import { Plugin } from "obsidian";
import postprocessor from "./reading";
import { bannerField, bannerMetadataExtender } from "./editing";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  async onload() {
    console.log('Loading Banners 2...');

    plug = this;
    this.loadProcessor();
    this.loadExtension();
  }

  async onunload() {
    console.log('Unloading Banners 2...');
  }

  loadProcessor() {
    this.registerMarkdownPostProcessor(postprocessor);
  }

  loadExtension() {
    this.registerEditorExtension([
      bannerMetadataExtender,
      bannerField
    ]);
  }
}
