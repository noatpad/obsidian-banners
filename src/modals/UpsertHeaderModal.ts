import { Modal, TFile } from 'obsidian';
import { plug } from 'src/main';
import UpsertHeaderForm from './UpsertHeaderForm.svelte';

export default class UpsertHeaderModal extends Modal {
  activeFile: TFile;
  component!: UpsertHeaderForm;
  off!: () => void;

  constructor(file: TFile) {
    super(plug.app);
    this.activeFile = file;
  }

  onOpen() {
    this.titleEl.setText('What would you like to put on your header?');
    this.component = new UpsertHeaderForm({
      target: this.contentEl,
      props: { file: this.activeFile }
    });
    this.off = this.component.$on('close', () => this.close());
  }

  onClose() {
    this.off();
    this.component.$destroy();
  }
}
