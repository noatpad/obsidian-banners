import { editorEditorField, editorInfoField } from "obsidian";
import { EditorState, StateField } from "@codemirror/state";
import Banner from "src/banner/Banner.svelte";
import { extractBannerData } from "src/utils";
import { assignBannerEffect, isBannerEffect, openNoteEffect, removeBannerEffect, upsertBannerEffect } from "./utils";
import { plug } from "src/main";

const leafBannerMap: Record<string, Maybe<Banner>> = {};

const getBannerData = (state: EditorState): BannerMetadata => {
  const { file, frontmatterValid, rawFrontmatter } = state.field(editorInfoField);
  if (!file || !frontmatterValid) return extractBannerData();

  const frontmatter: Record<string, string> = {};
  for (const line of rawFrontmatter.split('\n').slice(1, -1)) {
    const pair = line.split(':');
    if (pair.length < 2 || !pair[1]) continue;
    const [field, ...rest] = pair;
    const value = rest.join(':');
    frontmatter[field.trim()] = value.trim();
  }
  return extractBannerData(frontmatter);
};

export const bannerMetadataExtender = EditorState.transactionExtender.of((transaction) => {
  const { docChanged, effects, state } = transaction;
  const bannerData = getBannerData(state);

  if (effects.some((e) => e.is(openNoteEffect))) {
    console.log('open note!');
    const { leaf } = state.field(editorInfoField);
    const upsertEffect = upsertBannerEffect.of(bannerData);
    const effects = leafBannerMap[leaf.id] ? [assignBannerEffect.of(leafBannerMap[leaf.id] as Banner), upsertEffect] : [upsertEffect];
    return { effects };
  } else if (!isBannerEffect(effects) && docChanged) {
    return {
      effects: bannerData.src ? upsertBannerEffect.of(bannerData) : removeBannerEffect.of(null)
    };
  }

  return null;
});

const setBannerInMap = (state: EditorState, banner?: Maybe<Banner>) => {
  const { leaf } = state.field(editorInfoField);
  leafBannerMap[leaf.id] = banner;
}

const addBanner = (state: EditorState, bannerData: BannerMetadata): Banner => {
  const { file } = state.field(editorInfoField);
  const { dom } = state.field(editorEditorField);
  const wrapper = document.createElement('div');

  wrapper.addClass('obsidian-banner-wrapper');
  wrapper.setCssStyles({ marginTop: '300px' });
  const banner = new Banner({
    target: wrapper,
    props: { bannerData, file }
  });
  dom.querySelector('.cm-sizer')?.prepend(wrapper);
  setBannerInMap(state, banner);
  return banner;
};

const updateBanner = (banner: Banner, bannerData: BannerMetadata) => {
  banner.$set({ bannerData });
};

const removeBanner = (state: EditorState) => {
  const { dom } = state.field(editorEditorField);
  dom.querySelector('.obsidian-banner-wrapper')?.remove();
  setBannerInMap(state);
  return undefined;
};

/* TODO: Fix banner spacing when switching into the Editing view
- Reading -> Editing
- Editing -> Reading -> Editing */
// TODO: Fix banner in Editing View when switching files in a linked Reading view
export const bannerField = StateField.define<Maybe<Banner>>({
  create() {
    console.log('create!');
    return undefined;
  },
  update(prev, transaction) {
    const { effects, state } = transaction;
    let now = prev;
    for (const effect of effects) {
      if (effect.is(upsertBannerEffect)) {
        if (now) {
          updateBanner(now, effect.value);
          console.log('update!');
        } else {
          now = addBanner(state, effect.value);
          console.log('add!');
        }
      } else if (effect.is(removeBannerEffect)) {
        now = removeBanner(state);
        console.log('remove!');
      } else if (effect.is(assignBannerEffect)) {
        console.log('assign!');
        now = effect.value;
      }
    }

    return now;
  },
});

export const loadEditingViewListeners = () => {
  plug.registerEvent(
    plug.app.workspace.on('active-leaf-change', () => {
      plug.app.workspace.iterateRootLeaves((leaf) => {
        const { currentMode } = leaf.view;
        if (currentMode.type === 'preview') return;

        const { cm } = currentMode.editor;
        cm.dispatch({ effects: openNoteEffect.of(leafBannerMap[leaf.id]) });
      });
    })
  );
}
