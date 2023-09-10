import { EditorState, StateEffect } from '@codemirror/state';
import { editorInfoField } from 'obsidian';
import { extractBannerDataFromState } from 'src/bannerData';
import {
  assignBannerEffect,
  hasEffect,
  isBannerEffect,
  leafBannerMap,
  openNoteEffect,
  refreshEffect,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

/* Transaction extender that essentially is in charge of sending banner-related
effects to `bannerField` */
const bannerExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  if (isBannerEffect(effects)) return null;

  const bannerData = extractBannerDataFromState(state);
  const newEffects: StateEffect<any>[] = [];
  const effectFromData = (bannerData.source || bannerData.icon)
    ? upsertBannerEffect.of(bannerData)
    : removeBannerEffect.of(null);
  if (hasEffect(effects, openNoteEffect)) {
    console.log('open note!');
    const { leaf } = state.field(editorInfoField);
    const banner = leafBannerMap[leaf.id];
    if (banner) newEffects.push(assignBannerEffect.of(banner));
    newEffects.push(effectFromData);
  } else if (hasEffect(effects, refreshEffect) || docChanged) {
    newEffects.push(effectFromData);
  }

  return { effects: newEffects };
});

export default bannerExtender;
