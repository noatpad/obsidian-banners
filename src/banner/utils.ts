import { Platform } from 'obsidian';
import type { TFile } from 'obsidian';
import type { IconString } from 'src/bannerData';
import { plug } from 'src/main';
import type { Embedded } from 'src/reading/BannerRenderChild';
import { getSetting } from 'src/settings';
import type { IconHorizontalAlignmentOption, IconVerticalAlignmentOption } from 'src/settings';

export type ViewType = 'editing' | 'reading';
interface Heights { banner: string; icon: string }

export const WRAPPER_CLASS = 'obsidian-banner-wrapper';

const parseInternalLink = (src: string, file: TFile): string | null => {
  const isInternalLink = /^\[\[.+\]\]/.test(src);
  if (!isInternalLink) return null;

  const link = src.slice(2, -2);
  const target = plug.app.metadataCache.getFirstLinkpathDest(link, file.path);
  return target ? plug.app.vault.getResourcePath(target) : link;
};

// TODO: Get better error handling for this
export const fetchImage = async (src: string, file: TFile): Promise<string | null> => {
  // Check if it's an internal link and use that if it is
  const internalLink = parseInternalLink(src, file);
  if (internalLink) return internalLink;

  try {
    const resp = await fetch(src);
    const blob = await resp.blob();
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
  let height = getSetting(Platform.isMobile ? 'mobileHeight' : 'height');
  if (embedded === 'internal') height = getSetting('internalEmbedHeight');
  else if (embedded === 'popover') height = getSetting('popoverHeight');

  const banner = `${height}px`;
  const icon = '3em';
  return { banner, icon };
};

export const getBannerHeight = (
  heights: Heights,
  source: string | undefined,
  icon: IconString | undefined
): string => {
  if (source) return heights.banner;
  else if (icon) return heights.icon;
  return '';
};

const getIconExtraOffset = (offset: string, alignment: IconVerticalAlignmentOption): string => {
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
  icon: IconString | undefined,
  iconAlignment: IconVerticalAlignmentOption
): string => {
  if (source) {
    if (icon) {
      const extraOffset = getIconExtraOffset(heights.icon, iconAlignment);
      return `calc(${heights.banner} + ${extraOffset})`;
    }
    else return heights.banner;
  } else if (icon) {
    return `calc(${heights.icon} * 1.5)`;
  }
  return '';
};

export const getIconTransform = (
  horizontal: IconHorizontalAlignmentOption,
  hTransform: string,
  vertical: IconVerticalAlignmentOption,
  vTransform: string
): string => {
  const h = (horizontal === 'custom') ? hTransform : '0px';
  let v: string;
  switch (vertical) {
    case 'center': v = '50%'; break;
    case 'above': v = '0%'; break;
    case 'edge': v = '50%'; break;
    case 'below': v = '100%'; break;
    case 'custom': v = vTransform; break;
  }
  return `translate(${h}, ${v})`;
};
