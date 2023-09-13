import type { EditorState } from '@codemirror/state';
import { editorInfoField, parseYaml } from 'obsidian';
import type { TFile } from 'obsidian';
import { plug } from '../main';
import { getSetting } from '../settings';
import { extractHeaderFromYaml, extractIconFromYaml } from './transformers';

interface ReadProperty {
  key: keyof BannerMetadata;
  transform?: (value: any, file: TFile) => any;
}

export interface IconString {
  type: 'text' | 'emoji';
  value: string;
}

// NOTE: This must have every key in `BannerMetadata` and its corresponding type
export interface BannerMetadataWrite {
  source: string;
  x: number;
  y: number;
  icon: string;
  header: string | boolean;
  lock: boolean;
}

export const IMAGE_FORMATS = [
  'apng',
  'avif',
  'gif',
  'jpg',
  'jpeg',
  'jpe',
  'jif',
  'jfif',
  'png',
  'webp'
];

/* NOTE: These are bi-directional maps between YAML banner keys and `BannerMetadata` keys,
to help read, write, & transform banner data between them */
// Read: YAML -> BannerMetadata key/transform
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

// Write: BannerMetadata -> YAML suffix
const WRITE_MAP: Record<keyof BannerMetadata, string> = {
  source: '',
  x: 'x',
  y: 'y',
  icon: 'icon',
  header: 'header',
  lock: 'lock'
} as const;

export const BANNER_WRITE_KEYS = Object.keys(WRITE_MAP) as Array<keyof BannerMetadata>;
const YAML_REGEX = /^---(?<yaml>.*)---/s;

const getYamlKey = (suffix: string) => {
  const prefix = getSetting('frontmatterField');
  return suffix ? `${prefix}_${suffix}` : prefix;
};

// Extract banner data from a given frontmatter-like object (key:value form)
export const extractBannerData = (
  frontmatter: Record<string, unknown> = {},
  file: TFile
): Partial<BannerMetadata> => {
  return Object.entries(READ_MAP).reduce((data, [suffix, item]) => {
    const { key, transform } = item;
    const yamlKey = getYamlKey(suffix);
    if (Object.hasOwn(frontmatter, yamlKey)) {
      const rawValue = frontmatter[yamlKey] as any;
      data[key] = transform ? transform(rawValue, file) : rawValue;
    }
    return data;
  }, {} as Partial<BannerMetadata>);
};

// Helper to extract banner data from a given file
export const extractBannerDataFromFile = (file: TFile): Partial<BannerMetadata> => {
  const { frontmatter } = plug.app.metadataCache.getFileCache(file) ?? {};
  return extractBannerData(frontmatter, file);
};

// Helper to parse raw frontmatter to get banner metadata
/* BUG: Undos and redos do not have the latest frontmatter in the editing view,
causing desynced banner data to pass through until an extra change is done */
export const extractBannerDataFromState = (state: EditorState): Partial<BannerMetadata> => {
  const { data, file } = state.field(editorInfoField);
  const match = data?.match(YAML_REGEX);
  const yaml = match?.groups?.yaml ?? '';
  const frontmatter = (parseYaml(yaml) ?? {}) as Record<string, unknown>;
  return extractBannerData(frontmatter, file!);
};

// Upsert banner data into the frontmatter with its associated field
export const updateBannerData = async (file: TFile, bannerData: Partial<BannerMetadataWrite>) => {
  await plug.app.fileManager.processFrontMatter(file, async (frontmatter) => {
    for (const [dataKey, val] of Object.entries(bannerData) as [keyof BannerMetadata, any][]) {
      const suffix = WRITE_MAP[dataKey];
      const yamlKey = getYamlKey(suffix);
      frontmatter[yamlKey] = val;
    }
  });
};

// Helper on whether a banner element should be displayed or not
export const shouldDisplayBanner = (bannerData: Partial<BannerMetadata>): boolean => {
  const { source, icon, header } = bannerData;
  return !!source || !!icon || !!header;
};
