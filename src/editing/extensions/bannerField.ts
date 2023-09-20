import { EditorState, StateField } from '@codemirror/state';
import { editorEditorField, editorInfoField } from 'obsidian';
import Banner from 'src/banner/Banner.svelte';
import { WRAPPER_CLASS } from 'src/banner/utils';
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

  registerBanner(state, banner);
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
