<script lang="ts">
  import { flushImageCache } from 'src/banner/utils';
  import UpdateLegacySourceModal from 'src/modals/UpdateLegacySourceModal';
  import ButtonSetting from './components/ButtonSetting.svelte';
  import CssLengthFragment from './components/CSSLengthFragment.svelte';
  import Depends from './components/Depends.svelte';
  import InputSetting from './components/InputSetting.svelte';
  import SelectSetting from './components/SelectSetting.svelte';
  import Header from './components/SettingHeader.svelte';
  import ToggleSetting from './components/ToggleSetting.svelte';
  import { settings } from './store';

  let isImageCacheBtnDisabled = false;

  const openLegacySourceModal = () => new UpdateLegacySourceModal().open();
  const handleImageCacheButton = () => {
    flushImageCache();
    isImageCacheBtnDisabled = true;
  };

  $: ({
    frontmatterField,
    headerHorizontalAlignment,
    headerVerticalAlignment
  } = $settings);
</script>

<!-- General banner settings -->
<Header
  title="Banners"
  description="A nice, lil' thing to add some flair to your notes :)"
  big
/>
<SelectSetting key="style">
  <span slot="name">Banner style</span>
  <span slot="description">Set a style for all of your banners</span>
</SelectSetting>
<InputSetting key="height" numOrStr>
  <span slot="name">Banner height</span>
  <span slot="description">
    Set how big the banner should be in pixels.
    <CssLengthFragment examples />
  </span>
</InputSetting>
<InputSetting key="mobileHeight" numOrStr>
  <span slot="name">Mobile banner height</span>
  <span slot="description">
    Set how big the banner should be on mobile devices.
    <CssLengthFragment />
  </span>
</InputSetting>
<ToggleSetting key="adjustWidthToReadableLineWidth">
  <span slot="name">Adjust width to readable line length</span>
  <span slot="description">
    Adjust the banner width to only be as wide as the <em>readable line length</em>, which is used
    by Obsidian's <b>Readable line length</b> setting. It is recommended to toggle this together
    with that setting.
  </span>
</ToggleSetting>
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
  <InputSetting key="internalEmbedHeight" numOrStr>
    <span slot="name">Internal embed banner height</span>
    <span slot="description">
      Set how big the banner should be within an internal embed.
      <CssLengthFragment />
    </span>
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
  <InputSetting key="popoverHeight" numOrStr>
    <span slot="name">Preview popover banner height</span>
    <span slot="description">
      Set how big the banner should be within the preview popover.
      <CssLengthFragment />
    </span>
  </InputSetting>
  <ToggleSetting key="enableDragInPopover">
    <span slot="name">Enable drag in preview popover</span>
    <span slot="description">
      Allow banner dragging from within the preview popover.
      This may act a bit finicky though.
    </span>
  </ToggleSetting>
</Depends>

<ToggleSetting key="enableLockButton">
  <span slot="name">Enable lock button</span>
  <span slot="description">
    Enable and display the lock button on the corner of a banner. When combined with the
    <b>Banner drag modifier key</b> setting, it might be desirable to disable this.
  </span>
</ToggleSetting>

<!-- Banner Headers -->
<Header
  title="Banner Headers"
  description="Kinda like inline titles, but with a bit of pizazz"
/>
<InputSetting key="headerSize" numOrStr>
  <span slot="name">Header font size</span>
  <span slot="description">
    Set the font size of the banner header.
    <CssLengthFragment period />
    If left blank, it will use Obsidian's built-in font size for inline titles.
    <em>Though personally, I like setting it to <code>2.5em</code></em>
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
  <InputSetting key="headerHorizontalTransform" numOrStr>
    <span slot="name">Custom horizontal alignment</span>
    <span slot="description">
      Set an offset relative to the left side of the note.
      <CssLengthFragment />
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
  <InputSetting key="headerVerticalTransform" numOrStr>
    <span slot="name">Custom vertical alignment</span>
    <span slot="description">
      Set an offset relative to the bottom edge of the banner, if any.
      <CssLengthFragment />
    </span>
  </InputSetting>
