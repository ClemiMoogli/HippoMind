/**
 * UI state store
 */

import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark' | 'sepia' | 'slate';
  zoom: number;
  pan: { x: number; y: number };
  showMiniMap: boolean;
  searchQuery: string;
  searchResults: string[];
  currentSearchIndex: number;

  // Actions
  setTheme: (theme: UIState['theme']) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  toggleMiniMap: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  nextSearchResult: () => void;
  previousSearchResult: () => void;
  clearSearch: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  zoom: 1,
  pan: { x: 0, y: 0 },
  showMiniMap: true,
  searchQuery: '',
  searchResults: [],
  currentSearchIndex: -1,

  setTheme: (theme) => set({ theme }),

  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),

  setPan: (pan) => set({ pan }),

  toggleMiniMap: () => set((state) => ({ showMiniMap: !state.showMiniMap })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSearchResults: (results) =>
    set({ searchResults: results, currentSearchIndex: results.length > 0 ? 0 : -1 }),

  nextSearchResult: () => {
    const { searchResults, currentSearchIndex } = get();
    if (searchResults.length === 0) return;
    set({ currentSearchIndex: (currentSearchIndex + 1) % searchResults.length });
  },

  previousSearchResult: () => {
    const { searchResults, currentSearchIndex } = get();
    if (searchResults.length === 0) return;
    set({
      currentSearchIndex:
        (currentSearchIndex - 1 + searchResults.length) % searchResults.length,
    });
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [], currentSearchIndex: -1 }),
}));
