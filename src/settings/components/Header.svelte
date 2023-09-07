<script lang="ts">
  export let title: string;
  export let description: string;
</script>

<div class="setting-item setting-item-heading">
  <p class="title">{title}</p>
  <p class="description">{description}</p>
</div>

<style lang="scss">
  p {
    margin: 0;
  }

  .setting-item-heading {
    display: block;
    padding: 0.5em 0;
  }

  .title {
    font-size: 1.3em;
    margin-bottom: 2px;
  }

  .description {
    font-size: 0.7em;
    color: var(--text-muted);
    line-height: 1.7em;
  }
</style>
