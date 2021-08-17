import { Events, MarkdownPostProcessorContext, Vault, Workspace } from 'obsidian';
import clamp from 'lodash/clamp';
import isURL from 'validator/lib/isURL';
import Banners from './main';

const BANNER_CLASS = 'obsidian-banner';

export interface FileData {
  [key: string]: XY
}

interface XY {
  x: number,
  y: number
}

interface MPPCPlus extends MarkdownPostProcessorContext {
  containerEl: HTMLElement
}

export default class BannersProcessor {
  plugin: Banners;
  workspace: Workspace;
  vault: Vault;
  events: Events;
  prevPath: string;

  constructor(plugin: Banners) {
    this.plugin = plugin;
    this.workspace = plugin.app.workspace;
    this.vault = plugin.app.vault;
    this.events = plugin.events;
    this.register();
  }

  // Register postprocessor and listeners
  register() {
    this.plugin.registerMarkdownPostProcessor(async (_, ctx: MPPCPlus) => {
      const { frontmatter, sourcePath } = ctx;
      const viewContainer = ctx.containerEl.parentElement as HTMLDivElement;

      // If no `banner` metadata field exists, remove banner (and its data) if necessary and stop here
      if (!frontmatter?.banner) {
        this.removeBanner(viewContainer);
        await this.removeFileData(sourcePath);
        return;
      }

      // Clear banner when changing files
      if (sourcePath !== this.prevPath) {
        this.removeBanner(viewContainer);
      }

      // Create banner if it hasn't been already made, otherwise update the banner image
      const { banner: src } = frontmatter;
      const bannerEl = viewContainer.querySelector(`.${BANNER_CLASS}`);
      if (!bannerEl) {
        this.addBanner(viewContainer, src, sourcePath);
      } else {
        const img = bannerEl.querySelector('img');
        img.src = this.parseSource(src);
      }

      this.prevPath = sourcePath;
    });

    // When resizing panes, update the banner image positioning
    this.workspace.on('resize', () => {
      this.workspace.containerEl
        .querySelectorAll('.markdown-preview-view.has-banner')
        .forEach((b: HTMLDivElement) => { this.setBannerOffset(b) });
    });

    // When settings change, restyle the banners with the current settings
    this.events.on('settingsSave', () => {
      this.workspace.containerEl
        .querySelectorAll('.markdown-preview-view.has-banner')
        .forEach((b: HTMLDivElement) => {
          this.restyleBanner(b);
          this.setBannerOffset(b);
        });
    })

    // When deleting a file, remove its banner data
    this.vault.on('delete', async ({ path }) => {
      await this.removeFileData(path);
    });

    // When renaming a file, move the banner data to the new file
    this.vault.on('rename', async ({ path }, oldPath) => {
      // If renamed file had no banner data to begin with, do nothing
      const value = this.plugin.fileData[oldPath];
      if (!value) { return }

      await this.removeFileData(oldPath);
      await this.upsertFileData(path, value);
      this.workspace.containerEl
        .querySelector(`.markdown-preview-view.has-banner[filepath="${oldPath}"]`)
        .setAttribute('filepath', path);
    });
  }

  // Create a banner for a given Markdown Preview View
  addBanner(wrapper: HTMLDivElement, src: string, path: string) {
    const { height, style } = this.plugin.settings;
    const bannerEl = document.createElement('div');
    const img = document.createElement('img');

    // Set attribute to be used for modifying banner data
    wrapper.setAttribute('filepath', path);

    // Initially make the image full-width (the more common case) and set its inital positioning
    img.draggable = false;
    img.className = 'full-width';
    img.onload = () => { this.setBannerOffset(wrapper) };
    img.src = this.parseSource(src);

    const bannerClasses = [BANNER_CLASS];
    if (style === 'gradient') { bannerClasses.push('gradient') }
    bannerEl.addClasses(bannerClasses);
    bannerEl.style.height = `${height}px`;
    bannerEl.appendChild(img);

    // Set up banner image drag handlers
    let dragging = false;
    let prevPos: XY;
    bannerEl.onmousedown = (e) => {
      // Prepare dragging behavior
      prevPos = this.getMousePos(e, bannerEl);
      dragging = true;
    };
    bannerEl.onmousemove = (e) => {
      // Only continue if dragging
      if (!dragging) { return }

      // Get delta of mouse drag
      const currentPos = this.getMousePos(e, bannerEl);
      const delta = { x: currentPos.x - prevPos.x, y: currentPos.y - prevPos.y };
      prevPos = currentPos;

      // Move the image within the banner div & the image's boundaries
      const { height, width } = img;
      const { left, top } = img.style;
      const newTop = clamp(parseInt(top || '0') + delta.y, bannerEl.clientHeight - height, 0);
      const newLeft = clamp(parseInt(left || '0') + delta.x, bannerEl.clientWidth - width, 0);
      img.style.top = `${newTop}px`;
      img.style.left = `${newLeft}px`;
    }
    wrapper.onmouseup = async () => {
      // Only continue when finishing drag
      if (!dragging) { return }
      dragging = false;

      // Update banner data
      const attr = wrapper.getAttribute('filepath');
      const data = { ...this.plugin.fileData[attr], ...this.getBannerOffset(img, bannerEl) }
      await this.upsertFileData(attr, data);
    };

    wrapper.prepend(bannerEl);
    wrapper.addClass('has-banner');

    const markdown = wrapper.querySelector('.markdown-preview-section') as HTMLDivElement;
    markdown.style.marginTop = `${height}px`;
  }

