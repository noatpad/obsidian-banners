import { EditorState, StateEffect, Transaction } from '@codemirror/state';
import isEqual from 'lodash/isEqual';
import { editorInfoField } from 'obsidian';
import { extractBannerDataFromState, shouldDisplayBanner } from 'src/bannerData';
import bannerField from './bannerField';
import {
  assignBannerEffect,
  getBanner,
  hasEffect,
  openNoteEffect,
  refreshEffect,
  removeBannerEffect,
  upsertBannerEffect
} from './utils';

// Get an upsert/remove effect depending if banner data should be displayed
const getEffectFromData = (state: EditorState): StateEffect<unknown> => {
  const bannerData = extractBannerDataFromState(state);
  return shouldDisplayBanner(bannerData)
    ? upsertBannerEffect.of(bannerData)
    : removeBannerEffect.of(null);
};

// Helper to check if banner data change between transactions
const didBannerDataChange = (transaction: Transaction): boolean => {
  const { docChanged, state } = transaction;
  if (!docChanged) return false;

  const prev = state.field(bannerField);
  const current = extractBannerDataFromState(state);
  return !isEqual(prev, current);
};

/* Transaction extender that essentially is in charge of sending banner-related
effects to `bannerField` */
const bannerExtender = EditorState.transactionExtender.of((transaction) => {
  const { effects, state } = transaction;

  // Only run on Markdown panes (skips Canvas views)
  if (state.field(editorInfoField).leaf === undefined) return null;

  if (hasEffect(effects, openNoteEffect)) {
    console.log('open note!');
    const newEffects = [];
    if (getBanner(state)) newEffects.push(assignBannerEffect.of(null));
    newEffects.push(getEffectFromData(state));
    return { effects: newEffects };
  } else if (hasEffect(effects, refreshEffect) || didBannerDataChange(transaction)) {
    return { effects: getEffectFromData(state) };
  }

  return null;
});

export default bannerExtender;
