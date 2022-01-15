import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/rangeset';
// import { tokenClassNodeProp } from '@codemirror/stream-parser';
import { Decoration, DecorationSet, EditorView, PluginValue, ViewPlugin, ViewUpdate } from '@codemirror/view';

// const bannerWidgets = (view: EditorView): DecorationSet => {

// }

class Plugin implements PluginValue {
  view: EditorView;
  decorations: DecorationSet;

  constructor(view: EditorView) {
    this.view = view;
    // this.decorations = this.buildDecorations();
    console.log(syntaxTree(view.state));
  }

  update(update: ViewUpdate) {
    if (update.docChanged) {
      console.log(syntaxTree(this.view.state));
    }
  }

  destroy() {}

  // buildDecorations(): DecorationSet {
  //   const builder = new RangeSetBuilder<Decoration>();
  //   for (const { from, to } of this.view.visibleRanges) {
  //     console.log(syntaxTree(this.view.state));
  //   }
  // }
}

export const BannersExtension = ViewPlugin.fromClass(Plugin);
