import { setIcon } from 'obsidian';
import type { Action } from 'svelte/action';

// Svelte action to toggle lock icon in container
const lockIcon: Action<HTMLElement, boolean> = (el, lock) => {
  setIcon(el, lock ? 'lock' : 'unlock');
  return { update(newLock) { setIcon(el, newLock ? 'lock' : 'unlock'); } };
};

export default lockIcon;
