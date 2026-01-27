<!-- ================================================================ -->
<!-- ==============CURRICULUM VALIDATION FOR ONBOARDING============== -->
<!-- ================================================================ -->
<script lang="ts" context="module">
  import type { Curriculum } from '$lib/types/data';

  export function isOnboardingComplete(curriculum: Curriculum): boolean {
    if (!curriculum.credits || !curriculum.degreeType || !curriculum.startSemester) {
      return false;
    }
    if (curriculum.degreeType === 'bachelor') {
      return curriculum.modules.every(m => m.credits && m.credits > 0);
    }
    if (curriculum.degreeType === 'master') {
      return !!(
        curriculum.majorModule && 
        curriculum.minorModule && 
        curriculum.modules.find(m => m.code === curriculum.majorModule && m.credits > 0) &&
        curriculum.modules.find(m => m.code === curriculum.minorModule && m.credits > 0)
      );
    }
    return false;
  }
</script>

<!-- ================================================================ -->
<!-- =======================ONBOARDING MODULE======================== -->
<!-- ================================================================ -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import {ArrowLeft, ArrowRight} from '@lucide/svelte';
  import { curriculumStore } from '$lib/states/curriculum.svelte';
  import { storageManager } from '$lib/services/storageManager';

  onDestroy(() => { if (!isOnboardingComplete(get(curriculumStore))) { storageManager.clear(); }});

  let degreeType: 'bachelor' | 'master' = 'bachelor';
  let startSemester: 'winter' | 'summer' = 'winter';
  let bachelorECTS = 180;
  let masterECTS = 120;
  let moduleECTS: Record<string, number | ''> = {};
  let majorModule = '';
  let minorModule = '';
  let majorECTS: number | '' = 0;
  let minorECTS: number | '' = 0;

  $: totalECTS = degreeType === 'bachelor' ? bachelorECTS : masterECTS;
  $: majorModuleName = $curriculumStore.modules.find(m => m.code === majorModule)?.name || 'Major Module';
  $: minorModuleName = $curriculumStore.modules.find(m => m.code === minorModule)?.name || 'Minor Module';

  $: if ($curriculumStore.modules) {
    $curriculumStore.modules.forEach(m => {
      if (!(m.code in moduleECTS)) {
        moduleECTS[m.code] = 0;
      }
    });
  }

  $: canSubmit = degreeType === 'bachelor'
    ? bachelorECTS > 0 && $curriculumStore.modules.every(m => {
        const val = moduleECTS[m.code];
        return typeof val === 'number' && val > 0;
      })
    : masterECTS > 0 && majorModule && minorModule && majorModule !== minorModule && 
      typeof majorECTS === 'number' && majorECTS > 0 && 
      typeof minorECTS === 'number' && minorECTS > 0;

  const handleSubmit = () => {
    curriculumStore.update(curr => ({
      ...curr,
      credits: totalECTS,
      degreeType: degreeType,
      startSemester: startSemester,
      majorModule: degreeType === 'master' ? majorModule : '',
      minorModule: degreeType === 'master' ? minorModule : '',
      modules: curr.modules.map(module => ({
        ...module,
        credits: (degreeType === 'bachelor' 
          ? (typeof moduleECTS[module.code] === 'number' ? moduleECTS[module.code] : 0)
          : module.code === majorModule ? (typeof majorECTS === 'number' ? majorECTS : 0)
          : module.code === minorModule ? (typeof minorECTS === 'number' ? minorECTS : 0)
          : module.credits) as number
      }))
    }));
    goto('/graph');
  };
</script>

<!-- ============================================================================ -->
<!-- MAIN CONTENT -->
<!-- ============================================================================ -->

