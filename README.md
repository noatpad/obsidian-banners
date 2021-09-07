# Banners
An [Obsidian](https://obsidian.md/) plugin to add banner images to your notes!

![banners-demo](https://raw.githubusercontent.com/noatpad/obsidian-banners/master/images/banners.gif)

## Usage
Within an open note, you can use the **Add/Change banner with local image** command to select a local image as a banner for your note; or you can copy an image URL & run the **Add/Change banner from clipboard** command to paste the URL as a banner image. You can also drag the banner image to reposition the image.

If you want to remove the banner, you can run the **Remove banner** command to do just that.

## Settings
- **Banner height**: Specify how tall the banner image should be for each note.
- **Banner style**: Change how your banner looks in your notes. There are currently 2 options:
  - *Solid*: A simple, sharp-container banner image.
  - *Gradient*: A banner that fades into transparency, inspired by [this forum post](https://forum.obsidian.md/t/header-images-with-css/18917).

![solid-style](https://raw.githubusercontent.com/noatpad/obsidian-banners/master/images/solid.png)
![gradient-style](https://raw.githubusercontent.com/noatpad/obsidian-banners/master/images/gradient.png)

- **Show banner in preview embed**: Choose if the banner should be displayed in the preview embed for the *Page Preview* plugin.

![embed](https://raw.githubusercontent.com/noatpad/obsidian-banners/master/images/embed.png)

- **Embed banner height**: If **Show banner in preview embed** is on, this setting determines how tall the banner image in the embed should be.
- **Allow mobile drag**: Choose if you can adjust the banner positioning on mobile devices by dragging.
  - ***NOTE:** This setting is experimental since it acts a bit funny with the mobile app's already built-in touch gestures.*

## Compatibility
I have only tested this plugin using MacOS (Obsidian 0.12.12) and on iOS (Obsidian app 1.0.4). It probably works fine on older versions, but just a heads up.

## Installation
- **From the Community Plugins tab**:
	- Within Obsidian, search for Banners in the Community Plugins browser and install it directly
- **Manual install**:
  - Go to the latest release [here](https://github.com/noatpad/obsidian-banners/releases/latest), & download the files listed there (`main.js`, `styles.css`, & `manifest.json`)
  - Go to your vault's plugin folder (`<vault>/.obsidian/plugins`), create a folder called `obsidian-banners`, and move your files in there.
  - Reload Obsidian & enable the plugin in Settings -> Community Plugins

## FAQ
#### What are these `banner`, `banner_x`, `banner_y` fields in my note's frontmatter?
This plugin uses the frontmatter to store data about your note's banner, so it can use it for displaying in preview mode. Right now it simply keeps the filepath/URL to your banner image & the x/y positioning (which is useful when resizing the pane).

#### Is this incompatible with other plugins?
There *might* be a few cases. The banner attaches itself to the frontmatter block, based on how Obsidian's API works. The gotcha here is if a plugin has styling that clashes with Banners' styling, it may causes issues. It's rather situational, but feel free to drop an issue if you encounter something like this.

## Develop
Once you run `npm i`, you can build the files into `dist/` easily by running `npm run build`.

You can also have it watch your files and update your plugin within your vault while you develop by running `npm run dev`. Just make sure to set `TEST_VAULT` in `./rollup.config.js` to your testing vault beforehand.
## Things I *might* do down the road
- [ ] Add settings for file embeds, similar to hover-preview embed settings
- [ ] Allow content's vertical displacement height to be different than banner height (this can be nice for aesthetic choices with the *Gradient* style)
- [ ] Note-specific settings (override global style & height settings per note)
  - [ ] Drag bottom of banner to determine note-specific banner height
- [ ] Copy image files and paste as a banner
- [ ] Unsplash API integration (select from Unsplash's images straight from Obsidian)
