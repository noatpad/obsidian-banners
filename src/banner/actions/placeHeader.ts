import type { Action } from 'svelte/action';
import type {
  HeaderHorizontalAlignmentOption,
  HeaderVerticalAlignmentOption,
  LengthValue
} from 'src/settings/structure';

export interface PlaceParams {
  placement: {
    horizontal: HeaderHorizontalAlignmentOption;
    hTransform: LengthValue;
    vertical: HeaderVerticalAlignmentOption;
    vTransform: LengthValue;
  };
  height: number;
  withBanner: boolean;
}

const placeHeader: Action<HTMLElement, PlaceParams> = (el, params) => {
  let { placement, height, withBanner } = params;

  const applyTransform = () => {
    const {
      horizontal,
      hTransform,
      vertical,
      vTransform
    } = placement;

    if (horizontal !== 'custom' && vertical !== 'custom') {
      el.setCssStyles({ transform: '' });
    } else {
      const h = (horizontal === 'custom') ? hTransform : '0px';
      const v = (vertical === 'custom') ? vTransform : '0px';
      el.setCssStyles({ transform: `translate(${h}, ${v})` });
    }
  };

  const applyMargin = () => {
    const { vertical } = placement;

    if (!withBanner) return el.setCssStyles({ marginTop: '' });
    switch (vertical) {
      case 'edge': return el.setCssStyles({ marginTop: `-${height / 2}px` });
      case 'above':
      case 'custom': return el.setCssStyles({ marginTop: `-${height}px` });
      default: return el.setCssStyles({ marginTop: '' });
    }
  };

  applyTransform();
  applyMargin();

  return {
    update(params) {
      placement = params.placement;
      height = params.height;
      withBanner = params.withBanner;

      applyTransform();
      applyMargin();
    }
  };
};

export default placeHeader;
