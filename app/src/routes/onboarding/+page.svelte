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

  form {
    background: white;
    border-radius: 1rem;
    padding: 2.5rem;
    box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.07);
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
