(() => {
"use strict";
const $=id=>document.getElementById(id), form=$("porter-form"), input=$("pack-file"), status=$("status"), results=$("results"), convert=$("convert-btn"), download=$("download-btn");
let selected=null, output=null;
const aliases={"short_grass":"grass","grass_block_top":"grass_top","grass_block_side":"grass_side","oak_log":"log_oak","oak_log_top":"log_oak_top","spruce_log":"log_spruce","birch_log":"log_birch","jungle_log":"log_jungle","acacia_log":"log_acacia","dark_oak_log":"log_dark_oak","water_still":"water","lava_still":"lava","bow_standby":"bow","cooked_beef":"beef","wood_sword":"wooden_sword","wood_pickaxe":"wooden_pickaxe","wood_axe":"wooden_axe","wood_shovel":"wooden_shovel","wood_hoe":"wooden_hoe"};
const setStatus=(s,k="")=>{status.textContent=s;status.className="status"+(k?" "+k:"");};
const clean=s=>(s||"Bloxd-Pack").trim().replace(/[\/:*?"<>|\x00-\x1f]/g,"-").replace(/\s+/g,"-").slice(0,60)||"Bloxd-Pack";
const stem=p=>p.split("/").pop().replace(/\.(png|jpe?g|webp)$/i,"").toLowerCase();
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
function mapName(path,targets){let n=aliases[stem(path)]||stem(path);if(targets){if(targets.has(n.toLowerCase()))return n;let hits=[...targets].filter(t=>norm(t)===norm(n));return hits.length===1?hits[0]:null;}return /^[a-z0-9_. -]+$/i.test(n)?n:null;}
function css(name,author){return "/* "+name+" — CSS de ejemplo. Verifica los selectores con la interfaz actual de Bloxd. Autor: "+String(author||"Unknown").replace(/[<>]/g,"")+" */\n:root{--ported-accent:#b58cff;--ported-panel:rgba(20,20,24,.94)}\n/* Selectores de ejemplo, no garantizados */\n.InventoryPanel{background:var(--ported-panel);border:1px solid var(--ported-accent)}\n.InventorySlot{background:rgba(30,30,34,.9);border:1px solid rgba(255,255,255,.12)}\n.InventorySlot:hover{border-color:var(--ported-accent)}\n";}
function list(id,items,empty){let el=$(id);el.replaceChildren();if(!items.length){let li=document.createElement("li");li.textContent=empty;el.append(li);return;}items.slice(0,300).forEach(v=>{let li=document.createElement("li");li.textContent=v;el.append(li);});if(items.length>300){let li=document.createElement("li");li.textContent="… y "+(items.length-300)+" más";el.append(li);}}
input.addEventListener("change",()=>{selected=input.files?.[0]||null;$("file-name").textContent=selected?.name||"Ningún pack Java seleccionado";output=null;results.hidden=true;});

["dragenter","dragover"].forEach(t=>$("dropzone").addEventListener(t,e=>{e.preventDefault();$("dropzone").classList.add("dragging");}));
["dragleave","drop"].forEach(t=>$("dropzone").addEventListener(t,e=>{e.preventDefault();$("dropzone").classList.remove("dragging");}));
$("dropzone").addEventListener("drop",e=>{let f=[...(e.dataTransfer?.files||[])].find(f=>f.name.toLowerCase().endsWith(".zip"));if(!f)return setStatus("Suelta un archivo ZIP válido.","error");selected=f;input.value="";$("file-name").textContent=f.name;});
form.addEventListener("submit",async e=>{
e.preventDefault();if(!selected)return setStatus("Primero elige el ZIP de Minecraft Java.","error");if(!window.JSZip)return setStatus("No cargó la librería ZIP. Revisa tu conexión y recarga.","error");
convert.disabled=true;download.disabled=true;results.hidden=true;setStatus("Leyendo los ZIP en tu navegador…");
try{
const source=await JSZip.loadAsync(selected,{checkCRC32:true}),files=Object.values(source.files).filter(f=>!f.dir&&!f.name.startsWith("__MACOSX/")),target=new JSZip(),name=clean($("pack-name").value),author=$("pack-author").value.trim(),mapped=[],unmapped=[],used=new Set();let skipped=0,counts={models:0,css:0,skyBoxes:0},targets=null;
// No se requiere ni se importa un pack de referencia de Bloxd.
const images=files.filter(f=>/\.(png|jpe?g|webp)$/i.test(f.name));if(!images.length)throw Error("No se encontraron imágenes PNG/JPG/WebP.");
// Solo se generan modelos cuyo nombre existe en el catálogo de modelos del pack de referencia PandaFault.
const itemModels=new Map([
 ["apple","Apple"],["bread","Bread"],["coal","Coal"],["diamond","Diamond"],["diamond_sword","Diamond Sword"],["diamond_axe","Diamond Axe"],["diamond_pickaxe","Diamond Pickaxe"],["diamond_hoe","Diamond Hoe"],["diamond_shovel","Diamond Spade"],["diamond_spade","Diamond Spade"],["iron_sword","Iron Sword"],["iron_axe","Iron Axe"],["iron_pickaxe","Iron Pickaxe"],["iron_hoe","Iron Hoe"],["iron_shovel","Iron Spade"],["iron_spade","Iron Spade"],["golden_sword","Gold Sword"],["gold_sword","Gold Sword"],["golden_axe","Gold Axe"],["gold_axe","Gold Axe"],["golden_pickaxe","Gold Pickaxe"],["gold_pickaxe","Gold Pickaxe"],["golden_hoe","Gold Hoe"],["gold_hoe","Gold Hoe"],["wooden_sword","Wood Sword"],["wood_sword","Wood Sword"],["wooden_axe","Wood Axe"],["wood_axe","Wood Axe"],["wooden_pickaxe","Wood Pickaxe"],["wood_pickaxe","Wood Pickaxe"],["wooden_hoe","Wood Hoe"],["wood_hoe","Wood Hoe"],["stone_sword","Stone Sword"],["stone_axe","Stone Axe"],["stone_pickaxe","Stone Pickaxe"],["stone_hoe","Stone Hoe"],["stone_shovel","Stone Spade"],["stone_spade","Stone Spade"],["stick","Stick"],["arrow","Arrow"],["bow","Wood Bow"],["bucket","Bucket"],["water_bucket","Water Bucket"],["lava_bucket","Lava Bucket"],["carrot","Carrot"],["baked_potato","Baked Potato"],["potato","Raw Potato"],["bone","Bone"],["bone_meal","Bone Meal"],["wheat","Wheat"],["melon_slice","Melon Slice"],["watermelon_slice","Watermelon Slice"],["pumpkin_pie","Pumpkin Pie"],["beetroot","Beetroot"],["mushroom_stew","Mushroom Soup"],["snowball","Snowball"],["book","Book"],["compass","Compass"],["rotten_flesh","Rotten Flesh"],["raw_iron","Raw Iron"],["raw_gold","Raw Gold"],["iron_ingot","Iron Bar"],["gold_ingot","Gold Bar"],["potion","Potion"],["shears","Shears"],["name_tag","Name Tag"],["leather","Leather"],["saddle","Saddle"],["cooked_beef","Steak"],["beef","Raw Beef"],["cooked_porkchop","Cooked Porkchop"],["porkchop","Raw Porkchop"],["cooked_mutton","Cooked Mutton"],["mutton","Raw Mutton"]
]);
const normalizeItem=s=>s.toLowerCase().replace(/[^a-z0-9]/g,"");
const resolveItemModel=s=>{if(itemModels.has(s))return itemModels.get(s);const n=normalizeItem(s);for(const [key,value] of itemModels)if(normalizeItem(key)===n)return value;return null;};
// Java title panorama ya viene en seis caras: convertirlas al layout exacto skyBoxes/default/*.png.
const panoramaFaces=images.map(f=>({f,m:f.name.replace(/\\/g,"/").match(/(?:^|\/)panorama_([0-5])\.png$/i)})).filter(x=>x.m);
if(panoramaFaces.length===6){
 const faceNames=["px","nx","py","ny","pz","nz"];
 for(const {f,m} of panoramaFaces){const face=faceNames[Number(m[1])];target.file("skyBoxes/default/"+face+".png",await f.async("uint8array"));counts.skyBoxes++;used.add("skyface:"+f.name);}
 mapped.push("Minecraft title panorama → skyBoxes/default/{px,nx,py,ny,pz,nz}.png");
}
for(const f of images){const p=f.name.replace(/\\/g,"/"),m=p.match(/(?:^|\/)assets\/minecraft\/textures\/(?:block|blocks|item|items)\/(.+)\.(png|jpe?g|webp)$/i),loose=p.match(/(?:^|\/)textures\/([^/]+)\.(png|jpe?g|webp)$/i);
if(used.has("skyface:"+f.name))continue;
if(/(?:^|\/)assets\/minecraft\/(?:optifine\/sky|mcpatcher\/sky)\//i.test(p)&&/(?:sky|panorama|starfield|sunflare)/i.test(p)){try{const faces=await panoramaToCube(await f.async("blob"));for(const [face,png] of Object.entries(faces)){target.file("skyBoxes/default/"+face+".png",png);counts.skyBoxes++;}mapped.push(p+" → skyBoxes/default/{px,nx,py,ny,pz,nz}.png");}catch(err){unmapped.push(p+" (no se pudo convertir a cubemap: "+err.message+")");}continue;}
if(!m&&!loose){skipped++;continue;}const rel=m?m[1]:loose[1];if(rel.includes("/")){skipped++;continue;}const mappedName=mapName(p,null);if(!mappedName){unmapped.push(p+" (nombre de textura no válido)");continue;}const dest=mappedName+".png";if(used.has(dest)){unmapped.push(p+" (destino duplicado: "+dest+")");continue;}let blob=await f.async("blob");if(!/\\.png$/i.test(f.name)){try{blob=await toPng(blob);}catch{unmapped.push(p+" (no se pudo convertir a PNG)");continue;}}used.add(dest);target.file("textures/"+dest,blob);mapped.push(p+" → textures/"+dest);
if(/(?:^|\/)assets\/minecraft\/textures\/(?:item|items)\//i.test(p)){const modelName=resolveItemModel(stem(p));if(modelName){try{target.file("models/"+modelName+".glb",await makeItemGlb(blob,modelName));counts.models++;}catch(err){unmapped.push(p+" (GLB falló: "+err.message+")");}}else{unmapped.push(p+" (no existe un modelo equivalente confirmado en Bloxd; no se genera GLB)");}}
}
if($("include-css").checked)target.file("css/ported-interface.css",css(name,author));
// Crear directorios requeridos por la estructura Bloxd sin inventar modelos o cielos convertidos.
target.folder("models");target.folder("skyBoxes");
target.file("README.txt",name+"\nAutor: "+(author||"Unknown")+"\n\nGenerado por Bloxd Packs Port.\nSe generan modelos GLB tipo prisma texturizado para imágenes de ítems y cubemaps para panoramas equirectangulares reconocidos. Los modelos son aproximaciones automáticas, no reconstrucciones exactas. No todos los cielos de Java son panoramas convertibles. Los sprites de GUI Java tampoco se convierten automáticamente en CSS de inventario. Los selectores CSS son ejemplos y requieren prueba en juego.\n");
output=await target.generateAsync({type:"blob",compression:"DEFLATE",compressionOptions:{level:6}});$("result-title").textContent=name;$("mapped-count").textContent=mapped.length;$("unmapped-count").textContent=unmapped.length;$("other-count").textContent=skipped;
$("report-note").textContent="No se requiere un pack de referencia. "+"Modelos GLB generados: "+counts.models+". Caras de cubemap generadas: "+counts.skyBoxes+". Los GLB son aproximaciones prismáticas texturizadas; se convierten panoramas 2:1 detectados como cielos.";list("mapped-list",mapped,"No se mapearon texturas.");list("unmapped-list",unmapped,"No hay imágenes sin mapear.");results.hidden=false;download.disabled=false;setStatus("Conversión terminada. Descarga y prueba el ZIP en Bloxd.","success");
}catch(err){console.error(err);setStatus("Falló la conversión: "+(err?.message||"error desconocido"),"error");}finally{convert.disabled=false;}
});

function align4(n){return (n+3)&~3;}
async function makeItemGlb(blob,label){
 const bitmap=await createImageBitmap(blob),w=bitmap.width,h=bitmap.height;
 if(!w||!h)throw Error("imagen vacía");
 const positions=[],normals=[],uvs=[],indices=[];
 // Prisma delgado: textura original en ambas caras y laterales UV en el borde.
 const faces=[
  {p:[[-.5,-.5,.07],[.5,-.5,.07],[.5,.5,.07],[-.5,.5,.07]],n:[0,0,1],uv:[[0,1],[1,1],[1,0],[0,0]]},
  {p:[[.5,-.5,-.07],[-.5,-.5,-.07],[-.5,.5,-.07],[.5,.5,-.07]],n:[0,0,-1],uv:[[0,1],[1,1],[1,0],[0,0]]},
  {p:[[-.5,-.5,-.07],[-.5,-.5,.07],[-.5,.5,.07],[-.5,.5,-.07]],n:[-1,0,0],uv:[[0,1],[.006,1],[.006,0],[0,0]]},
  {p:[[.5,-.5,.07],[.5,-.5,-.07],[.5,.5,-.07],[.5,.5,.07]],n:[1,0,0],uv:[[.994,1],[1,1],[1,0],[.994,0]]},
  {p:[[-.5,.5,.07],[.5,.5,.07],[.5,.5,-.07],[-.5,.5,-.07]],n:[0,1,0],uv:[[0,0],[1,0],[1,.006],[0,.006]]},
  {p:[[-.5,-.5,-.07],[.5,-.5,-.07],[.5,-.5,.07],[-.5,-.5,.07]],n:[0,-1,0],uv:[[0,.994],[1,.994],[1,1],[0,1]]}
 ];
 faces.forEach(f=>{let base=positions.length/3;f.p.forEach((v,i)=>{positions.push(...v);normals.push(...f.n);uvs.push(...f.uv[i]);});indices.push(base,base+1,base+2,base,base+2,base+3);});
 const imageBytes=new Uint8Array(await blob.arrayBuffer());
 const chunks=[];let offset=0;
 function add(typed,target){let bytes=new Uint8Array(typed.buffer,typed.byteOffset,typed.byteLength);offset=align4(offset);while(chunks.reduce((n,c)=>n+c.length,0)<offset)chunks.push(new Uint8Array(1));chunks.push(bytes.slice());return {byteOffset:offset,byteLength:bytes.byteLength};}
 // Build buffers explicitly with 4-byte alignment.
 const raw=[new Float32Array(positions),new Float32Array(normals),new Float32Array(uvs),new Uint16Array(indices)];
 let parts=[],views=[],byteLength=0;
 function push(bytes,target){const pad=(4-byteLength%4)%4;if(pad){parts.push(new Uint8Array(pad));byteLength+=pad;}const off=byteLength;parts.push(bytes);byteLength+=bytes.length;views.push({buffer:0,byteOffset:off,byteLength:bytes.length,...(target?{target}:{})});return views.length-1;}
 const pvi=push(new Uint8Array(raw[0].buffer),34962),nvi=push(new Uint8Array(raw[1].buffer),34962),uvi=push(new Uint8Array(raw[2].buffer),34962),ivi=push(new Uint8Array(raw[3].buffer),34963),imi=push(imageBytes,null);
 const binary=new Uint8Array(byteLength);let cursor=0;for(const part of parts){binary.set(part,cursor);cursor+=part.length;}
 const gltf={asset:{version:"2.0",generator:"Bloxd Packs Port"},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:label}],meshes:[{name:label,primitives:[{attributes:{POSITION:0,NORMAL:1,TEXCOORD_0:2},indices:3,material:0}]}],materials:[{name:label+" texture",pbrMetallicRoughness:{baseColorTexture:{index:0},metallicFactor:0,roughnessFactor:0.85},alphaMode:"BLEND",doubleSided:true}],textures:[{sampler:0,source:0}],samplers:[{magFilter:9728,minFilter:9728,wrapS:33071,wrapT:33071}],images:[{bufferView:imi,mimeType:"image/png"}],buffers:[{byteLength:binary.length}],bufferViews:views,accessors:[
 {bufferView:pvi,componentType:5126,count:positions.length/3,type:"VEC3",min:[-.5,-.5,-.07],max:[.5,.5,.07]},
 {bufferView:nvi,componentType:5126,count:normals.length/3,type:"VEC3"},
 {bufferView:uvi,componentType:5126,count:uvs.length/2,type:"VEC2"},
 {bufferView:ivi,componentType:5123,count:indices.length,type:"SCALAR"}
 ]};
 let jsonBytes=new TextEncoder().encode(JSON.stringify(gltf));const jp=(4-jsonBytes.length%4)%4;if(jp){const n=new Uint8Array(jsonBytes.length+jp);n.fill(0x20);n.set(jsonBytes);jsonBytes=n;}
 const bp=(4-binary.length%4)%4,binPadded=new Uint8Array(binary.length+bp);binPadded.set(binary);
 const total=12+8+jsonBytes.length+8+binPadded.length,glb=new ArrayBuffer(total),dv=new DataView(glb);let o=0;
 dv.setUint32(o,0x46546c67,true);o+=4;dv.setUint32(o,2,true);o+=4;dv.setUint32(o,total,true);o+=4;
 dv.setUint32(o,jsonBytes.length,true);o+=4;dv.setUint32(o,0x4e4f534a,true);o+=4;new Uint8Array(glb,o,jsonBytes.length).set(jsonBytes);o+=jsonBytes.length;
 dv.setUint32(o,binPadded.length,true);o+=4;dv.setUint32(o,0x004e4942,true);o+=4;new Uint8Array(glb,o,binPadded.length).set(binPadded);
 bitmap.close();return new Blob([glb],{type:"model/gltf-binary"});
}
async function panoramaToCube(blob){
 const bmp=await createImageBitmap(blob);if(bmp.width/bmp.height<1.9||bmp.width/bmp.height>2.1)throw Error("se esperaba una panorámica equirectangular 2:1");
 const src=document.createElement("canvas");src.width=bmp.width;src.height=bmp.height;const sctx=src.getContext("2d",{willReadFrequently:true});sctx.drawImage(bmp,0,0);const sourcePixels=sctx.getImageData(0,0,bmp.width,bmp.height).data;
 const size=Math.min(512,Math.max(64,Math.floor(bmp.height/2))),faces={};
 const dirs={px:(u,v)=>[1,-v,-u],nx:(u,v)=>[-1,-v,u],py:(u,v)=>[u,1,v],ny:(u,v)=>[u,-1,-v],pz:(u,v)=>[u,-v,1],nz:(u,v)=>[-u,-v,-1]};
 for(const [name,dir] of Object.entries(dirs)){
  const c=document.createElement("canvas");c.width=c.height=size;const ctx=c.getContext("2d"),im=ctx.createImageData(size,size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){let u=2*(x+.5)/size-1,v=2*(y+.5)/size-1,[dx,dy,dz]=dir(u,v),len=Math.hypot(dx,dy,dz);dx/=len;dy/=len;dz/=len;let sx=(Math.atan2(dz,dx)/(2*Math.PI)+.5)*bmp.width,sy=(.5-Math.asin(Math.max(-1,Math.min(1,dy)))/Math.PI)*bmp.height;sx=((Math.floor(sx)%bmp.width)+bmp.width)%bmp.width;sy=Math.max(0,Math.min(bmp.height-1,Math.floor(sy)));const si=(sy*bmp.width+sx)*4,i=(y*size+x)*4;im.data[i]=sourcePixels[si];im.data[i+1]=sourcePixels[si+1];im.data[i+2]=sourcePixels[si+2];im.data[i+3]=sourcePixels[si+3];}
  ctx.putImageData(im,0,0);faces[name]=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error("no se pudo crear PNG")),"image/png"));
 }
 bmp.close();return faces;
}

function toPng(blob){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{try{const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext("2d").drawImage(img,0,0);c.toBlob(b=>b?resolve(b):reject(Error("PNG conversion failed")),"image/png");}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(Error("Unsupported image"));};img.src=url;});}
download.addEventListener("click",()=>{if(!output)return;const url=URL.createObjectURL(output),a=document.createElement("a");a.href=url;a.download=clean($("pack-name").value)+"-bloxd.zip";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
})();