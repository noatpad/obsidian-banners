import { EditorState, StateField } from '@codemirror/state';
import { editorEditorField, editorInfoField } from 'obsidian';
import {
  createBanner,
  hasBanner,
  updateBanner,
  destroyBanner
} from 'src/banner';
import type { BannerProps } from 'src/banner';
import { assignBannerEffect, removeBannerEffect, upsertBannerEffect } from './utils';

const SCROLLER_CLASS = 'cm-scroller';

const upsertBannerFromState = (state: EditorState, bannerData: BannerData) => {
  const { file, leaf } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const props: BannerProps = {
    ...bannerData,
    viewType: 'editing',
    file: file!
  };

  if (hasBanner(leaf.id)) {
    updateBanner(props, leaf.id);
  } else {
    const el = dom.querySelector<HTMLElement>(`.${SCROLLER_CLASS}`)!;
    createBanner(props, el, leaf.id);
  }
};

const destroyBannerFromState = (state: EditorState) => {
  const { leaf } = state.field(editorInfoField);
  destroyBanner(leaf.id);
};

const assignBannerFromState = (state: EditorState) => {
  const { file, leaf } = state.field(editorInfoField);
  updateBanner({ file: file! }, leaf.id);
};

/* State field that keeps track of the banner associated with a given editor, as well as
adding, modifying, and removing banners based on CM6 effects */
const bannerField = StateField.define<BannerData | null>({
  create() { return null; },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;

    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        upsertBannerFromState(state, effect.value);
        now = effect.value;
      } else if (effect.is(removeBannerEffect)) {
        destroyBannerFromState(state);
        now = null;
      } else if (effect.is(assignBannerEffect)) {
        assignBannerFromState(state);
      }
    }

    return now;
  }
});

export default bannerField;
