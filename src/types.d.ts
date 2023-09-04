import type { EditorView } from '@codemirror/view';
import type { Editor } from 'obsidian';

interface EditMode {
  type: 'source',
  editor: Editor
}

interface PreviewMode {
  type: 'preview'
}

interface MarkdownViewState {
  type: 'markdown',
  state: {
    file: string,
    mode: 'source' | 'preview',
    source: boolean
  }
}

interface ImageViewState {
  type: 'image',
  state: { file: string }
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
    editor: Editor,
    previewMode: MarkdownPreviewView
  }

  interface WorkspaceLeaf {
    containerEl: HTMLElement,
    getViewState(): MarkdownViewState | ImageViewState,
    id: string
  }
}

declare global {
  interface BannerMetadata {
    source: string | null,
    x: number | null,
    y: number | null
  }
}
