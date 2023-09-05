import { Events } from 'obsidian';
import { registerEditorBannerEvents } from './editing';
import { registerReadingBannerEvents } from './reading';
import type { BannerSettings } from './settings';
import type { EventRef } from 'obsidian';

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
