<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { storageManager } from '$lib/services/storageManager';
  import Dropzone from "$lib/components/Dropzone.svelte";
  import { invoke } from "@tauri-apps/api/core";
  import CourseListTable from "$lib/components/CourseListTable.svelte";
  import { curriculumStore } from '$lib/states/curriculum.svelte';

  let name = $state("");
  let greetMsg = $state("");
  let isCheckingStorage = $state(true);

  async function greet(event: Event) {
    event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    greetMsg = await invoke("greet", { name });
  }

  onMount(async () => {
    const hasData = storageManager.hasState();
    if (hasData) {
      storageManager.load();

      // Check if the loaded curriculum actually has courses and data etc
      const curriculum = $curriculumStore;
      if (curriculum.courses && curriculum.courses.length > 0) {
        await goto('/graph');
      } else {
        storageManager.clear(); // Clear the stores
      }
    }
    isCheckingStorage = false;
  });
</script>

{#if isCheckingStorage}
  <div class="loading">
    <h2>Loading...</h2>
  </div>
{:else}
  <main class="container">
    <h1>Degree Companion</h1>
    <Dropzone />
    <CourseListTable />
  </main>
{/if}

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 5vh;
  padding-bottom: 5vh;
  min-height: 80vh;
  width: 100%;
  margin: 0;
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

h1 {
  text-align: center;
}

@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }
}
</style>
