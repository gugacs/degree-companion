<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowLeft } from '@lucide/svelte';
  import { curriculumStore } from '$lib/states/curriculum.svelte';

  let degreeType: 'bachelor' | 'master' = 'bachelor';
  let startSemester: 'winter' | 'summer' = 'winter';
  let bachelorECTS = 180;
  let masterECTS = 120;
  let moduleECTS: Record<string, number | ''> = {};

  $: totalECTS = degreeType === 'bachelor' ? bachelorECTS : masterECTS;

  $: if ($curriculumStore.modules) {
    $curriculumStore.modules.forEach(m => {
      if (!(m.code in moduleECTS)) {
        moduleECTS[m.code] = '';
      }
    });
  }

  $: canSubmit = degreeType === 'bachelor'
    ? bachelorECTS > 0 && $curriculumStore.modules.every(m => {
        const val = moduleECTS[m.code];
        return typeof val === 'number' && val > 0;
      })
    : masterECTS > 0;

  const handleSubmit = () => {
    curriculumStore.update(curr => ({
      ...curr,
      credits: totalECTS,
      degreeType: degreeType,
      startSemester: startSemester,
      modules: curr.modules.map(module => ({
        ...module,
        credits: (typeof moduleECTS[module.code] === 'number' ? moduleECTS[module.code] : module.credits) as number
      }))
    }));
    goto('/graph');
  };
</script>

<main>
  <button class="back-btn" on:click={() => goto('/')}>
    <ArrowLeft size={20} />
    Back
  </button>

  <div class="content">
    <h1>Complete Your Curriculum Setup</h1>
    <p class="subtitle">Help us understand your curriculum better by providing some additional information</p>

    <form on:submit|preventDefault={handleSubmit}>
      <!-- Degree Type Section -->
      <section>
        <h2>Degree Type</h2>
        <p class="desc">What type of degree is this curriculum for?</p>
        <div class="radio-group">
          {#each [['bachelor', 'Bachelor', 'Undergraduate degree'], ['master', 'Master', 'Graduate degree']] as [value, title, desc]}
            <label class="radio-card" class:selected={degreeType === value}>
              <input type="radio" name="degree" {value} bind:group={degreeType} />
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </label>
          {/each}
        </div>
      </section>

      <!-- Starting Semester Section -->
      <section>
        <h2>Starting Semester</h2>
        <p class="desc">When do you begin your studies?</p>
        <div class="radio-group">
          {#each [['winter', 'Winter Semester', 'Start in fall/autumn'], ['summer', 'Summer Semester', 'Start in spring']] as [value, title, desc]}
            <label class="radio-card" class:selected={startSemester === value}>
              <input type="radio" name="semester" {value} bind:group={startSemester} />
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </label>
          {/each}
        </div>
      </section>

      <!-- Total ECTS Section -->
      <section>
        <h2>Total ECTS Credits</h2>
        <p class="desc">How many ECTS credits are required for the entire curriculum?</p>
        <div class="input-group">
          {#if degreeType === 'bachelor'}
            <input type="number" min="1" bind:value={bachelorECTS} placeholder="e.g., 180" />
          {:else}
            <input type="number" min="1" bind:value={masterECTS} placeholder="e.g., 120" />
          {/if}
          <span>ECTS</span>
        </div>
      </section>

      <!-- Bachelor's Degree Section -->
      {#if degreeType === 'bachelor' && $curriculumStore.modules.length}
        <section>
          <h2>ECTS per Module</h2>
          <p class="desc">Specify the ECTS credits for each module in your curriculum</p>
          {#each $curriculumStore.modules as module}
            <div class="module-row">
              <div class="module-info">
                <strong>{module.name}</strong>
                <small>{module.code}</small>
              </div>
              <div class="input-group small">
                <input type="number" bind:value={moduleECTS[module.code]} />
                <span>ECTS</span>
              </div>
            </div>
          {/each}
        </section>
      {/if}

      <button type="submit" class="submit-btn" disabled={!canSubmit}>
        Finish Onboarding
      </button>
    </form>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    padding: 2rem;
    background: #f6f6f6;
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  }

  .back-btn {
    position: fixed;
    top: 2rem;
    left: 2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  .content {
    max-width: 56rem;
    margin: 0 auto;
    padding-top: 2rem;
  }

  h1 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    text-align: center;
    color: #7f8c8d;
    font-size: 1.1rem;
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .desc {
    color: #7f8c8d;
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  form {
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.07);
  }

  section {
    margin-bottom: 3rem;
  }

  .radio-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
    gap: 1rem;
  }

  .radio-card {
    position: relative;
    padding: 1.5rem;
    border: 2px solid #e0e0e0;
    border-radius: 0.75rem;
    cursor: pointer;
    background: #fafafa;
  }

  .radio-card:hover {
    border-color: #007bff;
  }

  .radio-card.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }

  .radio-card input {
    position: absolute;
    opacity: 0;
  }

  .radio-card div {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .radio-card strong {
    font-size: 1.1rem;
    font-weight: 600;
  }

  .radio-card small {
    font-size: 0.85rem;
    color: #7f8c8d;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    max-width: 18.75rem;
  }

  .input-group.small {
    max-width: 7.5rem;
    min-width: 7.5rem;
  }

  .input-group span {
    font-weight: 600;
    color: #7f8c8d;
    font-size: 0.85rem;
  }

  input[type="number"] {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 2px solid #e0e0e0;
    border-radius: 0.5rem;
    background: white;
    font-size: 0.9rem;
  }

  input:focus {
    outline: none;
    border-color: #007bff;
  }

  .module-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 0.5rem;
    border: 1px solid #e0e0e0;
    margin-bottom: 1rem;
  }

  .module-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
  }

  .module-info strong {
    font-weight: 500;
  }

  .module-info small {
    font-size: 0.85rem;
    color: #7f8c8d;
    font-family: monospace;
  }

  .submit-btn {
    display: block;
    margin: 2rem auto 0;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: #007bff;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
