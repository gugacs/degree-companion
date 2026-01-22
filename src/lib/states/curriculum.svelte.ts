import type { Curriculum, Graph } from "$lib/types/data";
import { writable } from "svelte/store";
import { storageManager } from "$lib/services/storageManager";

export const csv = writable<any>();

export const curriculumStore = writable<Curriculum>({
  credits: 0,
  modules: [],
  courses: [],
  degreeType: 'bachelor',
  startSemester: 'winter',
  majorModule: '',
  minorModule: ''
});

export const graphStore = writable<Graph>({
  nodes: [],
  edges: [],
  strokeWidth: 2,
  strokeColor: '#000000',
  semesterCount: 0,
  courseCardStates: {}
});

//===========================================================
//==================AUTO SAVE FUNCT.=========================
//===========================================================
if (typeof window !== 'undefined') {
  let saveTimeout: ReturnType<typeof setTimeout>;

  const debouncedSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      storageManager.save();
    }, 1000);
  };

  curriculumStore.subscribe(debouncedSave);
  graphStore.subscribe(debouncedSave);
  csv.subscribe(debouncedSave);
}
