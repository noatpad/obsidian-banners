<script lang="ts">
  import type { MouseEventHandler } from 'svelte/elements';

  export let checked: boolean;
  export let onClick: MouseEventHandler<HTMLDivElement>;
  export let id: string | undefined = undefined;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- input only covers part of the toggle element. on:click here covers the rest -->
<div
  class="checkbox-container"
  class:is-enabled={checked}
  on:click={onClick}
>
  <input
    type="checkbox"
    value={checked}
    {id}
    tabindex="0"
  />
</div>
