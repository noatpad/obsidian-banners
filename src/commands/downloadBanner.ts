import { Notice, requestUrl } from 'obsidian';
import { MIME_TYPES, extractBannerDataFromFile, updateBannerData } from 'src/bannerData';
import { plug } from 'src/main';
import { URL_REGEX } from './utils';

const hasExtension = (filename: string): boolean => {
  const ext = filename.split('.').pop();
  return filename !== ext;
};

export const canRunCommand = (): boolean => {
  const file = plug.app.workspace.getActiveFile();
  return !!(file && URL_REGEX.test(extractBannerDataFromFile(file).source));
};

const downloadBanner = async (source?: string) => {
  const file = plug.app.workspace.getActiveFile()!;
  const src = source ?? extractBannerDataFromFile(file).source;
  try {
    const { arrayBuffer, headers } = await requestUrl(src);
    const imgName = new URL(src).pathname.split('/').pop()!;
    const ext = hasExtension(imgName) ? null : (MIME_TYPES[headers['content-type']][0] || null);
    const path = await plug.app.vault.getAvailablePathForAttachments(imgName, ext, file.path);
    const image = await plug.app.vault.createBinary(path, arrayBuffer);
    const link = plug.app.fileManager.generateMarkdownLink(image, file.path).slice(1);
    await updateBannerData(file, { source: link });
    new Notice(`Downloaded the banner to ${image.path} and linked the note to it!`);
  } catch (error) {
    new Notice('Couldn\'t download the image into the vault!');
    console.error(error);
  }
};

export default downloadBanner;
