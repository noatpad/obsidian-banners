<script lang="ts">
  export let error: string;
</script>

<div class="error markdown-rendered">
  <p>Couldn't load the banner! Is the <code>banner</code> field correct?</p>
  <code>{error}</code>
</div>

<style lang="scss">
  .error {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 16px;
    border: 4px solid var(--background-modifier-error);
    margin: 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--text-error);
  }
</style>
