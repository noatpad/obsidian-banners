import type { Action } from 'svelte/action';
import type { HeaderVerticalAlignmentOption } from 'src/settings/structure';

export interface ActionParams {
  vertical: HeaderVerticalAlignmentOption;
  height: number;
  withBanner: boolean;
}

const sizedMargin: Action<HTMLElement, ActionParams> = (el, params) => {
  let { vertical, height, withBanner } = params;

  const applyMargin = () => {
    if (!withBanner) return el.setCssStyles({ marginTop: '' });
    switch (vertical) {
      case 'edge': return el.setCssStyles({ marginTop: `-${height / 2}px` });
      case 'above':
      case 'custom': return el.setCssStyles({ marginTop: `-${height}px` });
      default: return el.setCssStyles({ marginTop: '' });
    }
  };

  applyMargin();

  return {
    update(params) {
      vertical = params.vertical;
      height = params.height;
      withBanner = params.withBanner;

      applyMargin();
    }
  };
};

export default sizedMargin;
