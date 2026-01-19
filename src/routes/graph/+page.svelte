<script lang="ts">
  import CurriculumTree from "$lib/components/CurriculumTree.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import {MoveLeft, MoveRight} from '@lucide/svelte';

  let strokeWidth = $state(2);
  let strokeColor = $state('#000000');
  let electiveModules = $state(false);
</script>


<div class="graph-wrapper">
  <div class="header">
    <a href="/"
       class="back-button">
      <MoveLeft size="0.9rem"/>
      Back to data drop
    </a>

    <div class="controls">
      <div class="stroke-control">
        <p>Stroke Width</p>
        <input type="range" min="1" max="10" bind:value={strokeWidth}/>
        <p>{strokeWidth}</p>
      </div>

      <div class="color-control">
        <p>Stroke Color</p>
        <input type="color" bind:value={strokeColor}/>
      </div>

      <div class="modules-control">
        <p>Show elective modules</p>
        <input type="checkbox" bind:checked={electiveModules} />
      </div>
    </div>

    <Legend/>
  </div>

  <div class="graph-content">
    <CurriculumTree {strokeWidth} {strokeColor} {electiveModules} />
  </div>
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
    padding: 0.75rem 2rem;
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

  .graph-content {
    border: 0.2rem solid lightgrey;
    padding: 0.5rem;
  }

  .controls {
    display: flex;
    flex-direction: row;
    position: relative;
    gap: 2rem;
  }

  .stroke-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .color-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .modules-control {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
</style>
