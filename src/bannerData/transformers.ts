import type { TFile } from 'obsidian';
import type { IconString } from '.';

/* NOTE: There is a new regex known as /\p{RGI_Emoji}/v that can do emojis that are made of more
than one emoji, but the `v` flag is not yet compatible */
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]+/gu;

export const extractIconFromYaml = (value: string | undefined): IconString | null => {
  if (!value) return null;
  const match = value.match(EMOJI_REGEX);
  return match?.length
    ? { type: 'emoji', value: match.join('\u200d') }
    : { type: 'text', value: value.slice(0, 1) };
};

export const extractHeaderFromYaml = (
  value: string | boolean | undefined,
  file: TFile
): string | null => {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? file.basename : null;
  return value || null;
};
