import type { EventRef, WorkspaceLeaf } from 'obsidian';
import { plug } from './main';

// eslint-disable-next-line max-len
export const extractBannerData = (frontmatter?: Record<string, unknown>): Partial<BannerMetadata> => ({
  ...(!!frontmatter?.banner) && { source: frontmatter.banner as string },
  ...(!!frontmatter?.banner_x) && { x: frontmatter.banner_x as number },
  ...(!!frontmatter?.banner_y) && { y: frontmatter.banner_y as number }
});

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
