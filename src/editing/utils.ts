import { StateEffect, StateEffectType } from "@codemirror/state";
import type Banner from "src/banner/Banner.svelte";

export const openNoteEffect = StateEffect.define<Maybe<Banner>>();

export const upsertBannerEffect = StateEffect.define<BannerMetadata>();
export const removeBannerEffect = StateEffect.define();
export const assignBannerEffect = StateEffect.define<Banner>();
const bannerEffects = [upsertBannerEffect, removeBannerEffect, openNoteEffect];

export const isBannerEffect = (effects: readonly StateEffect<any>[]) => (
  effects.some((e) => bannerEffects.some((b) => e.is(b as StateEffectType<any>)))
);
