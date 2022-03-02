import { WidgetType } from '@codemirror/view';

export default class SpacerWidget extends WidgetType {
  toDOM(): HTMLElement {
    const spacer = document.createElement('div');
    spacer.addClass('obsidian-banner-spacer');
    return spacer;
  }
}
