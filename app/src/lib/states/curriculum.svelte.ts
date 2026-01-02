import type { Curriculum } from "$lib/types/data";

export const curriculum = $state<Curriculum>({
  credits: 0,
  modules: [],
  courses: []
});
