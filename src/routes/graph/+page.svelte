<script lang="ts">
  import CurriculumTree from "$lib/components/CurriculumTree.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import { storageManager, resetKey } from '$lib/services/storageManager';

  function handleBackClick() {
    storageManager.clear(); // Clear the stores
  }
</script>


<div class="graph-wrapper">
  <div class="header">
    <a href="/"
       class="back-button"
       on:click={handleBackClick}>
      <span class="icon-wrapper">
        <!-- SVG using a public domain path for a rounded warning triangle -->
        <!-- Source: https://freesvg.org/1538316074 -->
        <svg
          class="icon-svg"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#ff8c00" stroke="none"></path>
          <line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2.5"></line>
          <line x1="12" y1="17" x2="12" y2="17" stroke="white" stroke-width="2.5"></line>
        </svg>
      </span>
      <span class="text">Start a new curriculum</span>
    </a>

    <Legend/>
  </div>

  {#key $resetKey}
      <CurriculumTree/>
  {/key}
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
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 0;
    font-weight: 600;
    text-decoration: none;
    color: white;
    background-color: transparent;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    text-align: center;
    width: 2.8rem;
    height: 2.8rem;
    overflow: visible;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-svg {
    width: 2.8rem;
    height: 2.8rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .back-button .text {
    opacity: 0;
    white-space: nowrap;
    font-size: 1rem;
    max-width: 0;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .back-button:hover {
    width: auto;
    padding: 0 0.9rem 0 0.5rem;
    gap: 0.25rem;
    background-color: #ff8c00;
    border-radius: 0.6rem;
    box-shadow: 0 0.1875rem 0.625rem rgba(255, 140, 0, 0.3);
  }

  .back-button:hover .icon-svg {
    width: 2.2rem;
    height: 2.2rem;
  }

  .back-button:hover svg path {
    fill: white;
  }

  .back-button:hover svg line {
    stroke: #ff8c00;
  }

  .back-button:hover .text {
    opacity: 1;
    max-width: 12rem;
  }
</style>
