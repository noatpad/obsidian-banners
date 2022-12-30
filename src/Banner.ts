import { TFile } from 'obsidian';
import clamp from 'lodash/clamp';
import { html } from 'common-tags';

import BannersPlugin from './main';
import { IBannerMetadata } from './MetaManager';

type MTEvent = MouseEvent | TouchEvent;
interface IDragData {
  x: number,
  y: number,
  isDragging: boolean,
  vertical: boolean
};

interface IElementListener<E extends keyof HTMLElementEventMap> {
  target: HTMLElement,
  ev: E,
  func: (listener: HTMLElementEventMap[E]) => any
};
type ElListener = IElementListener<keyof HTMLElementEventMap>;

// Get current mouse position of event
const getMousePos = (e: MTEvent) => {
  const { clientX, clientY } = (e instanceof MouseEvent) ? e : e.targetTouches[0];
  return { x: clientX, y: clientY };
};

// Begin image drag (and if a modifier key is required, only do so when pressed)
const handleDragStart = (e: MTEvent, dragData: IDragData, isModHeld: boolean) => {
  if (!isModHeld && e instanceof MouseEvent) { return }
  const { x, y } = getMousePos(e);
  const { clientHeight, clientWidth, naturalHeight, naturalWidth } = e.target as HTMLImageElement;
  dragData.x = x;
  dragData.y = y;
  dragData.isDragging = true;
  dragData.vertical = (naturalHeight / naturalWidth >= clientHeight / clientWidth);
};

// Dragging image
// TODO: See if it's possible to rework drag so that it's consistent to the image's dimensions
const handleDragMove = (e: MTEvent, dragData: IDragData) => {
  if (!dragData.isDragging) { return }

  // Calculate delta and update current mouse position
  const img = e.target as HTMLImageElement;
  const { x, y } = getMousePos(e);
  const delta = {
    x: (dragData.x - x) / img.clientWidth * 30,
    y: (dragData.y - y) / img.clientHeight * 30
  };
  dragData.x = x;
  dragData.y = y;

  const [currentX, currentY] = img.style.objectPosition
    .split(' ')
    .map(n => parseFloat(n));

  // Update object position styling depending on banner dimensions
  if (dragData.vertical) {
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
  await plugin.metaManager.upsertBannerData(path, dragData.vertical ? { y } : { x });
};

// Helper to get the URL path to the image file
const parseSource = (plugin: BannersPlugin, src: string, filepath: string): string => {
  // Internal embed link format - "![[<link>]]"
  if (/^\!\[\[.+\]\]$/.test(src)) {
    const link = src.slice(3, -2)
    const file = plugin.metadataCache.getFirstLinkpathDest(link, filepath);
    return file ? plugin.vault.getResourcePath(file) : link;
  }

  // Absolute paths, relative paths, & URLs
  const path = src.startsWith('/') ? src.slice(1) : src;
  const file = plugin.vault.getAbstractFileByPath(path);
  return (file instanceof TFile) ? plugin.vault.getResourcePath(file) : src;
};

const buildBanner = (
  plugin: BannersPlugin,
  bannerData: IBannerMetadata,
  filepath: string,
  wrapper: HTMLElement,
  contentEl: HTMLElement,
  isEmbed: boolean = false
): [HTMLElement[], () => void] => {
  const { src, x = 0.5, y = 0.5, lock } = bannerData;
  const dragData: IDragData = { x: null, y: null, isDragging: false, vertical: true };
  const canDrag = !isEmbed && !lock;

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
  // get the body html element
  const body = document.querySelector('body');
  const listeners: ElListener[] = [];
  if (canDrag) {
    img.classList.toggle('draggable', plugin.settings.bannerDragModifier === 'none' || plugin.holdingDragModKey);

    // Image drag
    const imgDragStart = (e: MTEvent) => handleDragStart(e, dragData, plugin.holdingDragModKey);
    const imgDragMove = (e: MTEvent) => handleDragMove(e, dragData);
    const imgDragEnd = (e: MTEvent) => { handleDragEnd(img, filepath, dragData, plugin); }
    listeners.push(
      { target: img, ev: 'mousedown', func: imgDragStart },
      { target: img, ev: 'mousemove', func: imgDragMove },
      { target: body, ev: 'mouseup', func: imgDragEnd },
      { target: body, ev: 'mouseleave', func: imgDragEnd },
      { target: img, ev: 'click', func: (e: MTEvent) => e.stopPropagation() }
    );

    // Only allow dragging in mobile when desired from settings
    if (plugin.settings.allowMobileDrag) {
      listeners.push(
        { target: img, ev: 'touchstart', func: imgDragStart },
        { target: img, ev: 'touchmove', func: imgDragMove },
        { target: body, ev: 'touchend', func: imgDragEnd },
        { target: img, ev: 'click', func: (e: MTEvent) => e.stopPropagation() }
      );
    }
  }

  // Prepare listeners
  listeners.forEach(({ target, ev, func }) => target.addEventListener(ev, func));
  const removeListeners = () => listeners.forEach(({ target, ev, func }) => target.removeEventListener(ev, func));

  img.src = parseSource(plugin, src, filepath);

  return [[messageBox, img], removeListeners];
};

export default buildBanner;
