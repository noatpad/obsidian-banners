<script lang="ts">
  export let examples = false;
  export let period = false;
</script>

<!-- eslint-disable max-len -->
This can be any valid number or
<a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths" rel="noopener noreferrer">CSS length value</a>{#if period}.{/if}
{#if examples}
  such as <code>10px</code>, <code>-30%</code>, <code>calc(1em + 10px)</code>, and so on...
{/if}