</Depends>
<ToggleSetting key="useHeaderByDefault">
  <span slot="name">Display header by default</span>
  <span slot="description">
    Display a banner header without having to define a <code>{frontmatterField}_header</code>
    property. This will essentially make it behave like Obsidian's native inline title feature.
    <br />
    You can override this setting at an individual note level by having an empty
    <code>{frontmatterField}_header</code> property too.
  </span>
</ToggleSetting>
<Depends on="useHeaderByDefault">
  <InputSetting key="defaultHeaderValue">
    <span slot="name">Default header value</span>
    <span slot="description">
      The default header text when the setting above is in effect for a given note.
      <br />
      Any text is allowed, but you can also combine it with <code>{'{{property}}'}</code> to
      reference a property in your note, as well as <code>{'{{filename}}'}</code> to use
      the file's name. You can also set fallback keys with the
      <code>{'{{property1, property2, property3}}'} syntax.</code>
    </span>
  </InputSetting>
</Depends>

<!-- Banner Icons -->
<Header
  title="Banner Icons"
  description="Give a lil' notion of what your note is about"
/>
<InputSetting key="iconSize" numOrStr>
  <span slot="name">Icon size</span>
  <span slot="description">
    Set the size of the banner icon.
    <CssLengthFragment period />
    <br />
    <span><em>Note:</em> this setting stacks with the <b>Header font size</b> setting above</span>
  </span>
</InputSetting>
<ToggleSetting key="useTwemoji">
  <span slot="name">Use Twemoji</span>
  <span slot="description">
    Use <a href="https://github.com/jdecked/twemoji" rel="noopener noreferrer">Twemoji</a>
    instead of your device's native emoji set. Makes emojis consistent across devices
  </span>
</ToggleSetting>

<!-- Local Image Modal -->
<Header
  title="Local Image Modal"
  description={
    'For the modal that shows when you run the "Add/Change banner with local image" command'
  }
/>
<ToggleSetting key="showPreviewInLocalModal">
  <span slot="name">Show preview images</span>
  <span slot="description">Display a preview image of the suggested banner images</span>
</ToggleSetting>
<InputSetting key="localModalSuggestionLimit" type="number">
  <span slot="name">Suggestions limit</span>
  <span slot="description">
    Limit how many suggestions to display in this modal.
    <br />
    <em>Note:</em> setting a high number while <b>Show preview images</b> setting is toggled on
    may cause slowdowns
  </span>
</InputSetting>
<InputSetting key="bannersFolder">
  <span slot="name">Banners folder</span>
  <span slot="description">
    Select a folder to exclusively search for banner files in. If empty, it will search
    the entire vault for image files
  </span>
</InputSetting>

<!-- Extras -->
<Header
  title="Extras"
  description="'Cause I do not know where else to put these..."
/>
<ToggleSetting key="autoDownloadPastedBanners">
  <span slot="name">Auto-download pasted banners</span>
  <span slot="description">
    If enabled, the <b>Paste banner from clipboard</b> command will automatically download the
    image from the URL into your vault and link it as an internal file. Great if you want to
    keep some banners you found online!
    <br />
    If you want to download them on a case-by-case basis though, you can use the
    <b>Download banner in note to vault</b> command for a note with a remote banner URL.
  </span>
</ToggleSetting>
<ButtonSetting text="Update banner sources" onClick={openLegacySourceModal}>
  <span slot="name">Update legacy source syntax</span>
  <span slot="description">
    If you used Banners 1.x in the past, you may need to update the syntax for your banners'
    sources across your notes. This will help you do that automatically in one go.
  </span>
</ButtonSetting>
<ButtonSetting
  text="Flush banner cache"
  disabled={isImageCacheBtnDisabled}
  onClick={handleImageCacheButton}
>
  <span slot="name">Flush banner image cache</span>
  <span slot="description">
    This plugin uses a cache to quickly return banner images, which is especially useful with
    remote images. While this cache resets whenever you reopen/reload Obsidian, you can flush
    the cache here if you're running into an issue with it.
  </span>
</ButtonSetting>
