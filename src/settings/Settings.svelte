<script lang="ts">
  import Header from './Header.svelte';
  import SelectSetting from './SelectSetting.svelte';
  import TextSetting from './TextSetting.svelte';
  import ToggleSetting from './ToggleSetting.svelte';
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
    Display the banner in the internal file embed.
    <br />
    This is the embed that appears when you write <code>![[file]]</code> in a file
  </span>
</ToggleSetting>
