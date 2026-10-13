# Bloxd Packs Port

A browser-based MVP that converts a Minecraft Java resource-pack ZIP into a starter Bloxd.io texture-pack ZIP.

## Run it

Open `index.html` in a browser or enable GitHub Pages for this repository. The app uses JSZip from jsDelivr, so an internet connection is needed to load that library. ZIP processing happens locally in the browser; files are not uploaded to a server.

## Current features

- Accepts a Java resource-pack ZIP.
- Looks for images under `assets/minecraft/textures/block/` and `item/`, plus a simple flat `textures/` folder.
- Renames recognized textures using a conservative alias table in `app.js`.
- Exports a Bloxd-style folder with `textures/`, optional `css/ported-interface.css`, and a README.
- Shows mapped, unmapped, and skipped-file reports.

## Important limitations

This is a first MVP, not a complete converter. Minecraft Java and Bloxd.io use different texture names and asset/UI systems. A successful ZIP export does not guarantee that every texture is recognized by Bloxd.

- Many Java texture names will need an explicit mapping to Bloxd's supported names.
- Atlases, animated textures, connected textures, OptiFine features, shaders, fonts, models, and blockstate/model JSON are not converted.
- Java GUI textures (inventory panels, slot frames, hotbar, icons) are image sprites, while Bloxd's inventory is rendered through web UI/CSS. The tool therefore provides an editable CSS starter rather than pretending Java GUI images can be converted automatically. The CSS selectors are examples/placeholders and must be verified against Bloxd's current UI.
- PNG assets are kept as-is. JPG/WebP assets are converted to PNG where the browser can decode them.
- This tool does not include Minecraft or Bloxd assets. Only assets supplied by the user are processed.

## Next development steps

1. Build a verified mapping list from Bloxd's supported texture names.
2. Add a custom mapping JSON upload/editor.
3. Add preview thumbnails and dimension checks.
4. Add a separate inventory CSS editor with tested Bloxd selectors.
5. Add better support for nested asset paths, animation metadata, and pack.mcmeta validation.

## Development

No build step is required. Files: `index.html`, `style.css`, `app.js`.

## Disclaimer

Minecraft is a trademark of Microsoft/Mojang and Bloxd.io is a separate game. This community tool is not affiliated with either.
