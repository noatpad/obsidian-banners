import { Plugin } from "obsidian";
import postprocessor from "./reading";

export let plug: BannersPlugin;

export default class BannersPlugin extends Plugin {
  async onload() {
    console.log('Loading Banners 2...');

    plug = this;
    this.loadProcessor();
  }

  async onunload() {
    console.log('Unloading Banners 2...');
  }

  loadProcessor() {
    this.registerMarkdownPostProcessor(postprocessor)
  }
}
