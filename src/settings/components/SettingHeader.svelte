<script lang="ts">
  export let title: string;
  export let description: string;
  export let big = false;
</script>

<div class="setting-item setting-item-heading">
  <p class="title" class:big>{title}</p>
  <p class="description">{description}</p>
</div>

<style lang="scss">
  p { margin: 0; }

  .setting-item-heading {
    display: block;
    padding: 0.5em 0;
  }

  .title {
    font-size: 1.3em;
    margin-bottom: 2px;

    &.big { font-size: 1.6em; }
  }

  .description {
    font-size: 0.7em;
    color: var(--text-muted);
    line-height: 1.7em;
  }
</style>
