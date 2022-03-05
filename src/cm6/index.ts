import { editorViewField } from 'obsidian';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import BannersPlugin from '../main';
import BannerWidget from './BannerWidget';
import SpacerWidget from './SpacerWidget';
import IconWidget from './IconWidget';

const YAML_SEPARATOR_TOKEN = 'def_hmd-frontmatter';
const YAML_DEF_NAME_TOKEN = 'atom_hmd-frontmatter';
const YAML_DEF_STR_TOKEN = 'hmd-frontmatter_string';
const YAML_DEF_VAL_TOKENS = ['hmd-frontmatter', 'hmd-frontmatter_number', 'hmd-frontmatter_keyword', YAML_DEF_STR_TOKEN];

const getExtension = (plugin: BannersPlugin) => ViewPlugin.fromClass(class implements PluginValue {
  decor: DecorationSet;

  constructor(view: EditorView) {
    this.decor = this.decorate(view);
  }

  update(_update: ViewUpdate) {
    if (!_update.docChanged) { return }
    this.decor = this.decorate(_update.view);
  }

  decorate(view: EditorView): DecorationSet {
    // If there's no YAML, stop here
    const cursor =  syntaxTree(view.state).cursor();
    cursor.firstChild();
    if (cursor.name !== YAML_SEPARATOR_TOKEN) { return Decoration.none }

    // Get all frontmatter fields to later process
    const frontmatter: {[key: string]: string} = {};
    let key;
    while (cursor.nextSibling() && cursor.name !== YAML_SEPARATOR_TOKEN) {
      const { from, to, name } = cursor;
      // console.log(name, view.state.sliceDoc(from, to));
      if (name === YAML_DEF_NAME_TOKEN) {
        key = view.state.sliceDoc(from, to);
      } else if (YAML_DEF_VAL_TOKENS.includes(name) && !frontmatter[key]) {
        const isStr = name === YAML_DEF_STR_TOKEN;
        const val = view.state.sliceDoc(from + (isStr ? 1 : 0), to - (isStr ? 1 : 0));
        frontmatter[key] = val;
      }
    };

    const bannerData = plugin.metaManager.getBannerData(frontmatter);
    const { contentEl, file } = view.state.field(editorViewField);
    const widgets: Decoration[] = [];

    // Add banner widgets if applicable
    if (bannerData.src) {
      widgets.push(
        Decoration.widget({ widget: new BannerWidget(plugin, bannerData, file.path, contentEl) }),
        Decoration.widget({ widget: new SpacerWidget() })
      );
    }

    // Add icon widget if applicable
    if (bannerData.icon) {
      widgets.push(
        Decoration.widget({ widget: new IconWidget(plugin, bannerData.icon, file, !!bannerData.src) })
      );
    }

    return Decoration.set(widgets.map(w => w.range(0)));
  }
}, {
  decorations: v => v.decor
});

export default getExtension;
