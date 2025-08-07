 document.addEventListener("DOMContentLoaded", async () => {
        // Verifica si el usuario tiene acceso
        function verificarAcceso() {
          const usuario = localStorage.getItem("usuarioLogueado");
          if (!usuario || usuario != "tercero") {
            alert("No tienes acceso. Iniciá sesión.");
            window.location.href = "../../index.html";
          }
        }

        verificarAcceso(); // ejecutar al inicio de cada página privada

        const data = localStorage.getItem("infoTercero");
        if (data) {
          const infoTercero = JSON.parse(data);
          console.log("Info del tercero:", infoTercero);

          // Mostrar el nombre del cliente y del tercero
          document.getElementById("nombre-cliente").textContent = `${
            infoTercero.cliente?.nombre || "No disponible"
          }`;
          document.getElementById("nombre-tercero").textContent = `${
            infoTercero.tercero?.nombre || "No disponible"
          }`;

          // Mostrar iniciales del tercero como avatar con estilo .company-logo
          const nombreTercero = infoTercero.tercero?.nombre || "";
          const iniciales = nombreTercero
            .split(" ")
            .map((p) => p.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);

          document.getElementById("avatar-iniciales").textContent = iniciales;

          const categorias = infoTercero?.categorias || [];

          const cards = document.querySelectorAll(".topic-card");
          let algunaVisible = false;

          if (categorias.length === 0) {
            document.getElementById("noFormMsg").style.display = "block";
            return;
          }
          //THE END DEL CAMBIO

          categorias.forEach((cat) => {
            let className = "";
            switch (cat.toLowerCase()) {
              case "informacion general":
                className = "general";
                break;
              case "anticorrupcion":
                className = "anticorruption";
                break;
              case "derechos humanos":
                className = "humanrights";
                break;
              case "estandares laborales":
                className = "labor";
                break;
              case "medio ambiente":
                className = "environment";
                break;
            }

            const card = document.querySelector(`.topic-card.${className}`);
            if (card) {
              card.style.display = "block";
              algunaVisible = true;
            }
          });

          if (!algunaVisible) {
            document.getElementById("noFormMsg").style.display = "block";
          }
        } else {
          console.warn("No se encontró info del tercero en localStorage");
        }
      });

      document
        .getElementById("logoutBtn")
        .addEventListener("click", function () {
          localStorage.clear();
          window.location.href = "../../index.html";
        });

      function traerFormulario(categoria, buttonElement) {
        const info = JSON.parse(localStorage.getItem("infoTercero"));

        if (!info || !info.tercero || !info.tercero.formulario_id) {
          console.error(
            "No se encontró la info del tercero o el ID del formulario."
          );
          return;
        }

        const formularioId = info.tercero.formulario_id;

        fetch(
          `http://localhost:8000/formularios/${formularioId}/categoria/${categoria}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (!data || data.length === 0) {
              console.warn("No hay preguntas en el formulario");
              return;
            }

            // Obtener color de borde top (puede estar en el contenedor topic-card)
            const card = buttonElement.closest(".topic-card");
            const borderTop = getComputedStyle(card).borderTopColor;

            // Guardar en SessionStorage
            localStorage.setItem("preguntas_categoria", JSON.stringify(data));
            sessionStorage.setItem("categoria_actual", categoria);
            sessionStorage.setItem("color_categoria", borderTop);

            window.location.href = "formularios_terceros.html";
          })
          .catch((err) => {
            console.error("Error al traer el formulario:", err);
          });
      }

      // Boton ayuda
      document.addEventListener("DOMContentLoaded", function () {
        // Elementos del modal
        const modal = document.getElementById("modalAyudaPersonalizado");
        const btnAbrir = document.getElementById("botonAyuda");
        const btnCerrar = document.querySelector(".cerrar-modal");
        const btnCerrarModal = document.querySelector(".cerrar-modal-btn");

        // Abrir modal
        btnAbrir.addEventListener("click", function () {
          modal.classList.add("mostrar");
          document.body.style.overflow = "hidden";
        });

        // Cerrar modal
        function cerrarModal() {
          modal.classList.remove("mostrar");
          document.body.style.overflow = "";
        }

        btnCerrar.addEventListener("click", cerrarModal);
        btnCerrarModal.addEventListener("click", cerrarModal);

        // Cerrar al hacer clic fuera del contenido
        modal.addEventListener("click", function (e) {
          if (e.target === modal) {
            cerrarModal();
          }
        });

        // Cerrar con tecla ESC
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && modal.classList.contains("mostrar")) {
            cerrarModal();
          }
        });
      });