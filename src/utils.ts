import type { EventRef, WorkspaceLeaf } from 'obsidian';

import { plug } from './main';

const massageString = (value: string): string => {
  value = /^"(.+)"$/.test(value) ? value.slice(1, -1) : value;
  return value.trim();
};

const massageNumber = (value: string | number): number => (
  (typeof value === 'number') ? value : Number(value)
);

export const extractBannerData = (frontmatter?: Record<string, any>): BannerMetadata => {
  return {
    source: frontmatter?.banner && massageString(frontmatter.banner),
    x: frontmatter?.banner_x && massageNumber(frontmatter.banner_x),
    y: frontmatter?.banner_y && massageNumber(frontmatter.banner_y)
  };
};

export const isEqualBannerData = (a: BannerMetadata, b: BannerMetadata): boolean => {
  console.log(a, b);
  const keys = Object.keys(a) as Array<keyof BannerMetadata>;
  return keys.every((k) => a[k] === b[k]);
};

// Helper to check if a leaf is a Markdown file view, and if specified, if it's a specific mode
export const doesLeafHaveMarkdownMode = (leaf: WorkspaceLeaf, mode?: 'reading' | 'editing') => {
  const { type, state } = leaf.getViewState();
  if (type !== 'markdown') return false;
  if (!mode) return true;
  return (mode === 'reading') ? (state.mode === 'preview') : (state.mode === 'source');
};

// Helper to register multiple events at once
export const registerEvents = (events: EventRef[]) => {
  for (const event of events) plug.registerEvent(event);
};
