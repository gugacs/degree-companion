<script lang="ts">
  import CurriculumTree from "$lib/components/CurriculumTree.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import {ArrowLeft} from '@lucide/svelte';
  import { storageManager } from '$lib/services/storageManager';
  import { csv, curriculumStore, graphStore } from '$lib/states/curriculum.svelte';

  function handleBackClick() {
    // Clear the stores
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
    // Clear localStorage
    storageManager.clear();
  }
</script>


<div class="graph-wrapper">
  <div class="header">
    <a href="/"
       class="back-button"
       on:click={handleBackClick}>
      <ArrowLeft size="0.9rem"/>
      Back to data drop
    </a>

    <Legend/>
  </div>

  <CurriculumTree/>
</div>


<style>
  .graph-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }

  .header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem;
  }

  .back-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    text-decoration: none;
    color: white;
    background-color: #007bff;
    border-radius: 1rem;
    border: none;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    text-align: center;
  }

  .back-button:hover {
    transform: translateY(-0.2rem);
  }
</style>
