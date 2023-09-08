import type { EventRef, TFile, WorkspaceLeaf } from 'obsidian';
import { plug } from './main';
import { getSetting } from './settings';
import type { BannerSettings } from './settings';
import type { MarkdownViewState } from './types';

type Settings = keyof BannerSettings | Array<keyof BannerSettings>;

const SUFFIX_TO_KEY_MAP: Record<string, keyof BannerMetadata> = {
  '': 'source',
  x: 'x',
  y: 'y'
} as const;

const KEY_TO_SUFFIX_MAP: Record<keyof BannerMetadata, string> = {
  source: '',
  x: 'x',
  y: 'y'
} as const;

const getYamlKey = (suffix: string) => {
  const prefix = getSetting('frontmatterField');
  return suffix ? `${prefix}_${suffix}` : prefix;
};

// Extract banner data from a given frontmatter-like object (key:value form)
// eslint-disable-next-line max-len
export const extractBannerData = (frontmatter: Record<string, unknown> = {}): Partial<BannerMetadata> => {
  return Object.entries(SUFFIX_TO_KEY_MAP).reduce((data, [suffix, dataKey]) => {
    const yamlKey = getYamlKey(suffix);
    if (Object.hasOwn(frontmatter, yamlKey)) data[dataKey] = frontmatter[yamlKey] as any;
    return data;
  }, {} as Partial<BannerMetadata>);
};

// Upsert banner data into the frontmatter with its associated field
export const updateBannerData = async (file: TFile, bannerData: Partial<BannerMetadata>) => {
  await plug.app.fileManager.processFrontMatter(file, async (frontmatter) => {
    for (const [dataKey, val] of Object.entries(bannerData) as [keyof BannerMetadata, any][]) {
      const suffix = KEY_TO_SUFFIX_MAP[dataKey];
      const yamlKey = getYamlKey(suffix);
      frontmatter[yamlKey] = val;
    }
  });
};

// Helper to check if a leaf is a Markdown file view, and if specified, if it's a specific mode
export const doesLeafHaveMarkdownMode = (leaf: WorkspaceLeaf, mode?: 'reading' | 'editing') => {
  const { type, state } = leaf.getViewState();
  if (type !== 'markdown') return false;
  if (!mode) return true;
  return (mode === 'reading') ? (state.mode === 'preview') : (state.mode === 'source');
};


// Helper to iterate through all markdown leaves, and if specified, those with a specific view
export const iterateMarkdownLeaves = (
  cb: (leaf: WorkspaceLeaf) => void,
  mode?: 'reading' | 'editing'
) => {
  let leaves = plug.app.workspace.getLeavesOfType('markdown');
  if (mode) {
    leaves = leaves.filter((leaf) => {
      const { state } = leaf.getViewState() as MarkdownViewState;
      return (mode === 'reading') ? (state.mode === 'preview') : (state.mode === 'source');
    });
  }
  for (const leaf of leaves) cb(leaf);
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
