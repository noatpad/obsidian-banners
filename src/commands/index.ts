import type { Command } from 'obsidian';
import { extractBannerDataFromFile, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import IconModal from 'src/modals/IconModal';
import LocalImageModal from 'src/modals/LocalImageModal';
import UpsertHeaderModal from 'src/modals/UpsertHeaderModal';
import { getSetting } from 'src/settings';
import downloadBanner, { canRunCommand as canRunDownloadBannerCmd } from './downloadBanner';
import pasteBanner, {
  canRunCommand as canRunPasteBannerCmd,
  downloadBannerInstead
} from './pasteBanner';

const commands: Command[] = [
  {
    id: 'banners:upsertBanner',
    name: 'Add/Change banner with local image',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      new LocalImageModal(file!).open();
    }
  },
  {
    id: 'banners:removeBanner',
    name: 'Remove banner',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!(file && extractBannerDataFromFile(file).source);
      updateBannerData(file!, { source: undefined, x: undefined, y: undefined });
    }
  },
  {
    id: 'banners:pasteBanner',
    name: 'Paste banner from clipboard',
    checkCallback(checking) {
      if (checking) return canRunPasteBannerCmd();
      if (getSetting('autoDownloadPastedBanners')) {
        downloadBannerInstead();
      } else {
        pasteBanner();
      }
    }
  },
  {
    id: 'banners:downloadBanner',
    name: 'Download banner in note to vault',
    checkCallback(checking) {
      if (checking) return canRunDownloadBannerCmd();
      downloadBanner();
    }
  },
  {
    id: 'banners:lockBanner',
    name: 'Lock/Unlock banner position',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!(file && extractBannerDataFromFile(file).source);
      const lock = extractBannerDataFromFile(file!).lock;
      updateBannerData(file!, { lock: !lock || undefined });
    }
  },
  {
    id: 'banners:upsertIcon',
    name: 'Add/Change icon',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      new IconModal(file!).open();
    }
  },
  {
    id: 'banners:removeIcon',
    name: 'Remove icon',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!(file && extractBannerDataFromFile(file).icon);
      updateBannerData(file!, { icon: undefined });
    }
  },
  {
    id: 'banners:upsertHeader',
    name: 'Add/Change header',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!file;
      new UpsertHeaderModal(file!).open();
    }
  },
  {
    id: 'banners:removeHeader',
    name: 'Remove header',
    checkCallback(checking) {
      const file = plug.app.workspace.getActiveFile();
      if (checking) return !!(file && extractBannerDataFromFile(file).header !== undefined);
      updateBannerData(file!, { header: undefined });
    }
  }
];

const loadCommands = () => {
  for (const command of commands) {
    plug.addCommand(command);
  }
};

export default loadCommands;
