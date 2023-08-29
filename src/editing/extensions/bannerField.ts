import { TFile, editorEditorField, editorInfoField } from "obsidian";
import { EditorState, StateField } from "@codemirror/state";
import Banner from "src/banner/Banner.svelte";
import { assignBannerEffect, removeBannerEffect, setBannerInMap, upsertBannerEffect } from "./utils";

const addBanner = (state: EditorState, bannerData: BannerMetadata): Banner => {
  const { file } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const wrapper = document.createElement('div');

  wrapper.addClass('obsidian-banner-wrapper');
  wrapper.setCssStyles({ marginTop: '300px' });
  const banner = new Banner({
    target: wrapper,
    props: { bannerData, file: file as TFile }
  });
  dom.querySelector('.cm-sizer')?.prepend(wrapper);

  setBannerInMap(state, banner);
  console.log('add!');
  return banner;
};

const updateBanner = (banner: Banner, bannerData: BannerMetadata): Banner => {
  banner.$set({ bannerData });
  console.log('update!');
  return banner;
};

const removeBanner = (state: EditorState) => {
  const { dom } = state.field(editorEditorField);
  dom.querySelector('.obsidian-banner-wrapper')?.remove();
  setBannerInMap(state);
  console.log('remove!?');
  return undefined;
};

const assignBanner = (banner: Banner): Banner => {
  console.log('assign!');
  return banner;
};

/**
 * State field that keeps track of the banner associated with a given editor, as well as adding, modifying,
 * and removing banners based on CM6 effects
 */
/* TODO: Fix banner spacing when switching into the Editing view
- Reading -> Editing
- Editing -> Reading -> Editing */
// TODO: Fix banner in Editing View when switching files in a linked Reading view
const bannerField = StateField.define<Maybe<Banner>>({
  create() {
    console.log('create!');
    return undefined;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;

    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        now = now ? updateBanner(now, effect.value) : addBanner(state, effect.value);
      } else if (effect.is(removeBannerEffect)) {
        now = removeBanner(state);
      } else if (effect.is(assignBannerEffect)) {
        now = assignBanner(effect.value);
      }
    }

    return now;
  },
});

export default bannerField;
