# Bloxd Packs Port

Herramienta de navegador para portar recursos compatibles de packs de Minecraft Java a una estructura de pack para Bloxd.io. El procesamiento ocurre localmente; no necesitas subir un pack de referencia de Bloxd.

## Funciones implementadas

- Extrae texturas de bloques y las guarda en textures/.
- Para imágenes de ítems en assets/minecraft/textures/item/ o items/, genera un archivo .glb con la textura incrustada y una geometría prismática sencilla en models/. Es un modelo aproximado 3D generado desde la imagen, no una reconstrucción exacta del objeto.
- Detecta imágenes bajo assets/minecraft/optifine/sky/ (o assets/minecraft/sky/) cuyos nombres indican cielo/panorama y, si tienen relación 2:1, las convierte en seis PNG de cubemap en skyBoxes/default/: px.png, nx.png, py.png, ny.png, pz.png, nz.png.
- Puede añadir un CSS editable de ejemplo en css/ported-interface.css.
- Muestra informes de recursos procesados y omitidos.

## Limitaciones importantes

- Los modelos GLB son prismas texturizados automáticos. No reconstruyen la forma real de espadas, herramientas, armaduras u objetos complejos; la geometría necesita reglas específicas por tipo de ítem para mayor fidelidad.
- Solo se convierten panoramas equirectangulares 2:1 detectados en rutas de cielo reconocidas. Los formatos de cielo por capas, animados u otros diseños no se convierten automáticamente.
- Los sprites de GUI de Minecraft no se convierten automáticamente en CSS de inventario de Bloxd. Los selectores CSS son ejemplos y deben probarse.
- Los nombres de textura de Java no siempre coinciden con los que Bloxd admite; el reporte identifica lo que se pudo exportar, pero no garantiza compatibilidad total dentro del juego.
- Los archivos de animación .mcmeta, atlas, shaders, OptiFine y modelos JSON no se interpretan para generar modelos.

## Uso

Abre index.html o la página de GitHub Pages, elige el ZIP Java, pon el nombre del pack y pulsa Convertir. Descarga el ZIP resultante y prueba los recursos en Bloxd.io.

Se usa JSZip desde jsDelivr, así que hace falta conexión a internet para cargar la librería.

## Estructura

- textures/ — texturas portadas
- models/ — modelos GLB aproximados para ítems
- skyBoxes/default/ — caras del cubemap generado
- css/ — CSS de ejemplo opcional

## Aviso

Minecraft es una marca de Microsoft/Mojang y Bloxd.io es un juego independiente. Este proyecto comunitario no está afiliado a ninguno.
