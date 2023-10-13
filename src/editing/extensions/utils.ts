import { StateEffect, StateEffectType } from '@codemirror/state';

export const refreshEffect = StateEffect.define();
export const openNoteEffect = StateEffect.define();
export const upsertBannerEffect = StateEffect.define<BannerData>();
export const removeBannerEffect = StateEffect.define();
export const assignBannerEffect = StateEffect.define();

export const hasEffect = (
  effects: readonly StateEffect<any>[],
  target: StateEffectType<any> | StateEffectType<any>[]
): boolean => (
  Array.isArray(target)
    ? target.some((t) => hasEffect(effects, t))
    : effects.some((e) => e.is(target))
);
