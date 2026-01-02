<!--
  Code based on
  - Name: Svelte Tauri FileDrop
  - By: Kasper Henningsen
  - Licensed under: MIT License
  - Source: https://github.com/probablykasper/svelte-tauri-filedrop#usage
-->

<script lang="ts">
  import { resolveResource } from "@tauri-apps/api/path";
  import { readTextFile, BaseDirectory, exists } from '@tauri-apps/plugin-fs';
  import FileDrop from "svelte-tauri-filedrop"

  let fileContent: string = "None"
  const open = async (paths: string[]) => {
    if(paths.length != 1) return;
    const path = paths[0];
    // TODO: Open and read file content and return here again
    try {
      const resPath = await resolveResource(path);
      const fileExists = await exists(resPath);
      fileContent = fileExists ? "yes" : "no";
      const content = await readTextFile(path);
      fileContent = content;
    } catch(error) {
      fileContent = `Error: ${error}`;
    }
    // TODO: Parse file content to custom data structure
    // TODO: Store data structure in a global svelte store
  }
</script>

<FileDrop extensions={["csv"]} handleFiles={open} let:files>
  <div class="dropzone" class:droppable={files.length == 1}>
    <h2>Drop CSV files</h2>
  </div>
</FileDrop>

<p>{fileContent}</p>

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
