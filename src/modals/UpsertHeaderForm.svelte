<script lang="ts">
  import type { TFile } from 'obsidian';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { updateBannerData } from 'src/bannerData';
  import ObsidianToggle from 'src/settings/components/ObsidianToggle.svelte';
  import { FILENAME_KEY } from 'src/settings/structure';

  const dispatch = createEventDispatcher();

  export let file: TFile;
  let value = '';
  let useFilename = false;

  const closeModal = () => dispatch('close');
  const upsertHeader = () => {
    const header = useFilename ? `{{${FILENAME_KEY}}}` : (value || undefined);
    updateBannerData(file, { header });
    closeModal();
  };
</script>

<div class="upsert-header-modal">
  {#if !useFilename}
    <div class="row" transition:slide>
      <input
        type="text"
        class="header-input"
        placeholder="Your header text"
        disabled={useFilename}
        bind:value
        on:keydown={(e) => e.key === 'Enter' && upsertHeader()}
      />
    </div>
  {/if}
  <div class="row">
    <label for="useFilenameForHeader">Use file name as header</label>
    <ObsidianToggle
      checked={useFilename}
      onClick={() => { useFilename = !useFilename; }}
      id="useFilenameForHeader"
    />
  </div>
  <div class="modal-button-container">
    <button on:click={closeModal}>Cancel</button>
    <button class="mod-cta" on:click={upsertHeader}>Submit</button>
  </div>
</div>

<style lang="scss">
  .upsert-header-modal {
    padding-top: 0.25em;
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5em;
    text-align: center;

    & + & { margin-top: 1em; }
  }

  .header-input {
    width: 100%;
    text-align: center;
  }
</style>
