import { Events, type EventRef } from "obsidian";
import type { BannerSettings } from "./settings";
import { registerReadingBannerEvents } from "./reading";
import { registerEditorBannerEvents } from "./editing";

export default class BannerEvents extends Events {
  loadEvents() {
    registerReadingBannerEvents();
    registerEditorBannerEvents();
  }

  on(name: 'setting-change', callback: (changed: Partial<BannerSettings>) => any): EventRef {
    return super.on(name, callback);
  }

  trigger(name: 'setting-change', data: Partial<BannerSettings>): void {
    super.trigger(name, data);
  }
}
