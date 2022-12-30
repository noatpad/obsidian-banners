import { editorViewField } from 'obsidian';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';

import BannersPlugin from '../main';
import BannerWidget from './BannerWidget';
import SpacerWidget from './SpacerWidget';
import HeaderWidget from './HeaderWidget';
import { bannerDecorFacet, iconDecorFacet } from './helpers';

const YAML_SEPARATOR_TOKEN = 'def_hmd-frontmatter';
const YAML_DEF_NAME_TOKEN = 'atom_hmd-frontmatter';
const YAML_DEF_STR_TOKEN = 'hmd-frontmatter_string';
const YAML_DEF_VAL_TOKENS = ['hmd-frontmatter', 'hmd-frontmatter_number', 'hmd-frontmatter_keyword', YAML_DEF_STR_TOKEN];

const getViewPlugin = (plugin: BannersPlugin) => ViewPlugin.fromClass(class BannerPV implements PluginValue {
  decor: DecorationSet;

  constructor(view: EditorView) {
    this.decor = this.decorate(view.state);
  }

  update(_update: ViewUpdate) {
    const { docChanged, view, state, startState } = _update;
    if (docChanged || state.facet(bannerDecorFacet) !== startState.facet(bannerDecorFacet) || state.facet(iconDecorFacet) !== startState.facet(iconDecorFacet)) {
      this.decor = this.decorate(view.state);
    }
  }

  decorate(state: EditorState): DecorationSet {
    // If there's no YAML, stop here
    const cursor = syntaxTree(state).cursor();
    cursor.firstChild();
    if (cursor.name !== YAML_SEPARATOR_TOKEN) { return Decoration.none }

    // Get all frontmatter fields to later process
    const frontmatter: { [key: string]: string } = {};
    let key;
    while (cursor.nextSibling() && cursor.name !== YAML_SEPARATOR_TOKEN) {
      const { from, to, name } = cursor;
      if (name === YAML_DEF_NAME_TOKEN) {
        key = state.sliceDoc(from, to);
      } else if (YAML_DEF_VAL_TOKENS.includes(name) && !frontmatter[key]) {
        const isStr = name === YAML_DEF_STR_TOKEN;
        const val = state.sliceDoc(from + (isStr ? 1 : 0), to - (isStr ? 1 : 0));
        frontmatter[key] = val;
      }
    };

    const bannerData = plugin.metaManager.getBannerData(frontmatter);
    const { src, icon, title } = bannerData;
    const { contentEl, file } = state.field(editorViewField);
    const widgets: Decoration[] = [];

    // Add banner widgets if applicable
    if (src) {
      const settingsFacet = state.facet(bannerDecorFacet);
      contentEl.getElementsByClassName("inline-title")[0].classList.add("hide")
      widgets.push(
        Decoration.widget({ widget: new BannerWidget(plugin, bannerData, file.path, contentEl, settingsFacet) }),
        Decoration.widget({ widget: new SpacerWidget() }),
        Decoration.line({ class: 'has-banner' })
      );
      
    } else {
      contentEl.getElementsByClassName("inline-title")[0].classList.remove("hide")
    }

    if (title || icon) {
      const settingsFacet = state.facet(iconDecorFacet);
      widgets.push(
        Decoration.widget({ widget: new HeaderWidget(title, icon ?? "", plugin, file, state.facet(iconDecorFacet)) }),

        Decoration.line({ class: "has-header", attributes: { "data-icon-v": settingsFacet.iconVerticalAlignment, contenteditable: "true" } })
      );
    } 

    return Decoration.set(widgets.map(w => w.range(0)), true);
  }
}, {
  decorations: v => v.decor
});

export default getViewPlugin;
