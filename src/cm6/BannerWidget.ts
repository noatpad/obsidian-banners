import { WidgetType } from "@codemirror/view";

import BannersPlugin from "../main";
import { IBannerMetadata } from "../MetaManager";
import getBannerElements from "../Banner";

export default class BannerWidget extends WidgetType {
  plugin: BannersPlugin;
  bannerData: IBannerMetadata;
  filepath: string;
  contentEl: HTMLElement;

  constructor(plugin: BannersPlugin, bannerData: IBannerMetadata, filepath: string, contentEl: HTMLElement) {
    super();
    this.plugin = plugin;
    this.bannerData = bannerData;
    this.filepath = filepath;
    this.contentEl = contentEl;
  }

  eq(widget: BannerWidget): boolean {
    const { bannerData, filepath } = widget;
    return (
      this.bannerData.src === bannerData.src &&
      this.bannerData.x === bannerData.x &&
      this.bannerData.y === bannerData.y &&
      this.filepath === filepath
    );
  }

  toDOM(): HTMLElement {
    const { plugin, bannerData, filepath, contentEl } = this;
    const wrap = document.createElement('div');
    wrap.addClass('obsidian-banner', 'cm6-banner', plugin.settings.style);

    const bannerElements = getBannerElements(plugin, bannerData, filepath, wrap, contentEl);
    wrap.append(...bannerElements);
    return wrap;
  }
}
