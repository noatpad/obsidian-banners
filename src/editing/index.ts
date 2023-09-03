import { plug } from "src/main";
import bannerField from "./extensions/bannerField";
import bannerExtender from "./extensions/bannerExtender";
import { leafBannerMap, openNoteEffect, removeBannerEffect } from "./extensions/utils";
import { doesLeafHaveMarkdownMode, registerEvents } from "src/utils";
import type { MarkdownViewState } from "src/types";

export const loadExtensions = () => {
  plug.registerEditorExtension([
    bannerExtender,
    bannerField
  ]);

  // Properly insert a banner upon loading the banner
  plug.app.workspace.iterateRootLeaves((leaf) => {
    if (doesLeafHaveMarkdownMode(leaf, 'editing')) {
      leaf.view.editor.cm.dispatch({ effects: openNoteEffect.of(null) });
    }
  });
}

export const registerEditorBannerEvents = () => {
  registerEvents([
    /** Listener used to remove unused banners when switching to reading view,
     * as well as to assign the correct banners when opening/switching notes in an editor
     */
    plug.app.workspace.on('layout-change', () => {
      plug.app.workspace.iterateRootLeaves((leaf) => {
        const { id, view } = leaf;
        if (doesLeafHaveMarkdownMode(leaf)) {
          const { mode } = (leaf.getViewState() as MarkdownViewState).state;
          const effect = (mode === 'source') ? openNoteEffect.of(leafBannerMap[id]) : removeBannerEffect.of(null);
          view.editor.cm.dispatch({ effects: effect });
        } else if (leafBannerMap[id]) {   // When switching to a view where the editor isn't available, remove the banner manually
          leafBannerMap[id].$destroy();
          delete leafBannerMap[id];
        }
      });
    })
  ]);
}

export const unloadEditingViewBanners = () => {
  for (const banner of Object.values(leafBannerMap)) {
    banner?.$destroy();
  }
  document.querySelectorAll('.obsidian-banner-wrapper').forEach((el) => el.remove());
}
