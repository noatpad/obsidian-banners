import { TFile } from 'obsidian';
import clamp from 'lodash/clamp';
import { html } from 'common-tags';

import BannersPlugin from './main';
import { IBannerMetadata } from './MetaManager';

interface IDragData { x: number, y: number, isDragging: boolean };
type MTEvent = MouseEvent | TouchEvent;

// Get current mouse position of event
const getMousePos = (e: MTEvent) => {
  const { clientX, clientY } = (e instanceof MouseEvent) ? e : e.targetTouches[0];
  return { x: clientX, y: clientY };
};

// Begin image drag
const handleDragStart = (e: MTEvent, dragData: IDragData) => {
  const { x, y } = getMousePos(e);
  dragData.x = x;
  dragData.y = y;
  dragData.isDragging = true;
};

// Dragging image
// TODO: See if it's possible to rework drag so that it's consistent to the image's dimensions
const handleDragMove = (e: MTEvent, dragData: IDragData) => {
  if (!dragData.isDragging) { return }

  // Calculate delta and update current mouse position
  const img = e.target as HTMLImageElement;
  const { x, y } = getMousePos(e);
  const delta = {
    x: (dragData.x - x) / img.clientWidth * 100,
    y: (dragData.y - y) / img.clientHeight * 100
  };
  dragData.x = x;
  dragData.y = y;

  const [currentX, currentY] = img.style.objectPosition
    .split(' ')
    .map(n => parseFloat(n));

  // Update object position styling depending on banner dimensions
  const { clientHeight, clientWidth, naturalHeight, naturalWidth } = img;
  if (naturalHeight / naturalWidth >= clientHeight / clientWidth) {
    const newY = clamp(currentY + delta.y, 0, 100);
    img.style.objectPosition = `${currentX}% ${newY}%`;
  } else {
    const newX = clamp(currentX + delta.x, 0, 100);
    img.style.objectPosition = `${newX}% ${currentY}%`;
  }
};

// Finish image drag
const handleDragEnd = async (img: HTMLImageElement, path: string, dragData: IDragData, plugin: BannersPlugin) => {
  if (!dragData.isDragging) { return }
  dragData.isDragging = false;

  // Upsert data to file's frontmatter
  const [x, y] = img.style.objectPosition
    .split(' ')
    .map(n => Math.round(parseFloat(n) * 1000) / 100000);
  await plugin.metaManager.upsertBannerData(path, { x, y });
};

// Helper to get the URL path to the image file
const parseSource = (plugin: BannersPlugin, src: string, filepath: string): string => {
  // Internal embed link format - "![[<link>]]"
  if (/^\!\[\[.+\]\]$/.test(src)) {
    const link = src.slice(3, -2)
    const file = plugin.metadataCache.getFirstLinkpathDest(link, filepath);
    return file ? plugin.vault.getResourcePath(file) : link;
  }

  // Absolute paths (legacy), relative paths (legacy), & URLs
  const path = src.startsWith('/') ? src.slice(1) : src;
  const file = plugin.vault.getAbstractFileByPath(path);
  return (file instanceof TFile) ? plugin.vault.getResourcePath(file) : src;
};

const getBannerElements = (
  plugin: BannersPlugin,
  bannerData: IBannerMetadata,
  filepath: string,
  wrapper: HTMLElement,
  contentEl: HTMLElement,
  isEmbed: boolean = false
): HTMLElement[] => {
  const { src, x = 0.5, y = 0.5 } = bannerData;
  const dragData: IDragData = { x: null, y: null, isDragging: false };

  const messageBox = document.createElement('div');
  messageBox.className = 'banner-message';
  messageBox.innerHTML = html`
    <div class="spinner">
      <div class="bounce1"></div>
      <div class="bounce2"></div>
      <div class="bounce3"></div>
    </div>
  `;

  const img = document.createElement('img');
  const clampedX = clamp(x, 0, 1);
  const clampedY = clamp(y, 0, 1);
  img.className = 'banner-image full-width';
  img.style.objectPosition = `${clampedX * 100}% ${clampedY * 100}%`;
  img.draggable = false;
  img.onload = () => wrapper.addClass('loaded');
  img.onerror = () => {
    messageBox.innerHTML = `<p>Error loading banner image! Is the <code>${plugin.getSettingValue('frontmatterField')}</code> field valid?</p>`;
    wrapper.addClass('error');
  }

  // Only allow dragging for banners not within embed views
  if (!isEmbed) {
    img.onmousedown = (e) => handleDragStart(e, dragData);
    img.onmousemove = (e) => handleDragMove(e, dragData);
    contentEl.parentElement.onmouseup = () => handleDragEnd(img, filepath, dragData, plugin);

    // Only allow dragging in mobile when desired from settings
    if (plugin.settings.allowMobileDrag) {
      img.ontouchstart = (e) => handleDragStart(e, dragData);
      img.ontouchmove = (e) => handleDragMove(e, dragData);
      contentEl.parentElement.ontouchend = () => handleDragEnd(img, filepath, dragData, plugin);
    }
  }

  img.src = parseSource(plugin, src, filepath);

  return [messageBox, img];
};

export default getBannerElements;
