import { EditorState, StateField } from "@codemirror/state";
import { editorEditorField, editorInfoField } from "obsidian";
import Banner from "src/banner/Banner.svelte";
import { extractBannerData, isEqualBannerData } from "src/utils";
import { addBannerEffect, isBannerEffect, removeBannerEffect, updateBannerEffect } from "./utils";

const getBannerData = (state: EditorState): BannerMetadata => {
  const { file, frontmatterValid, rawFrontmatter } = state.field(editorInfoField);
  if (!file || !frontmatterValid) return extractBannerData();

  const frontmatter: Record<string, string> = {};
  for (const line of rawFrontmatter.split('\n').slice(1, -1)) {
    const pair = line.split(':');
    if (pair.length !== 2 || !pair[1]) continue;
    const [field, value] = pair;
    frontmatter[field.trim()] = value.trim();
  }
  return extractBannerData(frontmatter);
};

export const bannerMetadataField = StateField.define<BannerMetadata>({
  create(state) {
    return extractBannerData();
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    if (isBannerEffect(effects) || !transaction.docChanged) return prev;

    const bannerData = getBannerData(state);
    // if (!bannerData) return undefined;

    if (bannerData.src) {
      if (!prev.src) {
        console.log('add!', bannerData);
        state.update({ effects: [addBannerEffect.of(bannerData)] });
      } else if (!isEqualBannerData(bannerData, prev)) {
        console.log('update!', prev, bannerData);
        state.update({ effects: [updateBannerEffect.of(bannerData)] });
      }
    } else {
      console.log('remove!', prev);
      state.update({ effects: [removeBannerEffect.of(null) ]});
    }

    return bannerData;
  },
});

const addBanner = (state: EditorState, bannerData: BannerMetadata): Banner => {
  const { file } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const wrapper = document.createElement('div');

  wrapper.addClass('obsidian-banner-wrapper');
  wrapper.setCssStyles({ marginTop: '300px' });
  const banner = new Banner({
    target: wrapper,
    props: { bannerData, file }
  });
  dom.querySelector('.cm-sizer')?.prepend(wrapper);
  return banner;
};

const updateBanner = (banner: Banner, bannerData: BannerMetadata) => {
  if (!banner) return;
  banner.$set({ bannerData });
};

const removeBanner = (state: EditorState) => {
  const { dom } = state.field(editorEditorField);
  dom.querySelector('.obsidian-banner-wrapper')?.remove();
  return undefined;
};

// TODO: Fix banner when loading a note for the first time, switching notes, & switching back into Editing view
export const bannerField = StateField.define<number>({
  create(state) {
    // const bannerData = state.field(bannerMetadataField);
    // return bannerData?.src ? addBanner(state, bannerData) : undefined;
    return 0;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;
    console.log(now);
    for (const effect of effects) {
      if (effect.is(addBannerEffect)) {
        // now = addBanner(state, effect.value);
        now = 1;
        // console.log('add banner!', now);
      } else if (effect.is(updateBannerEffect)) {
        // updateBanner(now, effect.value);
        now = 2;
        // console.log('update banner!', now);
      } else if (effect.is(removeBannerEffect)) {
        // now = removeBanner(state);
        now = 3;
        // console.log('remove banner!', now);
      }
    }

    return now;
  },
});
