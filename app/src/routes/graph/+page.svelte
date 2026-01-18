<script lang="ts">
  import CurriculumTree from "$lib/components/CurriculumTree.svelte";
  import Legend from "$lib/components/Legend.svelte";
  import {MoveLeft, MoveRight} from '@lucide/svelte';

</script>


<div class="graph-wrapper">
  <div class="header">
    <a href="/"
       class="back-button">
      <MoveLeft size="0.9rem"/>
      Back to data drop
    </a>

    <Legend/>
  </div>

  <div class="graph-content">
    <CurriculumTree/>
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
    border: 3px solid lightgrey;
    border-radius: 1rem;
    padding: 0.5rem;
  }
</style>
