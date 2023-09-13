import { EditorState, StateEffect, StateEffectType } from '@codemirror/state';
import { editorInfoField } from 'obsidian';
import type Banner from 'src/banner/Banner.svelte';

export const leafBannerMap: Record<string, Banner> = {};

export const refreshEffect = StateEffect.define();
export const openNoteEffect = StateEffect.define<Banner | null>();
export const upsertBannerEffect = StateEffect.define<Partial<BannerMetadata>>();
export const removeBannerEffect = StateEffect.define();
export const assignBannerEffect = StateEffect.define<Banner>();
const bannerEffects = [
  upsertBannerEffect,
  removeBannerEffect,
  assignBannerEffect
];

export const hasEffect = (
  effects: readonly StateEffect<any>[],
  target: StateEffectType<any> | StateEffectType<any>[]
): boolean => (
  Array.isArray(target)
    ? target.some((t) => hasEffect(effects, t))
    : effects.some((e) => e.is(target))
);

export const isBannerEffect = (effects: readonly StateEffect<any>[]) => (
  hasEffect(effects, bannerEffects)
);

export const setBannerInMap = (state: EditorState, banner?: Banner) => {
  const { leaf } = state.field(editorInfoField);
  if (banner) {
    leafBannerMap[leaf.id] = banner;
  } else {
    delete leafBannerMap[leaf.id];
  }
};
