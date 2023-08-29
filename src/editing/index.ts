import { EditorState, StateField } from "@codemirror/state";
import { editorEditorField, editorInfoField } from "obsidian";
import Banner from "src/banner/Banner.svelte";
import { extractBannerData } from "src/utils";
import { isBannerEffect, removeBannerEffect, upsertBannerEffect } from "./utils";

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

export const bannerMetadataExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  if (isBannerEffect(effects) || !docChanged) return null;

  const bannerData = getBannerData(state);
  return {
    effects: bannerData.src ? upsertBannerEffect.of(bannerData) : removeBannerEffect.of(null)
  };
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
  banner.$set({ bannerData });
};

const removeBanner = (state: EditorState) => {
  const { dom } = state.field(editorEditorField);
  dom.querySelector('.obsidian-banner-wrapper')?.remove();
  return undefined;
};

// TODO: Fix banner when loading a note for the first time, switching notes, & switching back into Editing view
export const bannerField = StateField.define<Maybe<Banner>>({
  create() {
    return undefined;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;
    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        if (now) {
          updateBanner(now, effect.value);
        } else {
          now = addBanner(state, effect.value);
        }
      } else if (effect.is(removeBannerEffect)) {
        now = removeBanner(state);
      }
    }

    return now;
  },
});
