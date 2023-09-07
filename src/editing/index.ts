import { plug } from 'src/main';
import { getSetting } from 'src/settings';
import type { MarkdownViewState } from 'src/types';
import {
  doesLeafHaveMarkdownMode,
  iterateMarkdownLeaves,
  registerSettingChangeEvent
} from 'src/utils';
import bannerExtender from './extensions/bannerExtender';
import bannerField from './extensions/bannerField';
import {
  leafBannerMap,
  openNoteEffect,
  refreshEffect,
  removeBannerEffect
} from './extensions/utils';

export const loadExtensions = () => {
  plug.registerEditorExtension([bannerExtender, bannerField]);

  // Properly insert a banner upon loading the banner
  iterateMarkdownLeaves((leaf) => {
    leaf.view.editor.cm.dispatch({ effects: openNoteEffect.of(null) });
  }, 'editing');
};

export const registerEditorBannerEvents = () => {
  registerSettingChangeEvent('frontmatterField', () => {
    iterateMarkdownLeaves((leaf) => {
      leaf.view.editor.cm.dispatch({ effects: refreshEffect.of(null) });
    }, 'editing');
  });

  // TODO: Use the new `registerSettingChangeEvent` + new effect for this
  // Resize banner wrapper
  registerSettingChangeEvent('height', () => {
    iterateMarkdownLeaves((leaf) => {
      leaf.containerEl.querySelector<HTMLElement>('.obsidian-banner-wrapper')!
        .setCssStyles({ height: `${getSetting('height')}px` });
    }, 'editing');
  });

  /* Remove unused banners when switching to reading view,
    as well as assign the correct banners when opening/switching notes in an editor */
  plug.registerEvent(
    plug.app.workspace.on('layout-change', () => {
      plug.app.workspace.iterateRootLeaves((leaf) => {
        const { id, view } = leaf;
        if (doesLeafHaveMarkdownMode(leaf)) {
          const { mode } = (leaf.getViewState() as MarkdownViewState).state;
          const effects = mode === 'source'
            ? openNoteEffect.of(leafBannerMap[id])
            : removeBannerEffect.of(null);
          view.editor.cm.dispatch({ effects });
        } else if (leafBannerMap[id]) {
          // When switching to a view where the editor isn't available, remove the banner manually
          leafBannerMap[id].$destroy();
          delete leafBannerMap[id];
        }
      });
    })
  );
};

export const unloadEditingViewBanners = () => {
  for (const banner of Object.values(leafBannerMap)) {
    banner?.$destroy();
  }
  document.querySelectorAll('.obsidian-banner-wrapper').forEach((el) => el.remove());
};
