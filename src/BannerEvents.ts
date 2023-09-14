import { Events } from 'obsidian';
import type { EventRef } from 'obsidian';
import { registerEditorBannerEvents } from './editing';
import { registerReadingBannerEvents } from './reading';
import type { BannerSettings } from './settings/structure';

export default class BannerEvents extends Events {
  loadEvents() {
    registerReadingBannerEvents();
    registerEditorBannerEvents();
  }

  on(name: 'setting-change', callback: (changed: Partial<BannerSettings>) => void): EventRef {
    return super.on(name, callback);
  }

  trigger(name: 'setting-change', data: Partial<BannerSettings>): void {
    super.trigger(name, data);
  }
}
