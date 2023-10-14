import type { EditorState } from '@codemirror/state';
import { editorInfoField, parseYaml } from 'obsidian';
import type { TFile } from 'obsidian';
import { plug } from '../main';
import { getSetting } from '../settings';
import { extractHeaderFromYaml, extractIconFromYaml } from './transformers';

interface ReadProperty {
  key: keyof BannerData;
  transform?: (value: any, file: TFile) => any;
}

export interface IconString {
  type: 'text' | 'emoji';
  value: string;
}

// NOTE: This must have every key in `BannerData` and its corresponding type
export interface BannerDataWrite {
  source: string;
  x: number;
  y: number;
  icon: string;
  header: string | null;
  lock: boolean;
}

/* NOTE: These are cherry-picked from the mime-db repo (https://github.com/jshttp/mime-db)
('cause heaven forbid I download a 200kb JSON file for a handful of types) */
export const MIME_TYPES: Record<string, string[]> = {
  'image/apng': ['apng'],
  'image/avif': ['avif'],
  'image/gif': ['gif'],
  'image/jpeg': ['jpg', 'jpeg', 'jpe'],
  'image/png': ['png'],
  'image/webp': ['webp']
};
export const IMAGE_EXTENSIONS = Object.values(MIME_TYPES).flat();

/* NOTE: These are bi-directional maps between YAML banner keys and `BannerData` keys,
to help read, write, & transform banner data between them */
// Read: YAML -> BannerData key/transform
const READ_MAP: Record<string, ReadProperty> = {
  '': { key: 'source' },
  x: { key: 'x' },
  y: { key: 'y' },
  icon: {
    key: 'icon',
    transform: extractIconFromYaml
  },
  header: {
    key: 'header',
    transform: extractHeaderFromYaml
  },
  lock: { key: 'lock' }
} as const;

// Write: BannerData -> YAML suffix
const WRITE_MAP: Record<keyof BannerData, string> = {
  source: '',
  x: 'x',
  y: 'y',
  icon: 'icon',
  header: 'header',
  lock: 'lock'
} as const;

const YAML_REGEX = /^---\n(.*?)\n---/s;
const LEGACY_REGEX = /^!\[\[.+\]\]$/;

const getYamlKey = (suffix: string) => {
  const prefix = getSetting('frontmatterField');
  return suffix ? `${prefix}_${suffix}` : prefix;
};

// Extract banner data from a given frontmatter-like object (key:value form)
export const extractBannerData = (
  frontmatter: Record<string, unknown> = {},
  file: TFile
): BannerData => {
  return Object.entries(READ_MAP).reduce((data, [suffix, item]) => {
    const { key, transform } = item;
    const yamlKey = getYamlKey(suffix);
    const rawValue = frontmatter[yamlKey];
    data[key] = transform ? transform(rawValue, file) : rawValue;
    return data;
  }, {} as Record<keyof BannerData, unknown>) as BannerData;
};

// Helper to extract banner data from a given file
export const extractBannerDataFromFile = (file: TFile): BannerData => {
  const { frontmatter } = plug.app.metadataCache.getFileCache(file) ?? {};
  return extractBannerData(frontmatter, file);
};

// Helper to parse raw frontmatter to get banner metadata
/* BUG: Undos, redos, and source frontmatter edits do not have the latest frontmatter in the
editing view, causing desynced banner data to pass through until an extra change is done */
export const extractBannerDataFromState = (state: EditorState): BannerData => {
  const { data, file } = state.field(editorInfoField);
  const match = data?.match(YAML_REGEX);
  const yaml = match ? match[1] : '';
  try {
    const frontmatter = (parseYaml(yaml) ?? {}) as Record<string, unknown>;
    return extractBannerData(frontmatter, file!);
  } catch (error) {
    return extractBannerData({}, file!);
  }
};

// Upsert banner data into the frontmatter with its associated field
export const updateBannerData = async (file: TFile, bannerData: Partial<BannerDataWrite>) => {
  await plug.app.fileManager.processFrontMatter(file, async (frontmatter) => {
    for (const [dataKey, val] of Object.entries(bannerData) as [keyof BannerData, any][]) {
      const suffix = WRITE_MAP[dataKey];
      const yamlKey = getYamlKey(suffix);
      frontmatter[yamlKey] = val;
    }
  });
};

// Helper to update a banner's source legacy syntax to the current syntax
export const updateLegacyBannerSource = async (file: TFile): Promise<boolean> => {
  let changed = false;
  await plug.app.fileManager.processFrontMatter(file, (frontmatter) => {
    const { source } = extractBannerData(frontmatter, file);
    if (source && LEGACY_REGEX.test(source)) {
      const key = getYamlKey(WRITE_MAP.source);
      frontmatter[key] = source.slice(1);
      changed = true;
    }
  });
  return changed;
};
