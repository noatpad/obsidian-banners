import { plug } from "src/main";
import bannerField from "./extensions/bannerField";
import bannerExtender from "./extensions/bannerExtender";
import { leafBannerMap, openNoteEffect } from "./extensions/utils";

export const loadEditingViewListeners = () => {
  // Assign banners when opening/switching notes in an editor
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

export {
  bannerField,
  bannerExtender
};
