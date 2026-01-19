<script lang="ts">
  import { goto } from '$app/navigation';
  import { ArrowLeft } from '@lucide/svelte';
  import { curriculumStore } from '$lib/states/curriculum.svelte';

  let degreeType: 'bachelor' | 'master' = 'bachelor';
  let startSemester: 'winter' | 'summer' = 'winter';

  const handleSubmit = () => {
    curriculumStore.update(curr => ({
      ...curr,
      degreeType: degreeType,
      startSemester: startSemester
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

      <button type="submit" class="submit-btn">
        Continue
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

  .submit-btn {
    display: block;
    margin: 0 auto;
    padding: 0.75rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    background: #007bff;
    border: none;
    border-radius: 1rem;
    cursor: pointer;
  }
</style>
