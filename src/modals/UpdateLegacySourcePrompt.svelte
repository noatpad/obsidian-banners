<script lang="ts">
  import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import { slide } from 'svelte/transition';
  import { updateLegacyBannerSource } from 'src/bannerData';
  import { plug } from 'src/main';

  enum Stage {
    Idle = 0,
    Processing,
    Done
  }

  const progress = tweened(0, { easing: cubicOut });
  let stage = Stage.Idle;
  let log: string;

  const addToLog = (text: string) => { log += '\n' + text; };

  const process = async () => {
    stage = Stage.Processing;
    log = '🚩 Start updating!';

    const files = plug.app.vault.getMarkdownFiles();
    const count = files.length;
    let changeCount = 0;
    progress.set(0);
    addToLog(`Scanning ${count} files...`);

    for (let i = 0; i < count; i++) {
      const file = files[i];
      try {
        const changed = await updateLegacyBannerSource(file);
        if (changed) {
          addToLog(`Updated ${file.name}!`);
          changeCount++;
        }
      } catch (error) {
        addToLog(`⚠ ERROR with ${file.name}`);
        addToLog(`${error}`);
      } finally {
        progress.set((i + 1) / count);
      }
    }

    stage = Stage.Done;
    progress.set(1);
    addToLog('🏁 Done!');
    addToLog(changeCount ? `Updated ${changeCount} files!` : 'All files are already good to go!');
  };

  $: isIdle = (stage === Stage.Idle);
</script>

<div class="update-legacy-source-modal">
  {#if isIdle}
    <div class="markdown-rendered" transition:slide>
      <p>
        As of Obsidian 1.4, the new Properties view supports the internal file syntax,
        which makes it more straightforward to use local images as banners.
      </p>
      <p>
        Because of this,
        <b>Banners 2.0 will no longer use the previous syntax for local images</b>
        (<code>"![[filename]]"</code>).
        If you used Banners 1.x in the past, this modal can facillitate this change
        by scanning all of your notes in your vault for the legacy source syntax
        and update it appropriately (at least to the best of its ability).
      </p>
      <p class="mod-warning">
        <b>Warning:</b> this process will check the frontmatter of <b>all</b> your files and
        make changes to files with the legacy syntax. This should be safe, but may take a bit
        and backing up your files beforehand is always good.
      </p>
    </div>
  {:else}
    <div class="markdown-rendered" transition:slide>
      <progress class="update-progress" value={$progress} />
      <pre class="update-log">
        <code>{log}</code>
      </pre>
    </div>
  {/if}
  <div class="modal-button-container">
    <button
      class="update-button mod-cta"
      disabled={!isIdle}
      on:click={process}
    >
      Update
    </button>
  </div>
</div>

<style lang="scss">
  .update-log {
    height: 300px;
    max-height: 40vh;
    white-space: pre-line;
  }

  .update-progress {
    width: 100%;
  }

  .update-button:disabled {
    background-color: var(--color-base-50);
    color: var(--text-muted);
  }
</style>
