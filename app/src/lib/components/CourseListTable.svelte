<script lang="ts">
  import { csv } from "\$lib/states/curriculum.svelte";
  import { createTable, Subscribe, Render } from '@humanspeak/svelte-headless-table';
  import { readable } from "svelte/store";

  let table;
  let columns;
  let viewModel;

  let headerRows, rows, tableAttrs, tableBodyAttrs;

  const generateTableColumns = () => {
    const dataStore = readable($csv.data);
    table = createTable(dataStore);
    let keys = Object.keys($csv.data[0]);
    let columnKeys = []

    for (let key of keys) {
      columnKeys.push(table.column({
        header: key,
        accessor: key,
      }));
    }
    columns = table.createColumns(columnKeys);

    viewModel = table.createViewModel(columns);

    headerRows = viewModel.headerRows;
    rows = viewModel.rows;
    tableAttrs = viewModel.tableAttrs;
    tableBodyAttrs = viewModel.tableBodyAttrs;
  }

  $: if ($csv?.data && $csv.data.length > 0) {
    generateTableColumns();
  }

  $: droppedCsv = $csv?.data && $csv.data.length > 0;
</script>


{#if droppedCsv}
  <h2>Overview of your file</h2>

  <table {...$tableAttrs}>
    <thead>
    {#each $headerRows as headerRow (headerRow.id)}
      <Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
        <tr {...rowAttrs}>
          {#each headerRow.cells as cell (cell.id)}
            <Subscribe attrs={cell.attrs()} let:attrs>
              <th {...attrs}>
                <Render of={cell.render()} />
              </th>
            </Subscribe>
          {/each}
        </tr>
      </Subscribe>
    {/each}
    </thead>
    <tbody {...$tableBodyAttrs}>
    {#each $rows as row (row.id)}
      <Subscribe rowAttrs={row.attrs()} let:rowAttrs>
        <tr {...rowAttrs}>
          {#each row.cells as cell (cell.id)}
            <Subscribe attrs={cell.attrs()} let:attrs>
              <td {...attrs}>
                <Render of={cell.render()} />
              </td>
            </Subscribe>
          {/each}
        </tr>
      </Subscribe>
    {/each}
    </tbody>
  </table>

  <a href="TODO">Continue</a>
{/if}

<style>
  table {
    border-spacing: 0;
    border-top: 1px solid black;
    border-left: 1px solid black;
  }
  th, td {
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    padding: 0.5rem;
  }
</style>