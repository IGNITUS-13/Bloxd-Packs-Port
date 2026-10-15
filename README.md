# Bloxd Packs Port

Herramienta de navegador para portar recursos de packs de Minecraft Java a una estructura de pack para Bloxd.io. El procesamiento ocurre localmente; no hace falta subir un pack de referencia.

## Comportamiento actual

- Copia las texturas compatibles de bloques a textures/.
- Solo crea modelos GLB de ítems cuando el nombre tiene un equivalente explícito en el catálogo de modelos de Bloxd usado para esta herramienta. No crea modelos para spider_eye, golden_apple ni otros ítems sin equivalente confirmado.
- El generador GLB actual crea una geometría prismática sencilla con la textura incrustada; es una aproximación y puede necesitar mejoras para parecerse a los modelos originales de Bloxd.
- Si el pack Java incluye las seis imágenes panorama_0.png a panorama_5.png, las exporta a skyBoxes/default/ con los nombres px.png, nx.png, py.png, ny.png, pz.png y nz.png.
- También intenta convertir panoramas equirectangulares 2:1 encontrados en carpetas de cielo a seis caras de cubemap.
- Puede añadir css/ported-interface.css con selectores de ejemplo.

## Limitaciones

- Los nombres de destino y modelos deben estar confirmados para Bloxd; no todos los ítems de Minecraft existen en Bloxd.
- Las seis imágenes panorama del menú de Java se usan como caras del cubemap; la orientación exacta debe comprobarse en juego.
- Los modelos GLB son prismas texturizados aproximados, no reconstrucciones fieles de cada objeto.
- Los sprites de GUI de Minecraft no se convierten automáticamente en CSS de inventario de Bloxd.

## Uso

Abre index.html o la página de GitHub Pages, selecciona el ZIP de Minecraft Java, pulsa Convertir y descarga el ZIP generado. JSZip se carga desde jsDelivr, por lo que hace falta conexión a internet para iniciar la herramienta.

## Estructura de salida

- textures/
- models/
- css/
- skyBoxes/default/ con las seis caras px.png, nx.png, py.png, ny.png, pz.png y nz.png cuando se detecta un skybox compatible.

Proyecto comunitario no afiliado a Mojang/Microsoft ni a Bloxd.io.
