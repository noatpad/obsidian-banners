import { StateEffect } from "@codemirror/state";

export const addBannerEffect = StateEffect.define<BannerMetadata>();
export const updateBannerEffect = StateEffect.define<BannerMetadata>();
export const removeBannerEffect = StateEffect.define();
const bannerEffects = [addBannerEffect, updateBannerEffect, removeBannerEffect];

export const isBannerEffect = (effects: readonly StateEffect<any>[]) => (
  effects.some((e) => bannerEffects.some((b) => e.is(b)))
);
