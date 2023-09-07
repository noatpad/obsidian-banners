import { PluginSettingTab } from 'obsidian';
import { plug } from 'src/main';
import Settings from './components/Settings.svelte';

export class SettingsTab extends PluginSettingTab {
  component: Settings | undefined;

  constructor() {
    super(plug.app, plug);
  }

  display() {
    this.component = this.component || new Settings({ target: this.containerEl });
  }

  hide() {
    this.component?.$destroy();
    this.component = undefined;
  }
}
