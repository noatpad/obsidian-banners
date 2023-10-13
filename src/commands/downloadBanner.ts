import mime from 'mime-types';
import { Notice, requestUrl } from 'obsidian';
import { extractBannerDataFromFile, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { URL_REGEX } from './utils';

export const canRunCommand = (): boolean => {
  const file = plug.app.workspace.getActiveFile();
  return !!(file && URL_REGEX.test(extractBannerDataFromFile(file).source));
};

const downloadBanner = async () => {
  const file = plug.app.workspace.getActiveFile()!;
  const src = extractBannerDataFromFile(file).source;
  try {
    const { arrayBuffer, headers } = await requestUrl(src);
    const imgName = new URL(src).pathname.slice(1);
    const ext = mime.extension(headers['content-type']) || null;
    const path = await plug.app.vault.getAvailablePathForAttachments(imgName, ext, file.path);
    const image = await plug.app.vault.createBinary(path, arrayBuffer);
    const link = plug.app.fileManager.generateMarkdownLink(image, file.path).slice(1);
    await updateBannerData(file, { source: link });
  } catch (error) {
    new Notice('Couldn\'t download the image into the vault!');
    console.error(error);
  }
};

export default downloadBanner;
