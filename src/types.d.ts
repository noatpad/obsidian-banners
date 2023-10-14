/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { EditorView } from '@codemirror/view';
import type { Editor } from 'obsidian';
import type { IconString } from './bannerData';

interface EditMode {
  type: 'source';
  editor: Editor;
}

interface PreviewMode {
  type: 'preview';
}

interface MarkdownViewState {
  type: 'markdown';
  state: {
    file: string;
    mode: 'source' | 'preview';
    source: boolean;
  };
}

interface ImageViewState {
  type: 'image';
  state: { file: string };
}

interface RenderSection {
  el: HTMLElement;
  rendered: boolean;
  html: string;
}

interface PreviewRenderer {
  sections: RenderSection[];
  queueRender: () => void;
}

declare module 'obsidian' {
  interface Editor {
    cm: EditorView;
  }

  interface Keymap {
    modifiers: string;
  }

  interface MarkdownPostProcessorContext {
    containerEl: HTMLElement;
  }

  interface MarkdownFileInfo {
    data: string;
    leaf: WorkspaceLeaf;
    file: TFile;
  }

  interface MarkdownPreviewView {
    docId: string;
    renderer: PreviewRenderer;
  }

  interface Vault {
    getAvailablePathForAttachments(
      base: string,
      ext: string | null,
      currentPath: string
    ): Promise<string>;
  }

  interface View {
    currentMode: EditMode | PreviewMode;
    editor: Editor;
    file: TFile;
    previewMode: MarkdownPreviewView;
  }

  interface WorkspaceLeaf {
    containerEl: HTMLElement;
    getViewState(): MarkdownViewState | ImageViewState;
    id: string;
  }
}

// Fix typings with twemoji package
declare module '@twemoji/api' {
  const twemoji: Twemoji;
  // @ts-ignore
  export default twemoji;
}

declare global {
  interface BannerData {
    source: string;
    x: number;
    y: number;
    icon: IconString;
    header: string;
    lock: boolean;
  }
}
