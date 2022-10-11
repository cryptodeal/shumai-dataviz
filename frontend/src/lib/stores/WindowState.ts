import { readable } from 'svelte/store';
import { browser } from '$app/environment';
import {
  WindowIsNormal,
  WindowIsMinimised,
  WindowIsMaximised,
  WindowIsFullscreen
} from '../wailsjs/runtime/runtime.js';

type WindowState = Record<string, any> & {
  isNormal: boolean;
  isMinimised: boolean;
  isMaximised: boolean;
  isFullscreen: boolean;
};

const state: WindowState = {
  isNormal: false,
  isMaximised: false,
  isMinimised: false,
  isFullscreen: false
};

export const WindowState = readable<WindowState>(state, (set) => {
  if (!browser) return;

  const updateState = (newState: WindowState) => {
    let needsSet = false;
    for (const [key, value] of Object.entries(newState)) {
      if (state[key] !== value) {
        state[key] = value;
        needsSet = true;
      }
    }
    if (needsSet) set(state);
  };

  getWindowState()
    .then((newState) => {
      updateState(newState);
    })
    .catch((err) => console.error(`Failed to update app window state`, err));

  // query stats endpoints 10 x per second
  const id = setInterval(() => {
    getWindowState()
      .then((newState) => {
        updateState(newState);
      })
      .catch((err) => console.error(`Failed to update app window state`, err));
  }, 100);

  return () => {
    clearInterval(id);
  };
});

const getWindowState = () => {
  return Promise.all([
    WindowIsNormal(),
    WindowIsMinimised(),
    WindowIsMaximised(),
    WindowIsFullscreen()
  ]).then((result) => {
    const [isNormal, isMinimised, isMaximised, isFullscreen] = result;
    return { isNormal, isMinimised, isMaximised, isFullscreen };
  });
};
