<script lang="ts">
  import { csv } from "\$lib/states/curriculum.svelte";
  import { createTable, Subscribe, Render } from '@humanspeak/svelte-headless-table';
  import { ArrowRight } from '@lucide/svelte';
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

<div class="table-wrapper">
  {#if droppedCsv}
    <h2>Overview of your file</h2>

    <div class="table-content">
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
    </div>

    <a href="/onboarding" class="continue-button">
      Continue to Onboarding
      <ArrowRight size="0.9rem"/>
    </a>
  {/if}
</div>

<style>
  .table-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: auto;
    container-type: size;
    container-name: table-container;
    width: 80vw;
    height: 70vh;
  }

  .table-content {
    width: 90cqw;
    height: 70cqh;
    overflow: auto;
    border: 3px solid lightgrey;
    border-radius: 1rem;
  }

  .continue-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
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

  .continue-button:hover {
    transform: translateY(-0.2rem);
  }

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: separate;
    border-left: 0.1rem solid black;
  }

  th {
    padding: 0.8rem;
    position: sticky;
    top: 0;
    background-color: lightgrey;
    border-bottom: 0.1rem solid black;
    border-right: 0.1rem solid black;
  }

  td {
    border-bottom: 0.1rem solid black;
    border-right: 0.1rem solid black;
    font-size: 0.8rem;
    font-weight: 500;
  }
</style>