import type { EditorView } from '@codemirror/view';
import type { Editor } from 'obsidian';

interface EditMode {
  type: 'source',
  editor: Editor
}

interface PreviewMode {
  type: 'preview'
}

declare module 'obsidian' {
  interface Editor {
    cm: EditorView
  }

  interface MarkdownPostProcessorContext {
    containerEl: HTMLElement
  }

  interface MarkdownFileInfo {
    leaf: WorkspaceLeaf,
    file: TFile,
    frontmatterValid: boolean,
    rawFrontmatter: string
  }

  interface View {
    currentMode: EditMode | PreviewMode,
    editor: Editor
  }

  interface WorkspaceLeaf {
    containerEl: HTMLElement,
    id: string
  }
}

declare global {
  type Maybe<T> = T | null | undefined;

  interface BannerMetadata {
    src: Maybe<string>,
    x: Maybe<number>,
    y: Maybe<number>
  }
}
