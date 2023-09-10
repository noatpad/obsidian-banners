import type { IconString } from './bannerData';

/* NOTE: There is a new regex known as /\p{RGI_Emoji}/v that can do emojis that are made of more
than one emoji, but the `v` flag is not yet compatible */
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/gu;

export const extractIconFromYaml = (str: string | undefined): IconString | null => {
  if (!str) return null;
  const match = str.match(EMOJI_REGEX);
  return match?.length
    ? { type: 'emoji', value: match.join('\u200d') }
    : { type: 'text', value: str.slice(0, 1) };
};

export const extractIconFromData = (icon: IconString): string | undefined => {
  return icon?.value;
};
