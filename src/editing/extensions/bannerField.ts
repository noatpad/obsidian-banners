import { EditorState, StateField } from '@codemirror/state';
import { editorEditorField, editorInfoField } from 'obsidian';
import Banner from 'src/banner/Banner.svelte';
import { WRAPPER_CLASS } from 'src/banner/utils';
import { BANNER_WRITE_KEYS } from 'src/bannerData';
import {
  assignBannerEffect,
  removeBannerEffect,
  setBannerInMap,
  upsertBannerEffect
} from './utils';

const addBanner = (state: EditorState, bannerData: Partial<BannerMetadata>): Banner => {
  console.log('add!');
  const { file } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const wrapper = document.createElement('div');

  wrapper.addClass(WRAPPER_CLASS);
  const banner = new Banner({
    target: wrapper,
    props: {
      ...bannerData,
      viewType: 'editing',
      file: file!,
      sizerEl: wrapper
    }
  });
  dom.querySelector('.cm-sizer')?.prepend(wrapper);

  setBannerInMap(state, banner);
  return banner;
};

const updateBanner = (banner: Banner, bannerData: Partial<BannerMetadata>): Banner => {
  console.log('update!');
  const data = BANNER_WRITE_KEYS.reduce((accum, key) => {
    accum[key] = bannerData[key];
    return accum;
  }, {} as Record<string, unknown>);
  banner.$set(data);
  return banner;
};

const removeBanner = (banner: Banner | null = null, state: EditorState): null => {
  console.log('remove!?');
  const { dom } = state.field(editorEditorField);
  banner?.$destroy();
  dom.querySelector(`.${WRAPPER_CLASS}`)?.remove();
  setBannerInMap(state);
  return null;
};

const assignBanner = (banner: Banner, state: EditorState): Banner => {
  console.log('assign!');
  const { file } = state.field(editorInfoField);
  banner.$set({ file: file! });
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
