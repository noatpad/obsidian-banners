import type { Command } from 'obsidian';
import { extractBannerDataFromFile, updateBannerData } from './bannerData';
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
  },
  {
    id: 'banner:removeBanner',
    name: 'Remove banner',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file && !!extractBannerDataFromFile(file)?.source;
      updateBannerData(file!, { source: undefined, x: undefined, y: undefined });
    }
  }
];

const loadCommands = () => {
  for (const command of commands) {
    plug.addCommand(command);
  }
};

export default loadCommands;
