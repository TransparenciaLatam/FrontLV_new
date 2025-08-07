   document.addEventListener("DOMContentLoaded", async () => {
        function verificarAcceso() {
          const usuario = localStorage.getItem("usuarioLogueado");
          if (!usuario || usuario != "empresa") {
            alert("No tienes acceso. Iniciá sesión.");
            window.location.href = "../../index.html";
          }
        }

        verificarAcceso(); // ejecutar al inicio de cada página privada

        const idCliente = localStorage.getItem("idCliente");

        fetch(`http://localhost:8000/clientes/${idCliente}/terceros`)
          .then((res) => {
            if (!res.ok) throw new Error("Error al obtener info del cliente");
            return res.json();
          })
          .then((data) => {
            const container = document.getElementById("proveedoresContainer");
            container.innerHTML = "";

            try {
              data.forEach((p) => agregarTerceroTabla(p));

              if (data.length > 0) {
                const primerTercero = data[0];
                const nombreTercero =
                  primerTercero.nombre_tercero || "Proveedor";

                document.getElementById("nombre-tercero").textContent = `Admin`;
                document.getElementById(
                  "nombre-cliente"
                ).textContent = `Empresa`; // cambiar nombre real

                const iniciales = nombreTercero
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                document.getElementById("avatar-iniciales").textContent =
                  iniciales;
              }
            } catch (error) {
              container.innerHTML = "<p>Error al cargar los proveedores.</p>";
              console.error(error);
            }
          })
          .catch((err) => {
            console.error("Error:", err);
          });

        const inputArchivo = document.getElementById("archivoExcel");
        inputArchivo.addEventListener("change", async (event) => {
          const archivo = inputArchivo.files[0];

          if (!archivo) {
            alert("Por favor, seleccioná un archivo.");
            return;
          }

          // Validaciones
          if (archivo.size > 10 * 1024 * 1024) {
            alert("El archivo supera los 10MB.");
            inputArchivo.value = "";
            return;
          }

          if (
            archivo.type !==
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          ) {
            alert("Solo se permite un archivo .xlsx (Excel).");
            inputArchivo.value = "";
            return;
          }

          // Enviar archivo al backend
          const formData = new FormData();
          formData.append("archivo", archivo);

          try {
            const res = await fetch("http://localhost:8000/validar-archivo", {
              method: "POST",
              body: formData,
            });

            const data = await res.json();

            if (res.ok && data.aprobado) {
              alert("Archivo Excel validado correctamente.");
              // Aquí podrías continuar con la carga de datos o cerrar el modal
              //cerrarModalExcel(); // o lo que desees
            } else {
              alert(
                `Archivo rechazado: ${data.detalle || "Motivo desconocido"}`
              );
              inputArchivo.value = "";
            }
          } catch (error) {
            alert("Error al validar el archivo.");
            inputArchivo.value = "";
          }
        });
      });
      // Funciones para el modal de agregar
      function abrirModalAgregar(e) {
        if (e) e.preventDefault();
        console.log("Abriendo modal agregar");
        const modal = document.getElementById("modalAgregar");
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }

      function cerrarModalAgregar(e) {
        if (e) e.preventDefault();
        console.log("Cerrando modal agregar");
        document.getElementById("modalAgregar").classList.remove("active");
        document.body.style.overflow = "";
      }

      // Funciones para el modal de Excel
      function abrirModalExcel(e) {
        if (e) e.preventDefault();
        console.log("Abriendo modal Excel");
        const modal = document.getElementById("modalExcel");
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
      }

      function cerrarModalExcel(e) {
        if (e) e.preventDefault();
        console.log("Cerrando modal Excel");
        document.getElementById("modalExcel").classList.remove("active");
        document.body.style.overflow = "";
      }

      // Cerrar modales haciendo clic fuera del contenido
      document.addEventListener("click", function (e) {
        if (e.target.classList.contains("modal-flotante")) {
          if (e.target.id === "modalAgregar") cerrarModalAgregar(e);
          if (e.target.id === "modalExcel") cerrarModalExcel(e);
        }
      });

      function guardarProveedor() {
        const nombre = document.getElementById("nombreProveedor").value.trim();
        const email = document.getElementById("emailProveedor").value.trim();
        const mensajeExito = document.getElementById("mensajeExito");

        if (!nombre || !email) {
          alert("Completa ambos campos.");
          return;
        }

        const nuevoTercero = {
          nombre_tercero: nombre,
          email: email,
          cliente_id: 1,
        };

        fetch("http://localhost:8000/terceros/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevoTercero),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Error al crear el tercero");
            }
            return response.json();
          })
          .then((data) => {
            console.log("Tercero creado:", data);

            // Agregar en la tabla
            agregarTerceroTabla(data);

            // Mostrar mensaje de éxito
            mensajeExito.classList.remove("hidden");

            // Limpiar campos
            document.getElementById("nombreProveedor").value = "";
            document.getElementById("emailProveedor").value = "";

            // Cerrar modal después de 2 segundos
            setTimeout(() => {
              mensajeExito.classList.add("hidden");
              cerrarModalAgregar();
            }, 1500);
          })
          .catch((error) => {
            console.error("Hubo un problema con la petición:", error);
            alert("No se pudo guardar el proveedor. Intenta nuevamente.");
          });
      }

      function subirExcel() {
        const archivo = document.getElementById("archivoExcel").files[0];
        if (!archivo) {
          alert("Seleccioná un archivo Excel");
          return;
        }

        console.log("Subiendo archivo Excel:", archivo);
        // Aquí va tu lógica para enviar con FormData
        cerrarModalExcel();
      }

      function agregarTerceroTabla(tercero) { //
        const container = document.getElementById("proveedoresContainer");

        try {
          const row = document.createElement("tr");

          // Nombre del proveedor
          const nombreCell = document.createElement("td");

          // Generar iniciales del nombre del proveedor
          const iniciales = tercero.nombre_tercero
            .split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

          // Crear estructura visual con avatar
          nombreCell.innerHTML = `
              <div style="display: flex; align-items: center"> 
                <div class="company-logo" style="width: 36px; height: 36px; font-size: 14px; background-color: #e6edff; color: #2f57ef; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                  ${iniciales}
                </div>
                <span>${tercero.nombre_tercero}</span>
              </div>
            `;

          // Email
          const emailCell = document.createElement("td");
          emailCell.innerHTML = `${tercero.email}`; 

          // Formulario asignado
          const formulariosCell = document.createElement("td");
          if (tercero.formulario_generado) {
            const icono = `<i class="fas fa-file-alt"></i> `;
            formulariosCell.innerHTML =
              icono + tercero.formulario_generado.nombre_formulario;
              formulariosCell.classList.add("formulario-asignado");
          } else {
            formulariosCell.innerHTML = `<em>Sin asignar</em>`;
          }

          // Agregar celdas a la fila
          row.appendChild(nombreCell);
          row.appendChild(emailCell);
          row.appendChild(formulariosCell);

          // Agregar la fila al cuerpo de la tabla
          container.appendChild(row);
        } catch (error) {
          console.error("Error al agregar el tercero:", error);
        }
      }

      document
        .getElementById("logoutBtn")
        .addEventListener("click", function (e) {
          console.log("cerrar session");
          e.preventDefault(); // <--- importante si usás href
          localStorage.clear();
          window.location.href = "../../index.html";
        });