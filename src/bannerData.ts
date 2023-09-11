import type { EditorState } from '@codemirror/state';
import { editorInfoField, parseYaml } from 'obsidian';
import type { TFile } from 'obsidian';
import { plug } from './main';
import { getSetting } from './settings';
import { extractIconFromYaml } from './transformers';

interface ReadWriteProperty { transform?: CallableFunction }
interface ReadProperty extends ReadWriteProperty { key: keyof BannerMetadata }
interface WriteProperty extends ReadWriteProperty { suffix: string }

export interface IconString {
  type: 'text' | 'emoji';
  value: string;
}

export interface BannerMetadataWrite {
  source: string;
  x: number;
  y: number;
  icon: string;
}

export const BANNER_DATA_KEYS: Array<keyof BannerMetadata> = [
  'source',
  'x',
  'y',
  'icon'
];

/* NOTE: These are bi-directional maps between YAML banner keys and `BannerMetadata` keys,
to help read, write, & transform banner data between them */
// Read: YAML -> BannerMetadata
const READ_MAP: Record<string, ReadProperty> = {
  '': { key: 'source' },
  x: { key: 'x' },
  y: { key: 'y' },
  icon: {
    key: 'icon',
    transform: extractIconFromYaml
  }
} as const;

// Write: BannerMetadata -> YAML
const WRITE_MAP: Record<keyof BannerMetadata, WriteProperty> = {
  source: { suffix: '' },
  x: { suffix: 'x' },
  y: { suffix: 'y' },
  icon: { suffix: 'icon' }
} as const;

const YAML_REGEX = /^---(?<yaml>.*)---/s;

const getYamlKey = (suffix: string) => {
  const prefix = getSetting('frontmatterField');
  return suffix ? `${prefix}_${suffix}` : prefix;
};

// Extract banner data from a given frontmatter-like object (key:value form)
// eslint-disable-next-line max-len
export const extractBannerData = (frontmatter: Record<string, unknown> = {}): Partial<BannerMetadata> => {
  return Object.entries(READ_MAP).reduce((data, [suffix, item]) => {
    const { key, transform } = item;
    const yamlKey = getYamlKey(suffix);
    if (Object.hasOwn(frontmatter, yamlKey)) {
      const rawValue = frontmatter[yamlKey] as any;
      data[key] = transform ? transform(rawValue) : rawValue;
    }
    return data;
  }, {} as Partial<BannerMetadata>);
};

// Helper to extract banner data from a given file
export const extractBannerDataFromFile = (file: TFile): Partial<BannerMetadata> => {
  const { frontmatter } = plug.app.metadataCache.getFileCache(file) ?? {};
  return extractBannerData(frontmatter);
};

// Parse raw frontmatter to get banner metadata
/* BUG: Undos and redos do not have the latest frontmatter in the editing view,
causing desynced banner data to pass through until an extra change is done */
export const extractBannerDataFromState = (state: EditorState): Partial<BannerMetadata> => {
  const { data } = state.field(editorInfoField);
  const match = data?.match(YAML_REGEX);
  const yaml = match?.groups?.yaml ?? '';
  const frontmatter = (parseYaml(yaml) ?? {}) as Record<string, unknown>;
  return extractBannerData(frontmatter);
};

// Upsert banner data into the frontmatter with its associated field
export const updateBannerData = async (file: TFile, bannerData: Partial<BannerMetadataWrite>) => {
  await plug.app.fileManager.processFrontMatter(file, async (frontmatter) => {
    for (const [dataKey, val] of Object.entries(bannerData) as [keyof BannerMetadata, any][]) {
      const { suffix, transform } = WRITE_MAP[dataKey];
      const yamlKey = getYamlKey(suffix);
      frontmatter[yamlKey] = transform ? transform(val) : val;
    }
  });
};
