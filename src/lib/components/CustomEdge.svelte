<script lang="ts">
  import {
    BaseEdge,
    getBezierPath,
    type EdgeProps,
    Position,
    EdgeLabel
  } from '@xyflow/svelte';

  let {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition = Position.Right,
    targetPosition = Position.Left,
    selected,
    data,
  }: EdgeProps = $props();

  let [edgePath, labelX, labelY] = $derived(
    getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })
  );
</script>

<BaseEdge {id} path={edgePath} />

{#if selected}
  <EdgeLabel x={labelX} y={labelY} >
    <h3>{data.sourceCourse.name} -> {data.targetCourse.name}</h3>
  </EdgeLabel>
{/if}

<style>

</style>