import type { Command } from 'obsidian';
import { extractBannerDataFromFile, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import LocalImageModal from 'src/modals/LocalImageModal';
import { pasteBanner } from './utils';

const commands: Command[] = [
  {
    id: 'banners:upsertBanner',
    name: 'Add/Change banner with local image',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      new LocalImageModal(plug.app, file!).open();
    }
  },
  {
    id: 'banners:removeBanner',
    name: 'Remove banner',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file && !!extractBannerDataFromFile(file)?.source;
      updateBannerData(file!, { source: undefined, x: undefined, y: undefined });
    }
  },
  {
    id: 'banners:pasteBanner',
    name: 'Paste banner from clipboard',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      pasteBanner(file!);
    }
  }
  // TODO: Add lock banner command
];

const loadCommands = () => {
  for (const command of commands) {
    plug.addCommand(command);
  }
};

export default loadCommands;
