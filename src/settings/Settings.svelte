<script lang="ts">
  import Header from './Header.svelte';
  import SelectSetting from './SelectSetting.svelte';
  import settings from './store';
  import TextSetting from './TextSetting.svelte';
  import ToggleSetting from './ToggleSetting.svelte';

  $: ({ showInInternalEmbed, showInPopover } = $settings);
</script>

<Header title="Banners" description="A nice lil' thing to add some flair to your notes :)" />
<TextSetting key="height">
  <span slot="name">Banner height</span>
  <span slot="description">Set how big the banner should be in pixels</span>
</TextSetting>
<SelectSetting key="style">
  <span slot="name">Banner style</span>
  <span slot="description">Set a style for all of your banners</span>
</SelectSetting>
<ToggleSetting key="showInInternalEmbed">
  <span slot="name">Show in internal embed</span>
  <span slot="description">
    Display the banner in the internal file embed. This is the embed that appears when you
    write <code>![[file]]</code> in a file.
    <br/>
    <em>Note:</em> You might need to reload Obsidian after toggling this setting
  </span>
</ToggleSetting>
{#if showInInternalEmbed}
  <TextSetting key="internalEmbedHeight">
    <span slot="name">Internal embed banner height</span>
    <span slot="description">Set how big the banner should be within an internal embed</span>
  </TextSetting>
{/if}
<ToggleSetting key="showInPopover">
  <span slot="name">Show in preview popover</span>
  <span slot="description">
    Display the banner in the page preview popover. This is the preview that appears from the
    <em>Page Preview</em> core plugin.
  </span>
</ToggleSetting>
{#if showInPopover}
  <TextSetting key="popoverHeight">
    <span slot="name">Preview popover banner height</span>
    <span slot="description">Set how big the banner should be within the preview popover.</span>
  </TextSetting>
{/if}
<SelectSetting key="bannerDragModifier">
  <span slot="name">Banner drag modifier key</span>
  <span slot="description">
    Set a modifier key that must be used to drag a banner.
    <br />
    For example, setting it to <b>⇧ Shift</b> means you must hold down <b>Shift</b> in order to
    move a banner by dragging it. This can help avoid accidental banner movements.
  </span>
</SelectSetting>
