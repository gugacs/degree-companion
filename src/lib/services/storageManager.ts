import { get } from 'svelte/store';
import { curriculumStore, csv } from '$lib/states/curriculum.svelte';

const STORAGE_KEY = 'degree-companion-state';

export const storageManager = {
  save() {
    try {
      const state = {
        curriculum: get(curriculumStore),
        csv: get(csv),
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  load(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        curriculumStore.set(state.curriculum);
        csv.set(state.csv);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to load state:', error);
      return false;
    }
  },

  hasState(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear state:', error);
    }
  }
};
