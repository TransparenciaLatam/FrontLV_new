/*************** CONFIG *****************/
let BACKEND_URL = "http://127.0.0.1:8000"; // Cambiá a 5000 si tu API corre allí
/****************************************/

/* Util: normalizar categorías para evitar problemas de tildes/mayúsculas */
function normCat(str) {
  return (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

/* Mapa: categoría normalizada -> selector de la tarjeta en tu HTML */
const CATEGORY_TO_CARD = {
  "informacion general": ".topic-card.general",
  "anticorrupcion": ".topic-card.anticorruption",
  "derechos humanos": ".topic-card.humanrights",
  "estandares laborales": ".topic-card.labor",
  "medio ambiente": ".topic-card.environment",
};

/* Lee el id_tercero: sessionStorage -> localStorage.infoTercero */
function getIdTercero() {
  const fromSession = sessionStorage.getItem("id_tercero");
  if (fromSession) return parseInt(fromSession, 10);

  const info = localStorage.getItem("infoTercero");
  if (info) {
    try {
      const p = JSON.parse(info);
      const id =
        p?.tercero?.id ??
        p?.id_tercero ??
        p?.tercero_id ??
        p?.idTercero; // camelCase según tu objeto
      if (id) return parseInt(id, 10);
    } catch (_) { /* noop */ }
  }
  return null;
}

/* Fetch al backend: devuelve { progreso_total, progreso_categoria } */
async function getProgresos(idTercero, baseUrl = BACKEND_URL) {
  const url = `${baseUrl}/progresos/${encodeURIComponent(idTercero)}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  return await res.json();
}

/* 🔹 Helper: actualizar botón según estado */
function updateCardButton(cardEl, pct) {
  const btn = cardEl.querySelector(".topic-actions button");
  if (!btn) return;

  if (pct <= 0) {
    btn.innerHTML = `<i class="fas fa-play"></i> Iniciar`;
    btn.title = "Iniciar formulario";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-primary");
    btn.disabled = false;
  } else if (pct > 0 && pct < 100) {
    btn.innerHTML = `<i class="fas fa-rotate-right"></i> Continuar`;
    btn.title = "Continuar formulario";
    btn.classList.remove("btn-secondary");
    btn.classList.add("btn-primary");
    btn.disabled = false;
  } else {
    // 100%
    btn.innerHTML = `<i class="fas fa-eye"></i> Ver`;
    btn.title = "Ver respuestas";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-secondary"); // opcional
    btn.disabled = false; // poné true si querés bloquear edición al 100%
  }
}

/* Pinta una tarjeta: porcentaje + estado + animación de barra + botón */
function setCardProgress(cardEl, porcentaje) {
  if (!cardEl) return;

  const pct = Math.max(0, Math.min(100, parseInt(porcentaje ?? 0, 10) || 0));

  // Mostrar la tarjeta (vienen con display:none en el HTML)
  cardEl.style.display = "";

  // Etiquetas de progreso
  const pctLabel = cardEl.querySelector(".progress-label span:last-child");
  if (pctLabel) pctLabel.textContent = `${pct}%`;

  // Barra (forzamos con !important por si tu CSS lo usa)
  const fill = cardEl.querySelector(".progress-fill");
  if (fill) {
    fill.style.setProperty("width", "0%", "important");
    requestAnimationFrame(() => {
      fill.style.setProperty("width", `${pct}%`, "important");
    });
  }

  // Badge de estado
  const badge = cardEl.querySelector(".status-badge");
  if (badge) {
    let estado = "Iniciar";
    if (pct > 0 && pct < 100) estado = "Continuar";
    if (pct >= 100) estado = "Completado";
    badge.textContent = estado;
    badge.dataset.state = estado.toLowerCase(); // iniciar|continuar|completado (por si querés estilos)
  }

  // 🔹 Botón según estado
  updateCardButton(cardEl, pct);
}

/* Aplica el objeto progreso a la UI */
function applyProgresosToUI(data) {
  const progCat = data?.progreso_categoria || {};
  const hayCategorias = Object.keys(progCat).length > 0;
  const noFormMsg = document.getElementById("noFormMsg");
  if (noFormMsg) noFormMsg.style.display = hayCategorias ? "none" : "block";

  for (const [catRaw, valor] of Object.entries(progCat)) {
    const key = normCat(catRaw);
    const selector = CATEGORY_TO_CARD[key];
    if (!selector) continue;
    const cardEl = document.querySelector(selector);
    setCardProgress(cardEl, valor);
  }

  // Si querés mostrar total en algún lado:
  // const totalHeader = document.querySelector("#progreso-total");
  // if (totalHeader) totalHeader.textContent = `${data?.progreso_total ?? 0}%`;
}

/* Inicializador: acepta opciones */
async function initProgreso(opts = {}) {
  try {
    const baseUrl   = opts.baseUrl || BACKEND_URL;
    const idTercero = opts.idTercero ?? getIdTercero();

    if (!idTercero) {
      console.warn("No se encontró id_tercero.");
      const noFormMsg = document.getElementById("noFormMsg");
      if (noFormMsg) noFormMsg.style.display = "block";
      return;
    }
    const data = await getProgresos(idTercero, baseUrl);
    applyProgresosToUI(data);
  } catch (err) {
    console.error("Error obteniendo progresos:", err);
    const noFormMsg = document.getElementById("noFormMsg");
    if (noFormMsg) noFormMsg.style.display = "block";
  }
}

/* Cargar directo con id y baseUrl */
async function cargar(idTercero, baseUrl) {
  const data = await getProgresos(idTercero, baseUrl || BACKEND_URL);
  applyProgresosToUI(data);
}

/* Export + alias */
window.Progreso = {
  getProgresos,
  applyProgresosToUI,
  initProgreso,
  cargar,
  render: initProgreso, // compatibilidad
};