  // Remove banner from view
  removeBanner(wrapper: HTMLElement) {
    // If banner doesn't exist, do nothing
    const bannerDiv = wrapper.querySelector(`.${BANNER_CLASS}`);
    if (!bannerDiv) { return }

    bannerDiv.remove();
    wrapper.removeClass('has-banner');
    wrapper.removeAttribute('path');

    const markdown = wrapper.querySelector('.markdown-preview-section') as HTMLDivElement;
    markdown.style.marginTop = '';
  }

  // Restyle the current banner
  restyleBanner(wrapper: HTMLDivElement) {
    const { height, style } = this.plugin.settings;
    const bannerEl = wrapper.querySelector('.obsidian-banner') as HTMLDivElement;
    bannerEl.style.height = `${height}px`;

    if (style === 'gradient') {
      bannerEl.addClass('gradient');
    } else {
      bannerEl.removeClass('gradient');
    }

    const markdown = wrapper.querySelector('.markdown-preview-section') as HTMLDivElement;
    markdown.style.marginTop = `${height}px`;
  }

  // Set banner image positioning
  setBannerOffset(wrapper: HTMLDivElement) {
    const bannerEl = wrapper.querySelector('.obsidian-banner');
    const img = bannerEl.querySelector('img');

    // If image hasn't been loaded yet, do nothing
    if (!img.complete) { return }

    // Detect transitions from full-width -> full-height and vice-versa
    if (img.className === 'full-width' && img.height < bannerEl.clientHeight) {
      img.className = 'full-height';
    } else if (img.className === 'full-height' && img.width < bannerEl.clientWidth) {
      img.className = 'full-width';
    }

    // Update positioning based on their class
    if (img.className === 'full-width') {
      const percent = this.plugin.fileData[wrapper.getAttribute('filepath')]?.y ?? 0.5;
      const value = clamp((bannerEl.clientHeight / 2) - (img.height * percent), bannerEl.clientHeight - img.height, 0);
      img.style.top = `${value}px`;
      img.style.left = '';
    } else {
      const percent = this.plugin.fileData[wrapper.getAttribute('filepath')]?.x ?? 0.5;
      const value = clamp((bannerEl.clientWidth / 2) - (img.width * percent), bannerEl.clientWidth - img.width, 0);
      img.style.top = '';
      img.style.left = `${value}px`;
    }
  }

  // Get percentage of scroll based on an image's centered position
  getBannerOffset(img: HTMLImageElement, wrapper: HTMLDivElement): { x: number } | { y: number } {
    const { className, height, width } = img;
    const { top, left } = img.style;
    const { clientHeight, clientWidth } = wrapper;
    if (className === 'full-width') {
      return { y: (Math.abs(parseInt(top)) + (clientHeight / 2)) / height };
    } else {
      return { x: (Math.abs(parseInt(left)) + (clientWidth / 2)) / width };
    }
  }

  // Get mouse position
  getMousePos(e: MouseEvent, div: HTMLDivElement): XY {
    return { x: e.pageX - div.offsetTop, y: e.pageY - div.offsetLeft };
  }

  // Parse source as a URL or a local file path
  parseSource(src: string): string {
    if (isURL(src)) { return src }
    return this.vault.getAbstractFileByPath(src) ? this.vault.adapter.getResourcePath(src) : null;
  }

  // Upsert banner data for a file
  async upsertFileData(path: string, val: XY) {
    this.plugin.fileData[path] = val;
    await this.plugin.saveData();
  }

  // Remove banner data for a file if necessary
  async removeFileData(path: string) {
    if (!this.plugin.fileData[path]) { return }
    delete this.plugin.fileData[path];
    await this.plugin.saveData();
  }
}
