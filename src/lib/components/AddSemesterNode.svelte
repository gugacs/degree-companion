<script lang="ts">
  import { Plus } from '@lucide/svelte';

  export let data: { onClick: () => void };
</script>

<button on:click={data.onClick} class="add-semester-btn" title="Add New Semester">
  <Plus size="3rem" />
  <span>Add Semester</span>
</button>

<style>
  .add-semester-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 0.5rem;
    width: 20rem;
    height: 10rem;
    color: #555;
    background-color: transparent;
    border: 0.2rem dashed #ccc;
    border-radius: 1rem;
    cursor: pointer;
    font-size: 2rem;
  }

  .add-semester-btn:hover {
    background-color: #f0f0f0;
    border-color: #aaa;
    color: #000;
  }
</style>
