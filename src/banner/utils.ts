import { Platform, requestUrl } from 'obsidian';
import type { TFile } from 'obsidian';
import { IMAGE_FORMATS } from 'src/bannerData';
import type { IconString } from 'src/bannerData';
import { plug } from 'src/main';
import type { Embedded } from 'src/reading/BannerRenderChild';
import { getSetting, parseCssSetting } from 'src/settings';
import type { HeaderHorizontalAlignmentOption, HeaderVerticalAlignmentOption } from 'src/settings';

export type ViewType = 'editing' | 'reading';
interface Heights { banner: string; icon: string }

export const WRAPPER_CLASS = 'obsidian-banner-wrapper';

const getInternalFile = (src: string, file: TFile): TFile | null => {
  const isInternalLink = /^\[\[.+\]\]/.test(src);
  if (!isInternalLink) return null;

  const link = src.slice(2, -2);
  return plug.app.metadataCache.getFirstLinkpathDest(link, file.path);
};

export const fetchImage = async (src: string, file: TFile): Promise<string | null> => {
  // Check if it's an internal link to an image and use that if it is
  const internalFile = getInternalFile(src, file);
  if (internalFile) {
    if (!IMAGE_FORMATS.includes(internalFile.extension)) {
      throw new Error(`${internalFile.name} is not an image!`);
    }
    return plug.app.vault.getResourcePath(internalFile);
  }

  try {
    const resp = await requestUrl(src);
    const blob = new Blob([resp.arrayBuffer], { type: resp.headers['content-type'] });
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  } catch (error: any) {
    throw new Error(error);
  }
};

export const getHeights = (embedded: Embedded, _deps?: any[]): Heights => {
  let bannerHeight = getSetting(Platform.isMobile ? 'mobileHeight' : 'height');
  if (embedded === 'internal') bannerHeight = getSetting('internalEmbedHeight');
  else if (embedded === 'popover') bannerHeight = getSetting('popoverHeight');

  const banner = parseCssSetting(bannerHeight);
  const icon = parseCssSetting(getSetting('headerSize'));
  return { banner, icon };
};

export const getBannerHeight = (
  heights: Heights,
  source: string | undefined,
  icon: IconString | undefined,
  header: string | undefined
): string => {
  if (source) return heights.banner;
  else if (icon || header) return heights.icon;
  return '';
};

const getHeaderExtraOffset = (offset: string, alignment: HeaderVerticalAlignmentOption): string => {
  switch (alignment) {
    case 'center':
    case 'above': return '0px';
    case 'edge':
    case 'custom': return `(${offset} / 2)`;
    case 'below': return offset;
  }
};

export const getSizerHeight = (
  heights: Heights,
  source: string | undefined,
  header: string | boolean | undefined,
  icon: IconString | undefined,
  iconAlignment: HeaderVerticalAlignmentOption
): string => {
  if (source) {
    if (icon || header) {
      const extraOffset = getHeaderExtraOffset(heights.icon, iconAlignment);
      return `calc(${heights.banner} + ${extraOffset})`;
    }
    else return heights.banner;
  } else if (icon || header) {
    return heights.icon;
  }
  return '';
};

export const getHeaderTransform = (
  horizontal: HeaderHorizontalAlignmentOption,
  hTransform: string,
  vertical: HeaderVerticalAlignmentOption,
  vTransform: string
): string => {
  const h = (horizontal === 'custom') ? hTransform : '0px';
  let v: string;
  switch (vertical) {
    case 'above': v = '0%'; break;
    case 'center':
    case 'edge': v = '50%'; break;
    case 'below': v = '100%'; break;
    case 'custom': v = vTransform; break;
  }
  return `translate(${h}, ${v})`;
};
