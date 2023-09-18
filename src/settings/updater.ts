import { Notice } from 'obsidian';
import { plug } from 'src/main';

type SettingsData = Record<string, unknown> & {
  version: string;
};

type KeyChanges = Record<string, string>;
type ValueChanges = Record<string, Record<string, string>>;
type Removals = string[];

interface BreakingChanges {
  version: string;
  changes: {
    keys?: KeyChanges;
    values?: ValueChanges;
    remove?: Removals;
    callbacks?: Array<() => void>;
  };
}

const SEMVER_REGEX = /^(?<major>0|[1-9]\d*)\.(?<minor>0|[1-9]\d*)\.(?<patch>0|[1-9]\d*)/;

const breakingChanges: BreakingChanges[] = [
  {
    version: '2.0.0',
    changes: {
      keys: {
        iconHorizontalAlignment: 'headerHorizontalAlignment',
        iconHorizontalTransform: 'headerHorizontalTransform',
        iconVerticalAlignment: 'headerVerticalAlignment',
        iconVerticalTransform: 'headerVerticalTransform',
        showInPreviewEmbed: 'showInPopover',
        previewEmbedHeight: 'popoverHeight',
        localSuggestionsLimit: 'localModalSuggestionLimit'
      },
      values: {
        bannerDragModifier: {
          none: 'None',
          shift: 'Shift',
          ctrl: 'Ctrl',
          alt: 'Alt',
          meta: 'Meta'
        },
        headerVerticalAlignment: { center: 'edge' }
      },
      remove: ['allowMobileDrag'],
      callbacks: [
        () => new Notice(createFragment((el) => {
          el.createEl('b', { text: 'Hey! Looks like you\'ve used Banners in the past. ' });
          el.createEl('br');
          el.createSpan({
            text: 'Banners created in 1.x use an outdated syntax for internal files that ' +
            'no longer work in 2.0. To update this throughout your vault, go to the bottom ' +
            'of the Banners settings tab'
          });
        }), 0)
      ]
    }
  }
];

const isVersionBelow = (a: string | null, b: string): boolean => {
  if (!a) return true;  // Edge case for 1.X versions
  const { major: aMajor, minor: aMinor, patch: aPatch } = a.match(SEMVER_REGEX)!.groups!;
  const { major: bMajor, minor: bMinor, patch: bPatch } = b.match(SEMVER_REGEX)!.groups!;
  return (+aMajor < +bMajor) || (+aMinor < +bMinor) || (+aPatch < +bPatch);
};

const updateKeys = (data: SettingsData, keys: KeyChanges) => {
  for (const [oldKey, newKey] of Object.entries(keys)) {
    if (data[oldKey]) {
      data[newKey] = data[oldKey];
      delete data[oldKey];
    }
  }
};

const updateValue = (data: SettingsData, keys: ValueChanges) => {
  for (const [key, values] of Object.entries(keys)) {
    const oldValue = data[key] as any;
    if (oldValue !== undefined && Object.hasOwn(values, oldValue)) {
      data[key] = values[oldValue];
    }
  }
};

const removeSetting = (data: SettingsData, keys: Removals) => {
  for (const key of keys) {
    delete data[key];
  }
};

export const updateSettings = (data: SettingsData) => {
  let madeChanges = false;
  for (const { version, changes } of breakingChanges) {
    if (isVersionBelow(data.version, version)) {
      madeChanges = true;
      if (changes.keys) updateKeys(data, changes.keys);
      if (changes.values) updateValue(data, changes.values);
      if (changes.remove) removeSetting(data, changes.remove);
      if (changes.callbacks) changes.callbacks.forEach((cb) => cb());
    }
  }

  for (const [key, val] of Object.entries(data)) {
    if (val === null) {
      madeChanges = true;
      delete data[key];
    }
  }

  if (madeChanges) {
    new Notice(`Updated Banner settings from ${data.version ?? '1.x'} to ${plug.manifest.version}`);
  }
};

export const areSettingsOutdated = (data: SettingsData | null): boolean => {
  if (!data) return false;
  return isVersionBelow(data.version, plug.manifest.version);
};
