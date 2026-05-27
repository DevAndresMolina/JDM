const canvas = document.getElementById("lienzo");
const ctx = canvas.getContext("2d");

const controles = {
  textoSuperior: document.getElementById("textoSuperior"),
  nombrePrincipal: document.getElementById("nombrePrincipal"),
  textoInferior: document.getElementById("textoInferior"),
  iconoBase: document.getElementById("iconoBase"),
  colorNombre: document.getElementById("colorNombre"),
  colorNombre2: document.getElementById("colorNombre2"),
  colorSuperior: document.getElementById("colorSuperior"),
  colorInferior: document.getElementById("colorInferior"),
  colorContorno: document.getElementById("colorContorno"),
  fondo: document.getElementById("fondo"),
  tamanoNombre: document.getElementById("tamanoNombre"),
  tamanoSuperior: document.getElementById("tamanoSuperior"),
  tamanoInferior: document.getElementById("tamanoInferior"),
  posNombreY: document.getElementById("posNombreY"),
  posInferiorY: document.getElementById("posInferiorY"),
  espaciado: document.getElementById("espaciado"),
  inclinacion: document.getElementById("inclinacion"),
  logoScale: document.getElementById("logoScale"),
  logoY: document.getElementById("logoY"),
  logoOpacity: document.getElementById("logoOpacity"),
  mapaEscala: document.getElementById("mapaEscala"),
  mostrarMapaEnLetras: document.getElementById("mostrarMapaEnLetras"),
  mostrarIcono: document.getElementById("mostrarIcono")
};

const imagenes = {
  principal: new Image(),
  mapa: new Image(),
  separador: new Image()
};

imagenes.principal.src = "assets/jdm-principal.png";
imagenes.mapa.src = "assets/jdm-mapa.png";
imagenes.separador.src = "assets/separador.png";

let imagenesCargadas = 0;
const totalImagenes = Object.keys(imagenes).length;

Object.values(imagenes).forEach((img) => {
  img.onload = () => {
    imagenesCargadas += 1;
    if (imagenesCargadas >= totalImagenes) {
      dibujar();
    }
  };
});

function valor(id) {
  return controles[id].value;
}

function texto(id, respaldo) {
  const contenido = controles[id].value.trim();
  return (contenido || respaldo).toUpperCase();
}

