import { Modal } from 'obsidian';
import { plug } from 'src/main';
import UpdateLegacySourcePrompt from './UpdateLegacySourcePrompt.svelte';

export default class UpdateLegacySourceModal extends Modal {
  component!: UpdateLegacySourcePrompt;
  off!: () => void;

  constructor() {
    super(plug.app);
  }

  onOpen() {
    this.titleEl.setText('Update legacy syntax for banner sources');
    this.component = new UpdateLegacySourcePrompt({ target: this.contentEl });
    this.off = this.component.$on('close', () => this.close());
  }

  onClose() {
    this.off();
    this.component.$destroy();
  }
}
