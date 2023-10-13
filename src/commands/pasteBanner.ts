import { Notice } from 'obsidian';
import { updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { URL_REGEX } from './utils';

export const canRunCommand = (): boolean => !!plug.app.workspace.getActiveFile();

const pasteBanner = async () => {
  const file = plug.app.workspace.getActiveFile()!;
  const clipboard = await navigator.clipboard.readText();
  if (URL_REGEX.test(clipboard)) {
    await updateBannerData(file, { source: clipboard });
    new Notice(`Pasted a new banner for ${file.name}!`);
  } else {
    new Notice('Your clipboard didn\'t have a valid URL!');
    console.error({ clipboard });
  }
};

export default pasteBanner;
