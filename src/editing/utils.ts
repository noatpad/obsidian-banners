import { StateEffect } from "@codemirror/state";

export const upsertBannerEffect = StateEffect.define<BannerMetadata>();
export const removeBannerEffect = StateEffect.define();
const bannerEffects = [upsertBannerEffect, removeBannerEffect];

export const isBannerEffect = (effects: readonly StateEffect<any>[]) => (
  effects.some((e) => bannerEffects.some((b) => e.is(b)))
);
