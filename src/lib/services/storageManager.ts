import { get, writable } from 'svelte/store';
import { curriculumStore, csv, graphStore } from '$lib/states/curriculum.svelte';
import type { Course, Module } from '$lib/types/data';

export const resetKey = writable(0);
const STORAGE_KEY = 'degree-companion-state';

let autoSaveEnabled = true;
let saveTimeout: ReturnType<typeof setTimeout>;

export const disableAutoSave = () => autoSaveEnabled = false;
export const enableAutoSave = () => autoSaveEnabled = true;

//==================================================================
//=======================Helper Functions===========================
//==================================================================

// Helper to build ID-to-item lookup maps for ciruclar reference circumvention
const buildMap = <T>(items: T[], getIds: (item: T) => string | string[]): Map<string, T> => {
  const map = new Map<string, T>();
  items.forEach(item => {
    const ids = Array.isArray(getIds(item)) ? getIds(item) : [getIds(item)];
    (ids as string[]).forEach(id => map.set(id, item));
  });
  return map;
};

// ALLLLLL serializations for components the were able to have circular references
const serializeCourse = (course: Course) => ({
  ...course,
  module: course.module.map(m => m.code),
  prerequisites: course.prerequisites.map(p => p.id)
});

const deserializeCourses = (serialized: any[], modules: Module[]): Course[] => {
  const moduleMap = buildMap(modules, m => m.code);
  const courses: Course[] = serialized.map(sc => ({
    ...sc,
    module: sc.module.map((code: string) => moduleMap.get(code)).filter(Boolean),
    prerequisites: []
  }));

  const courseMap = buildMap(courses, c => c.id);
  serialized.forEach((sc, i) => {
    courses[i].prerequisites = sc.prerequisites
      .map((id: string | string[]) => {
        const ids = Array.isArray(id) ? id : [id];
        return ids.map(id => courseMap.get(id)).find(Boolean);
      })
      .filter(Boolean);
  });
  return courses;
};

const serializeNode = (node: any) => {
  if (!node.data?.lv) return node;
  
  const { onDelete, lv, ...restData } = node.data;
  return {
    ...node,
    data: {
      ...restData,
      lv: serializeCourse(lv)
    }
  };
};

const deserializeNode = (node: any, courseMap: Map<string, Course>, moduleMap: Map<string, Module>) => {
  if (!node.data?.lv) return node;

  const { prerequisites: prereqIds, module: moduleCodes, ...restLv } = node.data.lv;
  const prerequisites = prereqIds
    .map((id: string | string[]) => {
      const ids = Array.isArray(id) ? id : [id];
      return ids.map(id => courseMap.get(id)).find(Boolean);
    })
    .filter(Boolean);

  const module = moduleCodes.map((code: string) => moduleMap.get(code)).filter(Boolean);
  return {
    ...node,
    data: {
      ...node.data,
      lv: { ...restLv, module, prerequisites }
    }
  };
};

const serializeEdge = (edge: any) => {
  if (!edge.data?.sourceCourse || !edge.data?.targetCourse) return edge;
  return {
    ...edge,
    data: {
      sourceCourse: edge.data.sourceCourse.id,
      targetCourse: edge.data.targetCourse.id
    }
  };
};

const deserializeEdge = (edge: any, courseMap: Map<string, Course>) => {
  if (!edge.data?.sourceCourse || !edge.data?.targetCourse) return edge;
  return {
    ...edge,
    data: {
      sourceCourse: courseMap.get(edge.data.sourceCourse),
      targetCourse: courseMap.get(edge.data.targetCourse)
    }
  };
};

const debouncedSave = () => {
  if (!autoSaveEnabled) return;
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => storageManager.save(), 1000);
};

//==================================================================
//=================Storage Manager Component========================
//==================================================================

export const storageManager = {
  save() {
    if (!autoSaveEnabled) return;
    try {
      const curriculum = get(curriculumStore);
      const graph = get(graphStore);

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        curriculum: { ...curriculum, courses: curriculum.courses.map(serializeCourse) },
        graph: {
          ...graph,
          nodes: graph.nodes.map(serializeNode),
          edges: graph.edges.map(serializeEdge)
        },
        csv: get(csv),
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },

  load(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      const state = JSON.parse(saved);
      const courses = deserializeCourses(state.curriculum.courses, state.curriculum.modules);
      const courseMap = buildMap(courses, c => c.id);
      const moduleMap = buildMap(state.curriculum.modules, m => m.code);

      curriculumStore.set({ ...state.curriculum, courses });

      if (state.graph) {
        graphStore.set({
          ...state.graph,
          nodes: state.graph.nodes.map((n: any) => deserializeNode(n, courseMap, moduleMap)),
          edges: state.graph.edges.map((e: any) => deserializeEdge(e, courseMap))
        });
      }

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
      resetKey.update(n => n + 1);
      setTimeout(() => autoSaveEnabled = true, 100);
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
