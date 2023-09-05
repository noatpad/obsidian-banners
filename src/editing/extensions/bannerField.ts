import { EditorState, StateField } from '@codemirror/state';
import { editorEditorField, editorInfoField } from 'obsidian';

import {
 assignBannerEffect,
 removeBannerEffect,
 setBannerInMap,
 upsertBannerEffect
} from './utils';

import Banner from 'src/banner/Banner.svelte';
import { getSetting } from 'src/settings';


const addBanner = (state: EditorState, bannerData: BannerMetadata): Banner => {
  const { file } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const wrapper = document.createElement('div');

  wrapper.addClass('obsidian-banner-wrapper');
  wrapper.setCssStyles({ height: `${getSetting('height')}px` });
  const banner = new Banner({
    target: wrapper,
    props: { ...bannerData, file: file! }
  });
  dom.querySelector('.cm-sizer')?.prepend(wrapper);

  setBannerInMap(state, banner);
  console.log('add!');
  return banner;
};

const updateBanner = (banner: Banner, bannerData: BannerMetadata): Banner => {
  banner.$set({ ...bannerData });
  console.log('update!');
  return banner;
};

const removeBanner = (banner: Banner | null = null, state: EditorState): null => {
  const { dom } = state.field(editorEditorField);
  banner?.$destroy();
  dom.querySelector('.obsidian-banner-wrapper')?.remove();
  setBannerInMap(state);
  console.log('remove!?');
  return null;
};

const assignBanner = (banner: Banner, state: EditorState): Banner => {
  const { file } = state.field(editorInfoField);
  banner.$set({ file: file! });
  console.log('assign!');
  return banner;
};

/* State field that keeps track of the banner associated with a given editor, as well as
adding, modifying, and removing banners based on CM6 effects */
const bannerField = StateField.define<Banner | null>({
  create() {
    console.log('create!');
    return null;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;

    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        now = now ? updateBanner(now, effect.value) : addBanner(state, effect.value);
      } else if (effect.is(removeBannerEffect)) {
        now = removeBanner(now, state);
      } else if (effect.is(assignBannerEffect)) {
        now = assignBanner(effect.value, state);
      }
    }

    return now;
  }
});

export default bannerField;
