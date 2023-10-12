import type { Action } from 'svelte/action';
import { getSetting } from 'src/settings';
import type {
  BannerSettings,
  HeaderHorizontalAlignmentOption,
  HeaderVerticalAlignmentOption
} from 'src/settings/structure';

interface PlaceParams {
  settings: BannerSettings;
  height: number;
  withBanner: boolean;
}

const placeHeader: Action<HTMLElement, PlaceParams> = (el, params) => {
  let { settings, height, withBanner } = params;
  let horizontal: HeaderHorizontalAlignmentOption;
  let hTransform: string;
  let vertical: HeaderVerticalAlignmentOption;
  let vTransform: string;

  const setValues = () => {
    horizontal = getSetting('headerHorizontalAlignment', settings.headerHorizontalAlignment);
    hTransform = getSetting('headerHorizontalTransform', settings.headerHorizontalTransform);
    vertical = getSetting('headerVerticalAlignment', settings.headerVerticalAlignment);
    vTransform = getSetting('headerVerticalTransform', settings.headerVerticalTransform);
  };

  const applyTransform = () => {
    if (horizontal !== 'custom' && vertical !== 'custom') {
      el.setCssStyles({ transform: '' });
    } else {
      const h = (horizontal === 'custom') ? hTransform : '0px';
      const v = (vertical === 'custom') ? vTransform : '0px';
      el.setCssStyles({ transform: `translate(${h}, ${v})` });
    }
  };

  const applyMargin = () => {
    if (!withBanner) return el.setCssStyles({ marginTop: '' });
    switch (vertical) {
      case 'edge': return el.setCssStyles({ marginTop: `-${height / 2}px` });
      case 'above':
      case 'custom': return el.setCssStyles({ marginTop: `-${height}px` });
      default: return el.setCssStyles({ marginTop: '' });
    }
  };

  setValues();
  applyTransform();
  applyMargin();

  return {
    update(params) {
      settings = params.settings;
      height = params.height;
      withBanner = params.withBanner;

      setValues();
      applyTransform();
      applyMargin();
    }
  };
};

export default placeHeader;
