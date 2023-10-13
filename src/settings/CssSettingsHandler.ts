import { registerSettingChangeEvent } from 'src/utils';
import type { BannerSettings } from './structure';
import { getSetting, parseCssSetting } from '.';

interface CssSettingToVar {
  keys: keyof BannerSettings | Array<keyof BannerSettings>;
  suffix: string;
  process?: () => string;
}

const BANNERS_VAR_PREFIX = '--banners';
const CSS_VAR_SETTINGS_LIST: CssSettingToVar[] = [
  { keys: 'height', suffix: 'height' },
  { keys: 'mobileHeight', suffix: 'mobile-height' },
  { keys: 'internalEmbedHeight', suffix: 'internal-embed-height' },
  { keys: 'popoverHeight', suffix: 'popover-height' },
  { keys: 'headerSize', suffix: 'header-font-size' },
  { keys: 'iconSize', suffix: 'icon-font-size' },
  {
    keys: [
      'headerHorizontalAlignment',
      'headerHorizontalTransform',
      'headerVerticalAlignment',
      'headerVerticalTransform'
    ],
    suffix: 'header-transform',
    process: () => {
      const horizontal = getSetting('headerHorizontalAlignment');
      const hTransform = getSetting('headerHorizontalTransform');
      const vertical = getSetting('headerVerticalAlignment');
      const vTransform = getSetting('headerVerticalTransform');
      const h = (horizontal === 'custom') ? hTransform : '0px';
      const v = (vertical === 'custom') ? vTransform : '0px';
      return `translate(${h}, ${v})`;
    }
  }
];

const setCssVars = () => {
  for (const { keys, suffix, process } of CSS_VAR_SETTINGS_LIST) {
    const value = process
      ? process()
      : parseCssSetting(getSetting(Array.isArray(keys) ? keys[0] : keys) as string);
    document.body.style.setProperty(`${BANNERS_VAR_PREFIX}-${suffix}`, value);
  }
};

export const unsetCssVars = () => {
  for (const { suffix } of CSS_VAR_SETTINGS_LIST) {
    document.body.style.removeProperty(`${BANNERS_VAR_PREFIX}-${suffix}`);
  }
};

export const prepareCssSettingListener = () => {
  const settings = CSS_VAR_SETTINGS_LIST.map((s) => s.keys).flat();
  registerSettingChangeEvent(settings, setCssVars);
  setCssVars();
};
