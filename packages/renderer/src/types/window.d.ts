/**
 * Type definitions for window.electronAPI
 */

import type { tauriAPI } from '@localmind/shared/tauri-api';

declare global {
  interface Window {
    electronAPI: typeof tauriAPI;
    __TAURI__?: any;
  }
}

export {};
