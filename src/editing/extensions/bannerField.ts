import { StateField } from '@codemirror/state';
import { editorInfoField } from 'obsidian';
import {
  assignBannerEffect,
  destroyBanner,
  getBanner,
  registerBanner,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

/* State field that keeps track of the banner associated with a given editor, as well as
adding, modifying, and removing banners based on CM6 effects */
const bannerField = StateField.define<BannerData | null>({
  create() {
    console.log('create!');
    return null;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;

    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        const banner = getBanner(state);
        if (banner) {
          banner.$set(effect.value);
        } else {
          registerBanner(state, effect.value);
        }
        now = effect.value;
      } else if (effect.is(removeBannerEffect)) {
        destroyBanner(state);
        now = null;
      } else if (effect.is(assignBannerEffect)) {
        const { file } = state.field(editorInfoField);
        getBanner(state).$set({ file: file! });
      }
    }

    return now;
  }
});

export default bannerField;
