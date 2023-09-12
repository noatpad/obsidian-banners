<script lang="ts">
  import { getSetting } from '..';
  import settings from '../store';
  import Depends from './Depends.svelte';
  import InputSetting from './InputSetting.svelte';
  import SelectSetting from './SelectSetting.svelte';
  import Header from './SettingHeader.svelte';
  import ToggleSetting from './ToggleSetting.svelte';

  $: ({
    frontmatterField: ff,
    headerHorizontalAlignment: hha,
    headerVerticalAlignment: hva
  } = $settings);
  $: frontmatterField = getSetting('frontmatterField', ff);
  $: headerHorizontalAlignment = getSetting('headerHorizontalAlignment', hha);
  $: headerVerticalAlignment = getSetting('headerVerticalAlignment', hva);
</script>

<!-- eslint-disable max-len -->
<!-- General banner settings -->
<Header
  title="Banners"
  description="A nice, lil' thing to add some flair to your notes :)"
  big
/>
<InputSetting key="height" type="number">
  <span slot="name">Banner height</span>
  <span slot="description">Set how big the banner should be in pixels</span>
</InputSetting>
<InputSetting key="mobileHeight" type="number">
  <span slot="name">Mobile banner height</span>
  <span slot="description">
    Set how big the banner should be on mobile devices. If left blank, it will inherit the
    <b>Banner height</b> setting above.
  </span>
</InputSetting>
<SelectSetting key="style">
  <span slot="name">Banner style</span>
  <span slot="description">Set a style for all of your banners</span>
</SelectSetting>
<SelectSetting key="bannerDragModifier">
  <span slot="name">Banner drag modifier key</span>
  <span slot="description">
    Set a modifier key that must be used to drag a banner.
    <br />
    For example, setting it to <b>⇧ Shift</b> means you must hold down <b>Shift</b> in order to
    move a banner by dragging it. This can help avoid accidental banner movements.
  </span>
</SelectSetting>
<InputSetting key="frontmatterField">
  <span slot="name">Property field name</span>
  <span slot="description">
    Set a prefix field name to be used for banner data in the frontmatter/<em>Properties</em> view.
    <br />
    For example, using <code>{frontmatterField}</code> means that banner data will be extracted
    from fields like <code>{frontmatterField}</code>, <code>{frontmatterField}_x</code>,
    <code>{frontmatterField}_icon</code>, etc.
  </span>
</InputSetting>

<!-- Banners in internal embeds  -->
<ToggleSetting key="showInInternalEmbed">
  <span slot="name">Show in internal embed</span>
  <span slot="description">
    Display the banner in the internal file embed. This is the embed that appears when you
    write <code>![[file]]</code> in a file.
    <br/>
    <b>Note:</b> You might need to reload Obsidian after toggling this setting
  </span>
</ToggleSetting>
<Depends on="showInInternalEmbed">
  <InputSetting key="internalEmbedHeight" type="number">
    <span slot="name">Internal embed banner height</span>
    <span slot="description">Set how big the banner should be within an internal embed</span>
  </InputSetting>
  <ToggleSetting key="enableDragInInternalEmbed">
    <span slot="name">Enable drag in internal embed</span>
    <span slot="description">Allow banner dragging from within an internal embed</span>
  </ToggleSetting>
</Depends>

<!-- Banners in preview popovers -->
<ToggleSetting key="showInPopover">
  <span slot="name">Show in preview popover</span>
  <span slot="description">
    Display the banner in the page preview popover. This is the preview that appears from the
    <em>Page Preview</em> core plugin.
  </span>
</ToggleSetting>
<Depends on="showInPopover">
  <InputSetting key="popoverHeight" type="number">
    <span slot="name">Preview popover banner height</span>
    <span slot="description">Set how big the banner should be within the preview popover</span>
  </InputSetting>
  <ToggleSetting key="enableDragInPopover">
    <span slot="name">Enable drag in preview popover</span>
    <span slot="description">
      Allow banner dragging from within the preview popover.
      This may act a bit finicky though.
    </span>
  </ToggleSetting>
