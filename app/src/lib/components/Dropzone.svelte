<!--
  Code based on
  - Name: Svelte Tauri FileDrop
  - By: Kasper Henningsen
  - Licensed under: MIT License
  - Source: https://github.com/probablykasper/svelte-tauri-filedrop#usage
-->

<script lang="ts">
	import FileDrop from "svelte-tauri-filedrop"

	let storedPaths: string[] = []
	function open(paths: string[]) {
	  storedPaths = paths;
	}
</script>

<FileDrop extensions={["csv"]} handleFiles={open} let:files>
	<div class="dropzone" class:droppable={files.length > 0}>
		<h2>Drop CSV files</h2>
	</div>
</FileDrop>

{#if storedPaths.length > 0}
  <h3>Dropped files:</h3>
  <ul>
    {#each storedPaths as path}
      <li>{path}</li>
    {/each}
  </ul>
{/if}

<style>
	.dropzone {
		margin: 20px;
		padding: 20px;
		background: #eee;
	}
	.droppable {
		background: #d6dff0;
	}
</style>
