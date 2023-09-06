import { EditorState, StateEffect } from '@codemirror/state';
import { editorInfoField, parseYaml } from 'obsidian';
import { extractBannerData } from 'src/utils';
import {
  assignBannerEffect,
  hasEffect,
  isBannerEffect,
  leafBannerMap,
  openNoteEffect,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

// Helper function to get the banner data from a raw frontmatter string
const parseBannerFrontmatter = (state: EditorState): BannerMetadata => {
  const { rawFrontmatter } = state.field(editorInfoField);
  const frontmatter = parseYaml(rawFrontmatter);
  return extractBannerData(frontmatter);
};

/* Transaction extender that essentially is in charge of sending banner-related
effects to `bannerField` */
const bannerExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  if (isBannerEffect(effects)) return null;

  const bannerData = parseBannerFrontmatter(state);
  const effectFromData = bannerData.source
    ? upsertBannerEffect.of(bannerData)
    : removeBannerEffect.of(null);
  const newEffects: StateEffect<any>[] = [];
  if (hasEffect(effects, openNoteEffect)) {
    console.log('open note!');
    const { leaf } = state.field(editorInfoField);
    const banner = leafBannerMap[leaf.id];
    if (banner) newEffects.push(assignBannerEffect.of(banner));
    newEffects.push(effectFromData);
  } else if (docChanged) {
    newEffects.push(effectFromData);
  }

  return { effects: newEffects };
});

export default bannerExtender;
