import { EditorState, StateEffect, StateEffectType } from '@codemirror/state';
import { Notice, editorEditorField, editorInfoField } from 'obsidian';
import Banner from 'src/banner/Banner.svelte';
import { WRAPPER_CLASS } from 'src/banner/utils';

const SCROLLER_CLASS = 'cm-scroller';

export const leafBannerMap: Record<string, Banner> = {};

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

export const registerBanner = (state: EditorState, bannerData: BannerData) => {
  const { file, leaf } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);

  const wrapper = createDiv({ cls: WRAPPER_CLASS });
  const banner = new Banner({
    target: wrapper,
    props: {
      ...bannerData,
      viewType: 'editing',
      file: file!
    }
  });

  try {
    dom.querySelector(`.${SCROLLER_CLASS}`)!.prepend(wrapper);
    leafBannerMap[leaf.id] = banner;
  } catch (err) {
    new Notice('Unable to add a banner to the leaflet!');
    console.error(err);
  }
};

export const getBanner = (state: EditorState) => {
  const { id } = state.field(editorInfoField).leaf;
  return leafBannerMap[id];
};

export const destroyBanner = (state: EditorState) => {
  const { id } = state.field(editorInfoField).leaf;
  const { dom } = state.field(editorEditorField);

  const banner = leafBannerMap[id];
  banner?.$destroy();
  dom.querySelector(`.${WRAPPER_CLASS}`)?.remove();
  delete leafBannerMap[id];
};
