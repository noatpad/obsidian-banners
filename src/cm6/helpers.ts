import { Facet } from "@codemirror/state";
import isEqual from "lodash/isEqual";

import { ISettingsOptions, PartialSettings } from "../Settings";

// Helper for facet combine functions
const combineSettings = (values: readonly ISettingsOptions[], keys: Array<keyof ISettingsOptions>): PartialSettings => {
  if (!values.length) { return null }
  return keys.reduce((acc, key) => {
    const val = values[0][key];
    // @ts-ignore
    acc[key] = val;
    return acc;
  }, {} as PartialSettings);
};

// Facet for settings that should update the banner view upon changing
const bannerDecorKeys: Array<keyof ISettingsOptions> = ['style', 'frontmatterField', 'bannerDragModifier'];
export const bannerDecorFacet = Facet.define<ISettingsOptions, PartialSettings>({
  combine: (settings) => combineSettings(settings, bannerDecorKeys),
  compare: (a, b) => isEqual(a, b)
});

// Facet for settings that should update the icon upon changing
const iconDecorKeys: Array<keyof ISettingsOptions> = ['iconHorizontalAlignment', 'iconHorizontalTransform', 'iconVerticalAlignment', 'iconVerticalTransform', 'useTwemoji'];
export const iconDecorFacet = Facet.define<ISettingsOptions, PartialSettings>({
  combine: (settings) => combineSettings(settings, iconDecorKeys),
  compare: (a, b) => isEqual(a, b)
});