function dibujarFondo() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (valor("fondo") === "transparente") return;

  if (valor("fondo") === "negro") {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const gradiente = ctx.createRadialGradient(800, 280, 120, 800, 900, 1200);
  gradiente.addColorStop(0, "#3a0707");
  gradiente.addColorStop(0.45, "#0b0b0b");
  gradiente.addColorStop(1, "#000000");
  ctx.fillStyle = gradiente;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function dibujarCurvasSuperiores() {
  const centroX = canvas.width / 2;
  const lineas = [
    { color: "#ff1515", ancho: 34, offset: 0 },
    { color: "#ff7373", ancho: 13, offset: 30 },
    { color: "#c90000", ancho: 10, offset: 58 }
  ];

  ctx.save();
  ctx.lineCap = "round";

  lineas.forEach((linea) => {
    ctx.beginPath();
    ctx.strokeStyle = linea.color;
    ctx.lineWidth = linea.ancho;
    ctx.moveTo(centroX - 610, 160 + linea.offset);
    ctx.bezierCurveTo(
      centroX - 250,
      20 + linea.offset,
      centroX + 270,
      20 + linea.offset,
      centroX + 620,
      160 + linea.offset
    );
    ctx.stroke();
  });

  ctx.restore();
}

function dibujarCurvasInferiores(yBase) {
  if (!imagenes.separador) return;

  ctx.save();
  
  const ancho = canvas.width;
  const ratio = imagenes.separador.width / imagenes.separador.height;
  const alto = ancho / ratio;
  const x = 0;
  const y = yBase;

  ctx.drawImage(imagenes.separador, x, y, ancho, alto);
  
  ctx.restore();
}

function medirTextoEspaciado(textoContenido, espacio) {
  let total = 0;

  [...textoContenido].forEach((letra, index) => {
    total += ctx.measureText(letra).width;
    if (index < textoContenido.length - 1) total += espacio;
  });

  return total;
}

function dibujarTextoEspaciado(textoContenido, x, y, espacio, rellenar = true, contornear = true) {
  const total = medirTextoEspaciado(textoContenido, espacio);
  let cursor = x - total / 2;

  [...textoContenido].forEach((letra, index) => {
    if (contornear) ctx.strokeText(letra, cursor, y);
    if (rellenar) ctx.fillText(letra, cursor, y);
    cursor += ctx.measureText(letra).width + (index < textoContenido.length - 1 ? espacio : 0);
  });
}

function ajustarTamanoFuente(textoContenido, tamanoInicial, maxWidth) {
  let tamano = Number(tamanoInicial);

  ctx.font = `italic 900 ${tamano}px Arial Black, Impact, Arial, sans-serif`;

  while (tamano > 70 && medirTextoEspaciado(textoContenido, Number(valor("espaciado"))) > maxWidth) {
    tamano -= 4;
    ctx.font = `italic 900 ${tamano}px Arial Black, Impact, Arial, sans-serif`;
  }

  return tamano;
}

function dibujarTextoSuperior() {
  const contenido = texto("textoSuperior", "");
  const tamano = Number(valor("tamanoSuperior"));

  ctx.save();
  ctx.font = `italic 900 ${tamano}px Arial Black, Impact, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = valor("colorSuperior");
  ctx.strokeStyle = valor("colorContorno");
  ctx.lineWidth = Math.max(3, tamano * 0.04);
  ctx.shadowColor = "rgba(0,0,0,.55)";
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;
  ctx.strokeText(contenido, canvas.width / 2, 285);
  ctx.fillText(contenido, canvas.width / 2, 285);
  ctx.restore();
}

// Función aplicarLineasMapa eliminada

function dibujarNombrePrincipal() {
  const contenido = texto("nombrePrincipal", "");
  const tamano = ajustarTamanoFuente(contenido, valor("tamanoNombre"), 1320);
  const y = Number(valor("posNombreY"));
  const espacio = Number(valor("espaciado"));
  const inclinacion = Number(valor("inclinacion")) / 100;

  ctx.save();
  ctx.translate(canvas.width / 2, y);
  ctx.transform(1, 0, -inclinacion, 1, 0, 0);
  ctx.font = `italic 900 ${tamano}px Arial Black, Impact, Arial, sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";

  const ancho = medirTextoEspaciado(contenido, espacio);
  const gradiente = ctx.createLinearGradient(-ancho / 2, -tamano / 2, -ancho / 2, tamano / 1.2);
  gradiente.addColorStop(0, valor("colorNombre"));
  gradiente.addColorStop(1, valor("colorNombre2"));

  ctx.fillStyle = gradiente;
  ctx.strokeStyle = valor("colorContorno");
  ctx.lineWidth = Math.max(10, tamano * 0.045);
  ctx.shadowColor = "rgba(0,0,0,.60)";
  ctx.shadowOffsetX = 18;
  ctx.shadowOffsetY = 18;

  dibujarTextoEspaciado(contenido, 0, 0, espacio, true, true);

  // aplicarLineasMapa(ancho, tamano); // Eliminado

  ctx.shadowColor = "transparent";
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = Math.max(3, tamano * 0.012);
  dibujarTextoEspaciado(contenido, 0, -tamano * 0.08, espacio, false, true);

  ctx.restore();
}

function dibujarTextoInferior() {
  const contenido = texto("textoInferior", "Es");
  const tamano = Number(valor("tamanoInferior"));
  const y = Number(valor("posInferiorY")) -90;

  ctx.save();
  ctx.translate(canvas.width / 2, y);
  ctx.transform(1, 0, -0.16, 1, 0, 0);
  ctx.font = `italic 900 ${tamano}px Arial Black, Impact, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const gradiente = ctx.createLinearGradient(0, -tamano, 0, tamano);
  gradiente.addColorStop(0, valor("colorInferior"));
  gradiente.addColorStop(1, "#8f0000");

  ctx.fillStyle = gradiente;
  ctx.strokeStyle = valor("colorContorno");
  ctx.lineWidth = Math.max(8, tamano * 0.045);
  ctx.shadowColor = "rgba(0,0,0,.60)";
  ctx.shadowOffsetX = 12;
  ctx.shadowOffsetY = 12;
  ctx.strokeText(contenido, 0, 0);
  ctx.fillText(contenido, 0, 0);
  ctx.restore();
}

function dibujarIconoSeleccionado() {
  if (!controles.mostrarIcono.checked) return;
  const elegido = valor("iconoBase");
  if (elegido === "ninguno") return;

  const imagen = imagenes[elegido];
  if (!imagen) return;

  const escala = Number(valor("logoScale"));
  const baseAncho = 1220 * escala;
  const ratio = imagen.width / imagen.height;
  const ancho = baseAncho;
  const alto = ancho / ratio;
  const x = (canvas.width - ancho) / 2;
  const y = Number(valor("logoY"));

  ctx.save();
  ctx.globalAlpha = Number(valor("logoOpacity"));
  ctx.drawImage(imagen, x, y, ancho, alto);
  ctx.restore();
}

function dibujar() {
  dibujarFondo();
  //dibujarCurvasSuperiores();
  dibujarTextoSuperior();
  dibujarCurvasInferiores(Number(valor("posInferiorY")) - 250);
  dibujarNombrePrincipal();
  dibujarTextoInferior();
  dibujarIconoSeleccionado();
}

Object.values(controles).forEach((control) => {
  control.addEventListener("input", dibujar);
  control.addEventListener("change", dibujar);
});

document.getElementById("restablecer").addEventListener("click", () => {
  controles.textoSuperior.value = "";
  controles.nombrePrincipal.value = "";
  controles.textoInferior.value = "Es";
  controles.iconoBase.value = "principal";
  controles.colorNombre.value = "#ff1515";
  controles.colorNombre2.value = "#930000";
  controles.colorSuperior.value = "#ffffff";
  controles.colorInferior.value = "#ff1515";
  controles.colorContorno.value = "#000000";
  controles.fondo.value = "degradado";
  controles.tamanoNombre.value = 300;
  controles.tamanoSuperior.value = 72;
  controles.tamanoInferior.value = 160;
  controles.posNombreY.value = 560;
  controles.posInferiorY.value = 1060;
  controles.espaciado.value = 4;
  controles.inclinacion.value = 14;
  controles.logoScale.value = 0.52;
  controles.logoY.value = 1130;
  controles.logoOpacity.value = 1;
  controles.mapaEscala.value = 0.82;
  controles.mostrarMapaEnLetras.checked = true;
  controles.mostrarIcono.checked = true;
  dibujar();
});

document.getElementById("descargar").addEventListener("click", () => {
  const nombreArchivo = texto("nombrePrincipal", "TORRES")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const enlace = document.createElement("a");
  enlace.download = `jdm_${nombreArchivo || "personalizado"}.png`;
  enlace.href = canvas.toDataURL("image/png");
  enlace.click();
});

if (imagenesCargadas >= totalImagenes) {
  dibujar();
}
