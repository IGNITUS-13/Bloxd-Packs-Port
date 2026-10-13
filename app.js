(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const form = $("porter-form");
  const input = $("pack-file");
  const dropzone = $("dropzone");
  const status = $("status");
  const results = $("results");
  const convertButton = $("convert-btn");
  const downloadButton = $("download-btn");

  // Conservative starter aliases. Extend this map as Bloxd texture names are verified.
  const ALIASES = {
    "grass_block_top":"grass_top", "grass_block_side":"grass_side",
    "short_grass":"grass", "fern":"fern", "large_fern_top":"large_fern_top",
    "large_fern_bottom":"large_fern_bottom", "oak_log":"log_oak",
    "oak_log_top":"log_oak_top", "spruce_log":"log_spruce",
    "birch_log":"log_birch", "jungle_log":"log_jungle",
    "acacia_log":"log_acacia", "dark_oak_log":"log_dark_oak",
    "mangrove_log":"log_mangrove", "cherry_log":"log_cherry",
    "oak_planks":"oak_planks", "oak_leaves":"leaves_oak",
    "spruce_leaves":"leaves_spruce", "birch_leaves":"leaves_birch",
    "water_still":"water", "lava_still":"lava",
    "iron_ingot":"iron_ingot", "gold_ingot":"gold_ingot",
    "diamond":"diamond", "emerald":"emerald", "apple":"apple",
    "golden_apple":"golden_apple", "bread":"bread", "bow_standby":"bow",
    "arrow":"arrow", "shield":"shield", "ender_pearl":"ender_pearl",
    "experience_bottle":"experience_bottle", "cooked_beef":"cooked_beef",
    "porkchop":"porkchop", "cooked_porkchop":"cooked_porkchop",
    "stone_sword":"stone_sword", "iron_sword":"iron_sword",
    "diamond_sword":"diamond_sword", "netherite_sword":"netherite_sword",
    "wooden_sword":"wooden_sword", "wood_sword":"wooden_sword",
    "stone_pickaxe":"stone_pickaxe", "iron_pickaxe":"iron_pickaxe",
    "diamond_pickaxe":"diamond_pickaxe", "netherite_pickaxe":"netherite_pickaxe",
    "crafting_table_top":"crafting_table_top", "crafting_table_side":"crafting_table_side",
    "furnace_front":"furnace_front", "furnace_side":"furnace_side",
    "furnace_top":"furnace_top", "chest":"chest_front"
  };

  let selectedFile = null;
  let outputBlob = null;

  function setStatus(message, kind = "") {
    status.textContent = message;
    status.className = "status" + (kind ? " " + kind : "");
  }

  function cleanPackName(value) {
    return (value || "Bloxd Pack").trim().replace(/[\\/:*?"<>|\x00-\x1f]/g, "-").replace(/\s+/g, "-").slice(0, 60) || "Bloxd-Pack";
  }

  function baseName(path) {
    return path.split("/").pop().replace(/\.(png|jpe?g|webp)$/i, "").toLowerCase();
  }

  function mapTexture(path) {
    const name = baseName(path);
    const mapped = ALIASES[name] || name;
    // Only accept plausible texture identifiers; no path components are retained.
    if (!/^[a-z0-9_.-]+$/.test(mapped)) return null;
    return mapped;
  }

  function makeCss(packName, author) {
    const safeAuthor = String(author || "Unknown").replace(/[<>]/g, "");
    return `/*
 * ${packName} — Bloxd interface style starter
 * Author: ${safeAuthor}
 *
 * Bloxd texture packs can include CSS under css/*.css.
 * Java GUI PNGs are not automatically interchangeable with Bloxd's HTML/CSS UI.
 * Selectors below are intentionally generic examples; inspect the current game UI
 * and adjust selectors to the actual classes before relying on them.
 */

/* Example: global font / UI tone */
:root {
  --ported-pack-accent: #e8b35b;
  --ported-pack-panel: rgba(20, 20, 24, 0.94);
}

/* Generic UI containers — verify these selectors against Bloxd before use. */
.WholeAppWrapper {
  font-family: Arial, sans-serif;
}

/* Example inventory styling hooks. These are placeholders, not guaranteed game selectors.
   Replace .InventoryPanel and .InventorySlot with selectors confirmed in your browser. */
.InventoryPanel {
  background-color: var(--ported-pack-panel);
  border: 1px solid rgba(232, 179, 91, 0.75);
  border-radius: 6px;
}

.InventorySlot {
  background-color: rgba(30, 30, 34, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.InventorySlot:hover {
  border-color: var(--ported-pack-accent);
}
`;
  }

  function addList(id, items, emptyText) {
    const list = $(id);
    list.replaceChildren();
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = emptyText;
      list.append(li);
      return;
    }
    items.slice(0, 300).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });
    if (items.length > 300) {
      const li = document.createElement("li");
      li.textContent = `… and ${items.length - 300} more`;
      list.append(li);
    }
  }

  input.addEventListener("change", () => {
    selectedFile = input.files && input.files[0] || null;
    $("file-name").textContent = selectedFile ? selectedFile.name : "No file selected";
    outputBlob = null;
    results.hidden = true;
    setStatus(selectedFile ? "ZIP selected. Press Convert pack to start." : "Choose a ZIP to get started.");
  });

  ["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  }));
  ["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, event => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  }));
  dropzone.addEventListener("drop", event => {
    const file = [...(event.dataTransfer?.files || [])].find(f => f.name.toLowerCase().endsWith(".zip"));
    if (!file) return setStatus("Please drop a .zip resource pack.", "error");
    selectedFile = file;
    input.value = "";
    $("file-name").textContent = file.name;
    outputBlob = null;
    results.hidden = true;
    setStatus("ZIP selected. Press Convert pack to start.");
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!selectedFile) return setStatus("Choose a Minecraft Java resource pack ZIP first.", "error");
    if (!/\.zip$/i.test(selectedFile.name)) return setStatus("The selected file must be a .zip archive.", "error");
    if (!window.JSZip) return setStatus("ZIP library did not load. Check your connection and refresh.", "error");

    convertButton.disabled = true;
    downloadButton.disabled = true;
    results.hidden = true;
    setStatus("Reading resource pack in your browser…");
    try {
      const source = await JSZip.loadAsync(selectedFile, { checkCRC32: true });
      const files = Object.values(source.files).filter(file => !file.dir && !file.name.startsWith("__MACOSX/"));
      const target = new JSZip();
      const packName = cleanPackName($("pack-name").value);
      const author = $("pack-author").value.trim();
      const mapped = [];
      const unmapped = [];
      let skipped = 0;
      const usedTargets = new Set();

      const imageFiles = files.filter(file => /\.(png|jpe?g|webp)$/i.test(file.name));
      if (!imageFiles.length) throw new Error("No PNG/JPG/WebP images were found in this ZIP.");

      for (const file of imageFiles) {
        const path = file.name.replace(/\\/g, "/");
        const match = path.match(/(?:^|\/)assets\/minecraft\/textures\/(block|blocks|item|items)\/(.+)\.(png|jpe?g|webp)$/i);
        if (!match) {
          // Also accept already flattened packs or folders named textures.
          const loose = path.match(/(?:^|\/)textures\/(.+)\.(png|jpe?g|webp)$/i);
          if (!loose) { skipped++; continue; }
          const texturePath = loose[1];
          if (texturePath.includes("/")) { skipped++; continue; }
          const name = mapTexture(path);
          if (!name) { unmapped.push(path); continue; }
          await addTexture(file, name, target, packName, mapped, unmapped, usedTargets);
          continue;
        }

        const category = match[1].toLowerCase();
        const relative = match[2];
        // Skip animated/connected/variant subfolders and GUI sprites; report them clearly.
        if (relative.includes("/") || category === "block" || category === "blocks") {
          if (relative.includes("/")) { skipped++; continue; }
        }
        const name = mapTexture(path);
        if (!name) { unmapped.push(path); continue; }
        await addTexture(file, name, target, packName, mapped, unmapped, usedTargets);
      }

      if ($("include-css").checked) {
        target.file(`${packName}/css/ported-interface.css`, makeCss(packName, author));
      }
      target.file(`${packName}/README.txt`,
        `${packName}\nAuthor: ${author || "Unknown"}\n\nConverted by Bloxd Packs Port (beta).\n\nIMPORTANT:\n- Only recognized flat block/item images are copied into textures/.\n- Some source filenames differ from Bloxd's filenames and require manual mapping.\n- Java GUI sprites, models, animations, shaders, and OptiFine features are not converted automatically.\n- CSS selectors for the inventory are examples/placeholders and may need adjustment for the current Bloxd UI.\n- Review the conversion report and test the pack in Bloxd before sharing.\n`);

      outputBlob = await target.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
      $("result-title").textContent = packName;
      $("mapped-count").textContent = String(mapped.length);
      $("unmapped-count").textContent = String(unmapped.length);
      $("other-count").textContent = String(skipped);
      $("report-note").textContent = "The pack is a best-effort conversion. Verify filenames against Bloxd's supported texture list. GUI/inventory art is not automatically converted from Java sprites; edit css/ported-interface.css for styling.";
      addList("mapped-list", mapped, "No textures were mapped.");
      addList("unmapped-list", unmapped, "No unmapped images were found.");
      results.hidden = false;
      downloadButton.disabled = false;
      setStatus("Conversion finished. Download the ZIP and test it in Bloxd.", "success");
    } catch (error) {
      console.error(error);
      setStatus("Conversion failed: " + (error?.message || "Unknown error"), "error");
    } finally {
      convertButton.disabled = false;
    }
  });

  async function addTexture(file, name, target, packName, mapped, unmapped, usedTargets) {
    const targetName = name + ".png";
    if (usedTargets.has(targetName)) {
      unmapped.push(file.name + " (duplicate target name: " + targetName + ")");
      return;
    }
    usedTargets.add(targetName);
    const blob = await file.async("blob");
    // Bloxd texture packs conventionally use PNG. Keep PNGs untouched; convert other formats only if browser canvas supports them.
    if (/\.png$/i.test(file.name)) {
      target.file(packName + "/textures/" + targetName, blob);
    } else {
      try {
        const png = await toPng(blob);
        target.file(packName + "/textures/" + targetName, png);
      } catch {
        unmapped.push(file.name + " (could not convert to PNG)");
        usedTargets.delete(targetName);
        return;
      }
    }
    mapped.push(file.name + " → " + packName + "/textures/" + targetName);
  }

  function toPng(blob) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext("2d").drawImage(img, 0, 0);
          canvas.toBlob(result => result ? resolve(result) : reject(new Error("PNG conversion failed")), "image/png");
        } catch (error) { reject(error); }
        finally { URL.revokeObjectURL(url); }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Unsupported image")); };
      img.src = url;
    });
  }

  downloadButton.addEventListener("click", () => {
    if (!outputBlob) return;
    const name = cleanPackName($("pack-name").value);
    const url = URL.createObjectURL(outputBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name + "-bloxd.zip";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();