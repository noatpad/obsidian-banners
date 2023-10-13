import { Platform, requestUrl } from 'obsidian';
import type { TFile } from 'obsidian';
import { IMAGE_FORMATS } from 'src/bannerData';
import { plug } from 'src/main';
import type { Embedded } from '.';

interface Heights {
  desktopHeight: string;
  mobileHeight: string;
  internalEmbedHeight: string;
  popoverHeight: string;
}

const imageCache: Record<string, string> = {};

const getInternalFile = (src: string, filepath: string): TFile | null => {
  const isInternalLink = /^\[\[.+\]\]/.test(src);
  if (!isInternalLink) return null;

  const link = src.slice(2, -2);
  return plug.app.metadataCache.getFirstLinkpathDest(link, filepath);
};

const getInternalImage = (file: TFile) => {
  if (!IMAGE_FORMATS.includes(file.extension)) {
    throw new Error(`${file.name} is not an image!`);
  }
  const resourcePath = plug.app.vault.getResourcePath(file);
  imageCache[file.path] = resourcePath;
  return resourcePath;
};

const getRemoteImage = async (src: string) => {
  try {
    const resp = await requestUrl(src);
    const blob = new Blob([resp.arrayBuffer], { type: resp.headers['content-type'] });
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const result = reader.result as string;
        imageCache[src] = result;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

export const fetchImage = async (src: string, filepath: string): Promise<string | null> => {
  // Check the image cache first
  if (imageCache[src]) {
    return imageCache[src];
  }
  // Check if it's an internal link to an image and use that if it is
  const internalFile = getInternalFile(src, filepath);
  if (internalFile) {
    return getInternalImage(internalFile);
  } else {
    return getRemoteImage(src);
  }
};

export const getBannerHeight = (heights: Heights, embed: Embedded): string => {
  const {
    desktopHeight,
    mobileHeight,
    internalEmbedHeight,
    popoverHeight
  } = heights;
  let newHeight = Platform.isMobile ? mobileHeight : desktopHeight;
  if (embed === 'internal') newHeight = internalEmbedHeight;
  else if (embed === 'popover') newHeight = popoverHeight;
  return newHeight as string;
};
