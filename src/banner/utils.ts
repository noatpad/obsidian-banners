import { Platform, requestUrl } from 'obsidian';
import { IMAGE_FORMATS } from 'src/bannerData';
import { plug } from 'src/main';
import type { Embedded } from '.';

interface Heights {
  desktopHeight: string;
  mobileHeight: string;
  internalEmbedHeight: string;
  popoverHeight: string;
}

const FILE_REGEX = /^\[\[.+\]\]/;
const imageCache: Record<string, string> = {};

const getInternalImage = (link: string, currentPath: string) => {
  const file = plug.app.metadataCache.getFirstLinkpathDest(link.slice(2, -2), currentPath);
  if (!file) {
    throw new Error(`${link} file does not exist!`);
  } else if (!IMAGE_FORMATS.includes(file.extension)) {
    throw new Error(`${file.name} is not an image!`);
  }

  const resourcePath = plug.app.vault.getResourcePath(file);
  imageCache[file.path] = resourcePath;
  return resourcePath;
};

const getRemoteImage = async (src: string) => {
  try {
    // Error out if the string isn't a valid URL
    new URL(src);

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
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to fetch image from "${src}"!`);
  }
};

export const fetchImage = async (src: string, currentPath: string): Promise<string | null> => {
  // Check the image cache first
  if (imageCache[src]) return imageCache[src];

  if (FILE_REGEX.test(src)) {
    return getInternalImage(src, currentPath);
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

export const flushImageCache = () => {
  for (const key in imageCache) delete imageCache[key];
};
