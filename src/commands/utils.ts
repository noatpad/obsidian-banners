import { Notice } from 'obsidian';
import type { TFile } from 'obsidian';
import { updateBannerData } from 'src/bannerData';

// eslint-disable-next-line max-len
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)$/;

export const pasteBanner = async (file: TFile) => {
  const clipboard = await navigator.clipboard.readText();
  if (URL_REGEX.test(clipboard)) {
    updateBannerData(file, { source: clipboard });
    new Notice(`Pasted a new banner for ${file.name}!`);
  } else {
    new Notice('Your clipboard didn\'t have a valid URL!');
    console.error({ clipboard });
  }
};
