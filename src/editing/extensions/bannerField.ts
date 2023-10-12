import { EditorState, StateField } from '@codemirror/state';
import { editorInfoField } from 'obsidian';
import Banner from 'src/banner/Banner.svelte';
import {
  assignBannerEffect,
  destroyBanner,
  getBanner,
  registerBanner,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

const addBanner = (state: EditorState, bannerData: BannerData) => {
  console.log('add!');
  registerBanner(state, bannerData);
};

const updateBanner = (banner: Banner, bannerData: BannerData) => {
  console.log('update!');
  banner.$set(bannerData);
};

const removeBanner = (state: EditorState) => {
  console.log('remove!?');
  destroyBanner(state);
};

const assignBanner = (state: EditorState) => {
  console.log('assign!');
  const { file } = state.field(editorInfoField);
  getBanner(state).$set({ file: file! });
};

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
          updateBanner(banner, effect.value);
        } else {
          addBanner(state, effect.value);
        }
        now = effect.value;
      } else if (effect.is(removeBannerEffect)) {
        removeBanner(state);
        now = null;
      } else if (effect.is(assignBannerEffect)) {
        assignBanner(state);
      }
    }

    return now;
  }
});

export default bannerField;
