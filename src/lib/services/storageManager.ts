import { get } from 'svelte/store';
import { curriculumStore, csv, graphStore } from '$lib/states/curriculum.svelte';
import type { Course, Curriculum } from '$lib/types/data';

const STORAGE_KEY = 'degree-companion-state';
let autoSaveEnabled = true;
let saveTimeout: ReturnType<typeof setTimeout>;

function serializeCourses(courses: Course[]): any[] {
  return courses.map(course => ({
    ...course,
    prerequisites: course.prerequisites.map(prereq => prereq.id)
  }));
}

function deserializeCourses(serializedCourses: any[]): Course[] {
  const courses: Course[] = serializedCourses.map(sc => ({ ...sc, prerequisites: [] }));
  const courseMap = new Map<string, Course>();

  courses.forEach(course => {
    const ids = Array.isArray(course.id) ? course.id : [course.id];
    ids.forEach(id => courseMap.set(id, course));
  });

  serializedCourses.forEach((sc, index) => {
    courses[index].prerequisites = sc.prerequisites
      .map((prereqId: string | string[]) => {
        const ids = Array.isArray(prereqId) ? prereqId : [prereqId];
        for (const id of ids) {
          const prereq = courseMap.get(id);
          if (prereq) return prereq;
        }
        return undefined;
      })
      .filter((prereq: Course | undefined) => prereq !== undefined);
  });

  return courses;
}

function debouncedSave() {
  if (!autoSaveEnabled) return;

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    storageManager.save();
  }, 1000);
}

export const storageManager = {
  save() {
    if (!autoSaveEnabled) return;

    try {
      const state = {
        curriculum: {
          ...get(curriculumStore),
          courses: serializeCourses(get(curriculumStore).courses)
        },
        graph: get(graphStore),
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
      if (!saved) return false;

      const state = JSON.parse(saved);
      curriculumStore.set({
        ...state.curriculum,
        courses: deserializeCourses(state.curriculum.courses)
      });

      if (state.graph) graphStore.set(state.graph);
      csv.set(state.csv);

      return true;
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
      autoSaveEnabled = false;

      localStorage.removeItem(STORAGE_KEY);

      curriculumStore.set({
        credits: 0,
        modules: [],
        courses: [],
        degreeType: 'bachelor',
        startSemester: 'winter',
        majorModule: '',
        minorModule: ''
      });

      graphStore.set({
        nodes: [],
        edges: [],
        strokeWidth: 2,
        strokeColor: '#000000',
        semesterCount: 0,
        courseCardStates: {}
      });

      csv.set(undefined);

      setTimeout(() => { autoSaveEnabled = true; }, 100);
    } catch (error) {
      console.error('Failed to clear state:', error);
      autoSaveEnabled = true;
    }
  },

  initAutoSave() {
    if (typeof window !== 'undefined') {
      curriculumStore.subscribe(debouncedSave);
      graphStore.subscribe(debouncedSave);
      csv.subscribe(debouncedSave);
    }
  }
};