<main>
  <button class="back-btn" on:click={() => goto('/')}>
    <ArrowLeft size="0.9rem" />
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

      <!-- Master's Degree Sections -->
      {#if degreeType === 'master' && $curriculumStore.modules.length}
        <!-- Major and Minor Selection -->
        <section>
          <h2>Major and Minor Modules</h2>
          <p class="desc">Select which module is your Major and which is your Minor</p>
          <div class="grid">
            <div class="select-wrapper">
              <label>Major Module</label>
              <select bind:value={majorModule}>
                <option value="" disabled>Select Major...</option>
                {#each $curriculumStore.modules as m}
                  <option value={m.code} disabled={m.code === minorModule}>
                    {m.name} ({m.code})
                  </option>
                {/each}
              </select>
            </div>
            <div class="select-wrapper">
              <label>Minor Module</label>
              <select bind:value={minorModule}>
                <option value="" disabled>Select Minor...</option>
                {#each $curriculumStore.modules as m}
                  <option value={m.code} disabled={m.code === majorModule}>
                    {m.name} ({m.code})
                  </option>
                {/each}
              </select>
            </div>
          </div>
        </section>

        <!-- ECTS for Major and Minor -->
        <section>
          <h2>ECTS for Major and Minor</h2>
          <p class="desc">Specify the ECTS credits for your Major and Minor modules</p>
          <div class="grid">
            <div class="module-row">
              <div class="module-info">
                <strong>{majorModuleName}</strong>
                <small>{majorModule || 'Not selected'}</small>
              </div>
              <div class="input-group small">
                <input type="number" bind:value={majorECTS} disabled={!majorModule} />
                <span>ECTS</span>
              </div>
            </div>
            <div class="module-row">
              <div class="module-info">
                <strong>{minorModuleName}</strong>
                <small>{minorModule || 'Not selected'}</small>
              </div>
              <div class="input-group small">
                <input type="number" bind:value={minorECTS} disabled={!minorModule} />
                <span>ECTS</span>
              </div>
            </div>
          </div>
        </section>
      {/if}

      <!-- Submit Button -->
      <button type="submit" class="submit-btn" disabled={!canSubmit}>
        Continue
        <ArrowRight size="0.9rem"/>
      </button>
    </form>
  </div>
</main>

<!-- ============================================================================ -->
<!-- STYLES -->
<!-- ============================================================================ -->

<style>
  /* CSS Custom Colour Properties */
  :root {
    --color-primary: #007bff;
    --color-white: #ffffff;
    --color-text: light-dark(#0f0f0f, #f6f6f6);
    --color-text-muted: #7f8c8d;
    --color-border: light-dark(#d3d3d3, #4a4a4a);
    --color-border-hover: light-dark(#999999, #999999);
    --color-bg-card: light-dark(#ffffff, #3a3a3a);
    --color-bg-main: light-dark(#f6f6f6, #2f2f2f);
    --color-bg-hover: light-dark(#f0f8ff, #1a3a5a);
    --color-bg-selected: light-dark(#e3f2fd, #1a3a5a);
    --color-bg-module: light-dark(#f8f9fa, #2a2a2a);
    --color-bg-radio: light-dark(#fafafa, #2a2a2a);
    --color-disabled: light-dark(#bbbbbb, #666666);
    --shadow-sm: 0 0.25rem 0.375rem light-dark(rgba(0, 0, 0, 0.07), rgba(0, 0, 0, 0.2));
    --shadow-focus: 0 0 0 0.1875rem rgba(0, 123, 255, 0.1);
    --shadow-btn: 0 0.25rem 0.375rem rgba(0, 123, 255, 0.3);
    --shadow-btn-hover: 0 0.375rem 0.75rem rgba(0, 123, 255, 0.4);
  }

  /* Main Layout */
  main {
    min-height: 100vh;
    padding: 2rem;
    background: var(--color-bg-main);
    color: var(--color-text);
    font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
    font-size: 1rem;
    line-height: 1.5;
  }

  /* Button Styles */
  .back-btn,
  .submit-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-white);
    background: var(--color-primary);
    border: none;
    border-radius: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: var(--shadow-btn);
    text-decoration: none;
  }

  .back-btn:hover,
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-0.125rem);
    box-shadow: var(--shadow-btn-hover);
  }

  /* Back Button Specific */
  .back-btn {
    position: fixed;
    top: 2rem;
    left: 2rem;
    z-index: 100;
  }

  /* Submit Button Specific */
  .submit-btn {
    margin: 2rem auto 0;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Content Container */
  .content {
    max-width: 56rem;
    margin: 0 auto;
    padding-top: 2rem;
  }

  /* Typography */
  h1 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    text-align: center;
    color: var(--color-text-muted);
    font-size: 1.1rem;
    margin-bottom: 3rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .desc {
    color: var(--color-text-muted);
    font-size: 0.95rem;
    margin-bottom: 1.5rem;
  }

  /* Form Container */
  form {
    background: var(--color-bg-card);
    border: 0.1875rem solid var(--color-border);
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: var(--shadow-sm);
  }

  section {
    margin-bottom: 3rem;
  }

  section:last-of-type {
    margin-bottom: 2rem;
  }

  /* Radio Button Groups */
  .radio-group {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
    gap: 1rem;
  }

  .radio-card {
    position: relative;
    padding: 1.5rem;
    border: 0.125rem solid var(--color-border);
    border-radius: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    background: var(--color-bg-radio);
  }

  .radio-card:hover {
    border-color: var(--color-primary);
    background: var(--color-bg-hover);
  }

  .radio-card.selected {
    border-color: var(--color-primary);
    background: var(--color-bg-selected);
    box-shadow: var(--shadow-focus);
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
    color: var(--color-text-muted);
  }

  /* Grid Layout */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    gap: 1.5rem;
  }

  /* Form Labels */
  label {
    font-weight: 600;
    font-size: 0.95rem;
    display: block;
    margin-bottom: 0.5rem;
  }

  /* Select Dropdown */
  .select-wrapper {
    position: relative;
  }

  .select-wrapper::after {
    content: '';
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    width: 0;
    height: 0;
    border-left: 0.3rem solid transparent;
    border-right: 0.3rem solid transparent;
    border-top: 0.4rem solid var(--color-text-muted);
    pointer-events: none;
  }

  /* Input Fields */
  select, input[type="number"] {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 0.125rem solid var(--color-border);
    border-radius: 0.5rem;
    background: var(--color-bg-card);
    color: inherit;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  select {
    cursor: pointer;
    appearance: none;
    padding-right: 2.5rem;
  }

  select:focus, input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: var(--shadow-focus);
  }

  select option[value=""] {
    color: var(--color-text-muted);
    font-style: italic;
  }

  select option:disabled {
    color: var(--color-disabled);
  }

  /* Input Groups */
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
    color: var(--color-text-muted);
    font-size: 0.85rem;
    white-space: nowrap;
  }

  /* Module Rows */
  .module-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--color-bg-module);
    border-radius: 0.5rem;
    border: 0.125rem solid var(--color-border);
    margin-bottom: 1rem;
  }

  .module-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    flex: 1;
    min-width: 0;
  }

  .module-info strong {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .module-info small {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    font-family: monospace;
  }

  /* Disabled State */
  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive Design */
  @media (max-width: 48rem) {
    h1 { font-size: 2rem; }
    form { padding: 1.5rem; }
    .grid { grid-template-columns: 1fr; }
  }
</style>
