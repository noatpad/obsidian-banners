import type { EventRef, WorkspaceLeaf } from 'obsidian';
import { plug } from './main';
import { BannerSettings, getSetting } from './settings';

type Settings = keyof BannerSettings | Array<keyof BannerSettings>;

// eslint-disable-next-line max-len
export const extractBannerData = (frontmatter: Record<string, unknown> = {}): Partial<BannerMetadata> => {
  const prefix = getSetting('frontmatterField');
  return ({
    ...(frontmatter[prefix] !== undefined) && { source: frontmatter[prefix] as string },
    ...(frontmatter[`${prefix}_x`] !== undefined) && { x: frontmatter[`${prefix}_x`] as number },
    ...(frontmatter[`${prefix}_y`] !== undefined) && { y: frontmatter[`${prefix}_y`] as number }
  });
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

// Helper to register a `setting-change` event
export const registerSettingChangeEvent = (settings: Settings, cb: CallableFunction) => {
  const keys = typeof settings === 'string' ? [settings] : settings;
  plug.registerEvent(
    plug.events.on('setting-change', (changed) => {
      if (keys.some((key) => Object.hasOwn(changed, key))) cb();
    })
  );
};
