import type { Command } from 'obsidian';
import { plug } from './main';
import LocalImageModal from './modals/LocalImageModal';

const commands: Command[] = [
  {
    id: 'banner:upsertBanner',
    name: 'Add/Change banner with local image',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      new LocalImageModal(plug.app, file!).open();
    }
  }
];

const loadCommands = () => {
  for (const command of commands) {
    plug.addCommand(command);
  }
};

export default loadCommands;
