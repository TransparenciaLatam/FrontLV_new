// ===== terceros.js =====

// Helper: convierte a entero seguro
function toInt(x) {
  if (x === null || x === undefined) return NaN;
  if (typeof x === "number") return Number.isFinite(x) ? x : NaN;
  return parseInt(String(x).trim(), 10);
}

// Helper: resuelve idTercero desde múltiples fuentes
function resolveIdTercero(infoTercero) {
  const candRoot = infoTercero?.idTercero;       // { idTercero: 1 }
  const candObj  = infoTercero?.tercero?.id;     // { tercero: { id: 1 } }
  const candSess = sessionStorage.getItem("id_tercero");
  const id = toInt(candRoot) || toInt(candObj) || toInt(candSess);
  console.log("[ID] root:", candRoot, " tercero.id:", candObj, " session:", candSess, " => resuelto:", id);
  return id;
}

// Espera hasta que window.Progreso exista (máx 2s)
function waitForProgreso(timeoutMs = 2000, stepMs = 50) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    (function tick() {
      if (window.Progreso && typeof window.Progreso.initProgreso === "function") {
        return resolve(true);
      }
      if (Date.now() - t0 >= timeoutMs) return resolve(false);
      setTimeout(tick, stepMs);
    })();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // ===== 1) Acceso =====
  const usuario = localStorage.getItem("usuarioLogueado");
  if (!usuario || usuario !== "tercero") {
    alert("No tienes acceso. Iniciá sesión.");
    window.location.href = "../../index.html";
    return;
  }

  // ===== 2) Cargar infoTercero =====
  const raw = localStorage.getItem("infoTercero");
  if (!raw) {
    console.warn("No se encontró info del tercero en localStorage");
    const nf = document.getElementById("noFormMsg");
    if (nf) nf.style.display = "block";
    return;
  }
  const infoTercero = JSON.parse(raw);
  console.log("Info del tercero:", infoTercero);

  // ===== 3) Header (cliente/tercero/avatar) =====
  const elCliente = document.getElementById("nombre-cliente");
  const elTercero = document.getElementById("nombre-tercero");
  const elAvatar  = document.getElementById("avatar-iniciales");

  if (elCliente) elCliente.textContent = infoTercero?.cliente?.nombre || "No disponible";
  if (elTercero) elTercero.textContent = infoTercero?.tercero?.nombre || "No disponible";
  if (elAvatar) {
    const iniciales = (infoTercero?.tercero?.nombre || "")
      .split(" ").map(p => p.charAt(0)).join("").toUpperCase().slice(0, 2) || "US";
    elAvatar.textContent = iniciales;
  }

  // ===== 4) Categorías =====
  const categorias = Array.isArray(infoTercero?.categorias) ? infoTercero.categorias : [];
  if (!categorias.length) {
    document.getElementById("noFormMsg")?.style && (document.getElementById("noFormMsg").style.display = "block");
    document.querySelectorAll(".topic-card").forEach(c => c.style.display = "none");
    return;
  }

  // ===== 5) idTercero y API base =====
  const idTercero = resolveIdTercero(infoTercero);
  const BASE_URL  = "http://localhost:8000"; // ⬅️ Cambiá a http://localhost:5000 si tu API corre en 5000

  if (!Number.isFinite(idTercero) || idTercero <= 0) {
    console.warn("No se pudo resolver id_tercero");
  } else {
    // Guardalo en sessionStorage para próximas vistas (opcional)
    sessionStorage.setItem("id_tercero", String(idTercero));
  }

  // ===== 6) Modal de ayuda =====
  (function setupModal() {
    const modal           = document.getElementById("modalAyudaPersonalizado");
    const btnAbrir        = document.getElementById("botonAyuda");
    const btnCerrarX      = document.querySelector(".cerrar-modal");
    const btnCerrarFooter = document.querySelector(".cerrar-modal-btn");
    if (!modal || !btnAbrir) return;

    const abrir  = () => { modal.classList.add("mostrar"); document.body.style.overflow = "hidden"; };
    const cerrar = () => { modal.classList.remove("mostrar"); document.body.style.overflow = ""; };

    btnAbrir.addEventListener("click", abrir);
    btnCerrarX?.addEventListener("click", cerrar);
    btnCerrarFooter?.addEventListener("click", cerrar);
    modal.addEventListener("click", (e) => { if (e.target === modal) cerrar(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("mostrar")) cerrar(); });
  })();

  // ===== 7) Logout =====
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "../../index.html";
  });

  // ===== 8) Render de progreso =====
  const hasProgreso = await waitForProgreso(2000, 50);
  console.log("[Progreso] disponible:", hasProgreso, "obj:", window.Progreso);

  if (hasProgreso && Number.isFinite(idTercero) && idTercero > 0) {
    try {
      await window.Progreso.initProgreso({
        idTercero,
        baseUrl: BASE_URL,
      });
    } catch (e) {
      console.error("Error al renderizar progreso:", e);
    }
  } else {
    console.warn("Progreso.initProgreso no disponible o falta idTercero");
    // Fallback: mostrar solo las categorías asignadas
    document.querySelectorAll(".topic-card").forEach(c => c.style.display = "none");
    const MAP = {
      "informacion general": "general",
      "anticorrupcion": "anticorruption",
      "derechos humanos": "humanrights",
      "estandares laborales": "labor",
      "medio ambiente": "environment",
    };
    categorias.forEach(cat => {
      const cls = MAP[String(cat).toLowerCase()];
      const card = document.querySelector(`.topic-card.${cls}`);
      if (card) card.style.display = "block";
    });
  }

  // ===== 9) Global: abrir formulario por categoría =====
  // Debe ser global para que funcione el onclick="traerFormulario(...)"
  window.traerFormulario = function traerFormulario(categoria, buttonElement) {
    const info = JSON.parse(localStorage.getItem("infoTercero") || "{}");
    const formularioId = info?.tercero?.formulario_id;

    if (!formularioId) {
      console.error("No se encontró el ID del formulario del tercero.");
      return;
    }

    fetch(`${BASE_URL}/formularios/${formularioId}/categoria/${categoria}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data || data.length === 0) {
          console.warn("No hay preguntas en el formulario");
          return;
        }

        const card = buttonElement?.closest?.(".topic-card");
        const borderTop = card ? getComputedStyle(card).borderTopColor : "#ccc";

        localStorage.setItem("preguntas_categoria", JSON.stringify(data));
        sessionStorage.setItem("categoria_actual", categoria);
        sessionStorage.setItem("color_categoria", borderTop);

        window.location.href = "formularios_terceros.html";
      })
      .catch((err) => {
        console.error("Error al traer el formulario:", err);
      });
  };
});
