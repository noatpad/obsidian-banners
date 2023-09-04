import { editorInfoField } from "obsidian";
import { EditorState } from "@codemirror/state";
import Banner from "src/banner/Banner.svelte";
import { extractBannerData } from "src/utils";
import { assignBannerEffect, hasEffect, isBannerEffect, leafBannerMap, openNoteEffect, removeBannerEffect, upsertBannerEffect } from "./utils";

// Helper function to get the banner data from a raw frontmatter string
const parseBannerFrontmatter = (state: EditorState): BannerMetadata => {
  const { file, frontmatterValid, rawFrontmatter } = state.field(editorInfoField);
  if (!file || !frontmatterValid) return extractBannerData();

  const frontmatter: Record<string, string> = {};
  for (const line of rawFrontmatter.split('\n').slice(1, -1)) {
    const pair = line.split(':');
    if (pair.length < 2 || !pair[1]) continue;
    const [field, ...rest] = pair;
    const value = rest.join(':');
    frontmatter[field.trim()] = value.trim();
  }
  return extractBannerData(frontmatter);
};

/**
 * Transaction extender that essentially is in charge of sending banner-related effects to `bannerField`
 */
const bannerExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  const bannerData = parseBannerFrontmatter(state);

  if (hasEffect(effects, openNoteEffect)) {
    console.log('open note!');
    const { leaf } = state.field(editorInfoField);
    const upsertEffect = upsertBannerEffect.of(bannerData);
    const effects = leafBannerMap[leaf.id] ? [assignBannerEffect.of(leafBannerMap[leaf.id]), upsertEffect] : [upsertEffect];
    return { effects };
  } else if (!isBannerEffect(effects) && docChanged) {
    return {
      effects: bannerData.source ? upsertBannerEffect.of(bannerData) : removeBannerEffect.of(null)
    };
  }

  return null;
});

export default bannerExtender;