</Depends>

<!-- Banner Headers -->
<Header
  title="Banner Headers"
  description="Kinda like inline titles, but with a bit of pizazz"
/>
<InputSetting key="headerSize">
  <span slot="name">Header font size</span>
  <span slot="description">
    Set the font size of the banner header. This can be any valid
    <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths" target="_blank" rel="noopener noreferrer">CSS length value</a>,
    such as <code>10px</code>, <code>-30%</code>, <code>calc(1em + 10px)</code>, and so on...
  </span>
</InputSetting>
<SelectSetting key="headerDecor">
  <span slot="name">Header decoration</span>
  <span slot="description">
    Add a shadow or border on the header elements to help with readability.
  </span>
</SelectSetting>
<SelectSetting key="headerHorizontalAlignment">
  <span slot="name">Horizontal alignment</span>
  <span slot="description">Align the header horizontally.</span>
</SelectSetting>
<Depends on={headerHorizontalAlignment === 'custom'}>
  <InputSetting key="headerHorizontalTransform">
    <span slot="name">Custom horizontal alignment</span>
    <span slot="description">
      Set an offset relative to the left side of the note. This can be any valid
      <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths" target="_blank" rel="noopener noreferrer">CSS length value</a>,
      such as <code>10px</code>, <code>-30%</code>, <code>calc(1em + 10px)</code>, and so on...
    </span>
  </InputSetting>
</Depends>
<SelectSetting key="headerVerticalAlignment">
  <span slot="name">Vertical alignment</span>
  <span slot="description">
    Align the header vertically relative to a banner, if any. If there's no banner, this setting
    has no effect.
  </span>
</SelectSetting>
<Depends on={headerVerticalAlignment === 'custom'}>
  <InputSetting key="headerVerticalTransform">
    <span slot="name">Custom horizontal alignment</span>
    <span slot="description">
      Set an offset relative to the bottom edge of the banner, if any. This can be any valid
      <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths" target="_blank" rel="noopener noreferrer">CSS length value</a>,
      such as <code>10px</code>, <code>-30%</code>, <code>calc(1em + 10px)</code>, and so on...
    </span>
  </InputSetting>
</Depends>

<!-- Banner Icons -->
<Header
  title="Banner Icons"
  description="Give a lil' notion of what your note is about"
/>
<InputSetting key="iconSize">
  <span slot="name">Icon size</span>
  <span slot="description">
    Set the size of the banner icon. This can be any valid
    <a href="https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units#lengths" target="_blank" rel="noopener noreferrer">CSS length value</a>,
    such as <code>10px</code>, <code>-30%</code>, <code>calc(1em + 10px)</code>, and so on...
    <br />
    <span><em>Note:</em> this setting stacks with the <b>Header font size</b> setting above</span>
  </span>
</InputSetting>
<ToggleSetting key="useTwemoji">
  <span slot="name">Use Twemoji</span>
  <span slot="description">
    Use <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noopener noreferrer">Twemoji</a>
    instead of your device's native emoji set. Makes emojis consistent across devices
  </span>
</ToggleSetting>

<!-- Local Image Modal -->
<Header
  title="Local Image Modal"
  description={'For the modal that shows when you run the "Add/Change banner with local image" command'}
/>
<ToggleSetting key="showPreviewInLocalModal">
  <span slot="name">Show preview images</span>
  <span slot="description">Display a preview image of the suggested banner images</span>
</ToggleSetting>
<InputSetting key="localModalSuggestionLimit">
  <span slot="name">Suggestions limit</span>
  <span slot="description">
    Limit how many suggestions to display in this modal.
    <br />
    <em>Note:</em> setting a high number while <b>Show preview images</b> setting is toggled on
    may cause slowdowns
  </span>
</InputSetting>
