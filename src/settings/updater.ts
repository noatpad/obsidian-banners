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
  };
}

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
      remove: ['allowMobileDrag']
    }
  }
];

const isVersionBelow = (a: string | null, b: string): boolean => {
  if (!a) return true;  // Edge case for 1.X versions
  const [aMax, aMin, aPatch] = a.split('.');
  const [bMax, bMin, bPatch] = b.split('.');
  return (+aMax < +bMax) || (+aMin < +bMin) || (+aPatch < +bPatch);
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
