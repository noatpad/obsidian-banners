import { Notice } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import downloadBanner from './downloadBanner';
import { URL_REGEX } from './utils';

export const canRunCommand = (): boolean => !!plug.app.workspace.getActiveFile();

const clipboardError = (clipboard: string) => {
  new Notice('Your clipboard didn\'t have a valid URL!');
  console.error({ clipboard });
};

export const downloadBannerInstead = async () => {
  const clipboard = await navigator.clipboard.readText();
  if (URL_REGEX.test(clipboard)) {
    await downloadBanner(clipboard);
  } else {
    clipboardError(clipboard);
  }
};

const pasteBanner = async () => {
  const file = plug.app.workspace.getActiveFile()!;
  const clipboard = await navigator.clipboard.readText();
  if (URL_REGEX.test(clipboard)) {
    await updateBannerData(file, { source: clipboard });
    new Notice(`Pasted a new banner for ${file.name}!`);
  } else {
    clipboardError(clipboard);
  }
};

export default pasteBanner;
