//Funcion para selector de preguntas!!


async function selectorPreguntas() {
    const contenedor = document.getElementById("questions-container");

    

    mostrarCargando(contenedor);

    try {
        const res = await fetch("http://localhost:8000/preguntas_por_categoria");

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();

        if (!data || !Array.isArray(data)) {
            throw new Error("Formato de respuesta inesperado.");
        }

        contenedor.innerHTML = "";
        console.log(data)
        selectorPreguntas_armarPregunta(data,contenedor)

    } catch (error) {
        mostrarError(contenedor, "Error al cargar preguntas.");
        console.error("Error en cargarPreguntas:", error);
    }
}

// Función para mostrar mensaje de carga
function mostrarCargando(contenedor) {
    contenedor.innerHTML = `<p>Cargando preguntas...</p>`;
}

// Función para mostrar error
function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = `<p class="error">${mensaje}</p>`;
}


// Variables globales
const selectedQuestions = new Set();
const allQuestionsFlat = []; // Asegurate de que esté cargada con todas las preguntas


function selectorPreguntas_armarPregunta(data, container) {
  container.innerHTML = "";
  allQuestionsFlat.length = 0; // Limpia preguntas anteriores

  data.forEach((preg) => {
    const card = document.createElement("div");
    card.className = "category-card";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = preg.categoria.toUpperCase();

    const list = document.createElement("div");

    preg.preguntas.forEach((q) => {
      const texto =
        q.preguntas?.[0]?.texto_pregunta ||
        q.texto_pregunta ||
        q.text ||
        `Pregunta ${q.id}`;

      allQuestionsFlat.push({ id: q.id, text: texto }); // Guardamos para edición

      const item = document.createElement("div");
      item.className = "question-item";
      item.dataset.id = q.id;

      const label = document.createElement("span");
      label.textContent = texto;

      const actions = document.createElement("div");
      actions.className = "question-actions";
      actions.innerHTML = `
        <button class="edit-btn btn btn-sm" data-id="${q.id}">
          <i class="fas fa-edit text-primary"></i>
        </button>
      `;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input me-3";
      checkbox.value = q.id;

      checkbox.addEventListener("change", () => {
        q.id &&
          (checkbox.checked
            ? selectedQuestions.add(q.id)
            : selectedQuestions.delete(q.id));
        updateSelectedQuestions();
      });

      item.appendChild(checkbox);
      item.appendChild(label);
      item.appendChild(actions);
      list.appendChild(item);
    });

    card.appendChild(header);
    card.appendChild(list);
    container.appendChild(card);
  });

  // ✅ Activamos eventos de los botones de edición una vez renderizado
  activarBotonesEditar();
}
function activarBotonesEditar() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      const pregunta = allQuestionsFlat.find((q) => q.id == id);
      if (!pregunta) return;

      inputTexto.value = pregunta.text;
      inputId.value = pregunta.id;
      modalEditar.show();
    });
  });
}

function updateSelectedQuestions() {
  const container = document.getElementById("selected-questions");
  const badge = document.getElementById("selected-count");
  const btn = document.getElementById("generate-form");

  const total = selectedQuestions.size;
  if (badge) badge.textContent = total;

  if (total === 0) {
    container.innerHTML =
      '<p class="text-muted m-0">No hay preguntas seleccionadas</p>';
    if (btn) btn.disabled = true;
    return;
  }

  const html = Array.from(selectedQuestions)
    .map((id) => {
      const pregunta = allQuestionsFlat.find((q) => q.id === id);
      return `<li class="list-group-item">${
        pregunta?.text || "Pregunta " + id
      }</li>`;
    })
    .join("");

  container.innerHTML = `
    <ul class="list-group mb-2">${html}</ul>
    <p class="mt-2 text-muted">Total: ${total} preguntas</p>
  `;

  if (btn) btn.disabled = false;
}

//FUNCION PARA BUSCAR PREGUNTAS
function mostrarPreguntas(preguntasFiltradas) {
  const container = document.getElementById("preguntas-container");
  container.innerHTML = "";

  // Agrupar por categoría
  const agrupadas = {};
  preguntasFiltradas.forEach((p) => {
    const categoria = p.categoria || "Sin categoría";
    if (!agrupadas[categoria]) {
      agrupadas[categoria] = [];
    }
    agrupadas[categoria].push(p);
  });

  // Renderizar por categoría
  Object.entries(agrupadas).forEach(([categoria, preguntas]) => {
    const card = document.createElement("div");
    card.className = "category-card";

    const header = document.createElement("div");
    header.className = "category-header";
    header.innerHTML = `<h5 class="mb-0">${categoria.toUpperCase()}</h5>`;
    card.appendChild(header);

    const list = document.createElement("div");

    preguntas.forEach((q) => {
      const texto = q.texto_pregunta || q.text || `Pregunta ${q.id}`;
      allQuestionsFlat.push({ id: q.id, text: texto, categoria: preg.categoria });


      const item = document.createElement("div");
      item.className = "question-item";
      item.dataset.id = q.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-check-input me-3";
      checkbox.value = q.id;

      // Sincronizar estado seleccionado
      checkbox.checked = selectedQuestions.has(q.id);
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          selectedQuestions.add(q.id);
        } else {
          selectedQuestions.delete(q.id);
        }
        updateSelectedQuestions();
      });

      const label = document.createElement("span");
      label.textContent = texto;

      const actions = document.createElement("div");
      actions.className = "question-actions";
      actions.innerHTML = `
        <button class="edit-btn" data-id="${q.id}">
          <i class="fas fa-edit text-primary"></i>
        </button>
      `;

      // Evento botón editar
      actions.querySelector("button").addEventListener("click", () => {
        document.getElementById("textoPreguntaEditar").value = texto;
        document.getElementById("idPreguntaEditar").value = q.id;
        modalEditar.show();
      });

      item.appendChild(checkbox);
      item.appendChild(label);
      item.appendChild(actions);
      list.appendChild(item);
    });

    card.appendChild(list);
    container.appendChild(card);
  });
}
















//Funcion principal para traer preguntas

async function cargarPreguntas() {
    const contenedor = document.getElementById("contenedorPreguntas");

    mostrarCargando(contenedor);

    try {
        const res = await fetch("http://localhost:8000/preguntas_formulario");

        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }

        const data = await res.json();

        if (!data.preguntas || !Array.isArray(data.preguntas)) {
            throw new Error("Formato de respuesta inesperado.");
        }

        contenedor.innerHTML = "";
        console.log(data.preguntas)
        renderizarPreguntas(data.preguntas, 'contenedorPreguntas');

    } catch (error) {
        mostrarError(contenedor, "Error al cargar preguntas.");
        console.error("Error en cargarPreguntas:", error);
    }
}

// Función para mostrar mensaje de carga
function mostrarCargando(contenedor) {
    contenedor.innerHTML = `<p>Cargando preguntas...</p>`;
}

// Función para mostrar error
function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = `<p class="error">${mensaje}</p>`;
}


//ESta funcion toma una pregunta enviada desde la base de datos y la arma en un div, para agregar a otro contenedor

 function crearPregunta(pregunta) {
        const contenedor = document.createElement("div");
        
        contenedor.classList.add("pregunta","question-item");
        contenedor.classList.add(`pregunta-${pregunta.index}`); 

        contenedor.dataset.index = pregunta.index;
        
        // Ocultar si index > 1
        if (pregunta.index > 1) {
            contenedor.style.display = "none";      

        }

        // Texto de la pregunta
        const texto = document.createElement("p");
        texto.classList.add("question-label");
        texto.textContent = pregunta.texto_pregunta;
        contenedor.appendChild(texto)

        if (pregunta.index == 1) {
            const asterisco = document.createElement("span");
            asterisco.classList.add("required-marker");
            asterisco.textContent = "*";
            texto.appendChild(asterisco);
        }

        // Asumiendo que 'contenedor' es el div donde agregás los inputs
        if (pregunta.tipo_pregunta === "radio" || pregunta.tipo_pregunta === "checkbox") {
            pregunta.opciones.forEach((opcion, i) => {
            // Crear input y label
            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.style.display = "block";

            const input = document.createElement("input");
            input.type = pregunta.tipo_pregunta;
            input.name = `pregunta-${pregunta.index}`;
            input.value = opcion;
            input.class = `opcion-${pregunta.index}-${i}`;
            input.classList.add("form-check-input");

            if (pregunta.index === 1 && pregunta.tipo_pregunta === "radio") {
                input.required = true;
            }

            label.appendChild(input);
            label.append(` ${opcion}`);
            contenedor.appendChild(label);

            
            })

        }

        else if (pregunta.tipo_pregunta === "text") {
        const input = document.createElement("input");
        input.type = "text";
        input.name = `pregunta-${pregunta.index}`;
        input.placeholder = "Escriba su respuesta";
        input.classList.add("form-control");
        if (pregunta.index === 1) {
            input.required = true;
        }
        contenedor.appendChild(input);

    } else if (pregunta.tipo_pregunta === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.name = `pregunta-${pregunta.index}`;
        textarea.placeholder = "Escriba su respuesta";
        textarea.rows = 4;
        textarea.cols = 40;
        textarea.classList.add("form-control");
        if (pregunta.index === 1) {
            textarea.required = true;
        }
        contenedor.appendChild(textarea);

    } else if (pregunta.tipo_pregunta === "file") {
    const div = document.createElement("div");
    div.classList.add("file-upload-container");

    // --- Ícono
    const iconDiv = document.createElement("div");
    iconDiv.className = "file-upload-icon";
    iconDiv.innerHTML = `<i class="fas fa-cloud-upload-alt"></i>`;
    div.appendChild(iconDiv);

    // --- Texto principal
    const texto = document.createElement("p");
    texto.textContent = "Arrastre sus archivos aquí o haga clic para seleccionar";
    div.appendChild(texto);

    // --- Subtexto
    const subtexto = document.createElement("p");
    subtexto.className = "text-muted small";
    subtexto.textContent = "Formatos soportados: PDF, JPG, JPEG, PNG, DOC, DOCX, XLSX (Máx. 10MB)";
    div.appendChild(subtexto);

    // --- Input file (oculto)
    const input = document.createElement("input");
    input.type = "file";
    input.className = "d-none";
    input.id = `file-input-${pregunta.index}`;
    input.name = `pregunta-${pregunta.index}[]`;
    input.multiple = true;
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"

    if (pregunta.index === 1) {
        input.required = true;
    }

    div.appendChild(input);

    // --- Contenedor de vista previa
    const preview = document.createElement("div");
    preview.className = "file-preview";
    preview.id = `file-preview-${pregunta.index}`;
    div.appendChild(preview);

    // --- Click sobre el contenedor activa input
    div.addEventListener("click", () => input.click());

    // --- Agregar al contenedor principal
    contenedor.appendChild(div);
    }else if (pregunta.tipo_pregunta === "date") {
            const input = document.createElement("input");
            input.type = "date";
            input.name = `pregunta-${pregunta.index}`;
            input.classList.add("form-control");
            if (pregunta.index === 1) {
                input.required = true;
            }
            contenedor.appendChild(input);

    } 

    return contenedor;
}
















//ESta funcion toma una pregunta enviada desde la base de datos y la arma en un div, para agregar a otro contenedor

 function crearPreguntaTerceros(pregunta) {
        const contenedor = document.createElement("div");
        
        contenedor.classList.add("pregunta","question-item");
        contenedor.classList.add(`pregunta-${pregunta.index}`); 

        contenedor.dataset.index = pregunta.index;

        // Ocultar si index > 1
        if (pregunta.index > 1) {
            contenedor.style.display = "none";      

        }



        // Texto de la pregunta
        const texto = document.createElement("p");
        texto.classList.add("question-label");
        texto.textContent = pregunta.texto_pregunta;
        contenedor.appendChild(texto)

        if (pregunta.index == 1) {
            const asterisco = document.createElement("span");
            asterisco.classList.add("required-marker");
            asterisco.textContent = "*";
            texto.appendChild(asterisco);
        }

        // Asumiendo que 'contenedor' es el div donde agregás los inputs
        if (pregunta.tipo_pregunta === "radio" || pregunta.tipo_pregunta === "checkbox") {
            pregunta.opciones.forEach((opcion, i) => {
            // Crear input y label
            const label = document.createElement("label");
            label.classList.add("form-check-label");
            label.style.display = "block";

            const input = document.createElement("input");
            input.type = pregunta.tipo_pregunta;
            input.name = `pregunta-${pregunta.index}`;
            input.value = opcion;
            input.class = `opcion-${pregunta.index}-${i}`;
            input.classList.add("form-check-input");

            if (pregunta.index === 1 && pregunta.tipo_pregunta === "radio") {
                input.required = true;
            }

            label.appendChild(input);
            label.append(` ${opcion}`);
            contenedor.appendChild(label);

            
            })

        }

        else if (pregunta.tipo_pregunta === "text") {
        const input = document.createElement("input");
        input.type = "text";
        input.name = `pregunta-${pregunta.index}`;
        input.placeholder = "Escriba su respuesta";
        input.classList.add("form-control");
        if (pregunta.index === 1) {
            input.required = true;
        }
        contenedor.appendChild(input);

    } else if (pregunta.tipo_pregunta === "textarea") {
        const textarea = document.createElement("textarea");
        textarea.name = `pregunta-${pregunta.index}`;
        textarea.placeholder = "Escriba su respuesta";
        textarea.rows = 4;
        textarea.cols = 40;
        textarea.classList.add("form-control");
        if (pregunta.index === 1) {
            textarea.required = true;
        }
        contenedor.appendChild(textarea);

    } else if (pregunta.tipo_pregunta === "file") {
    const div = document.createElement("div");
    div.classList.add("file-upload-container");

    // --- Ícono
    const iconDiv = document.createElement("div");
    iconDiv.className = "file-upload-icon";
    iconDiv.innerHTML = `<i class="fas fa-cloud-upload-alt"></i>`;
    div.appendChild(iconDiv);

    // --- Texto principal
    const texto = document.createElement("p");
    texto.textContent = "Arrastre sus archivos aquí o haga clic para seleccionar";
    div.appendChild(texto);

    // --- Subtexto
    const subtexto = document.createElement("p");
    subtexto.className = "text-muted small";
    subtexto.textContent = "Formatos soportados: PDF, JPG, JPEG, PNG, DOC, DOCX, XLSX (Máx. 10MB)";
    div.appendChild(subtexto);

    // --- Input file (oculto)
const input = document.createElement("input");
input.type = "file";
input.className = "d-none";
input.id = `file-input-${pregunta.index}`;
input.name = `pregunta-${pregunta.index}[]`;
input.multiple = true; // habilitar múltiples archivos
input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx";

if (pregunta.index === 1) {
  input.required = true;
}

div.appendChild(input);

// --- Contenedor de vista previa
const preview = document.createElement("div");
preview.className = "file-preview";
preview.id = `file-preview-${pregunta.index}`;
div.appendChild(preview);

// --- Click sobre el contenedor activa input
div.addEventListener("click", () => input.click());

// --- Agregar event listener para validación y envío múltiple
input.addEventListener("change", async (event) => {
  const archivos = Array.from(event.target.files);
  if (archivos.length === 0) return;

  const tiposPermitidos = [
    "image/jpeg",
    "image/png",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"        // .xlsx
  ];

  const preview = document.getElementById(`file-preview-${pregunta.index}`);
  preview.innerHTML = ""; // Limpiar vista previa anterior

  for (const archivo of archivos) {
    // Validación de tipo y tamaño
    if (archivo.size > 10 * 1024 * 1024) {
      alert(`"${archivo.name}" supera los 10MB.`);
      continue;
    }

    if (!tiposPermitidos.includes(archivo.type)) {
      alert(`"${archivo.name}" tiene un tipo no permitido.`);
      continue;
    }

    // Enviar al backend
    const formData = new FormData();
    formData.append("archivo", archivo);

    try {
      const res = await fetch("http://localhost:8000/validar-archivo", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.aprobado) {
        // Mostrar archivo aprobado en la vista previa
        const item = document.createElement("div");
        item.textContent = archivo.name;
        preview.appendChild(item);
      } else {
        alert(`"${archivo.name}" fue rechazado: ${data.detalle || "Motivo desconocido"}`);
      }
    } catch (error) {
      alert(`Error al validar "${archivo.name}".`);
    }
  }

  // Si ninguno fue válido, resetear input
  if (preview.children.length === 0) {
    input.value = "";
  }
});


    // --- Agregar al contenedor principal
    contenedor.appendChild(div);
    }else if (pregunta.tipo_pregunta === "date") {
            const input = document.createElement("input");
            input.type = "date";
            input.name = `pregunta-${pregunta.index}`;
            input.classList.add("form-control");
            if (pregunta.index === 1) {
                input.required = true;
            }
            contenedor.appendChild(input);

    } 

    return contenedor;
}











//Funcion para generar eventos para preguntas radio


function configurarPreguntasAdicionales(gi, pn, indexAdicional, detonador) {
    const grupoId = 'grupo-' + gi;
    const preguntaName = 'pregunta-' + pn;
    const grupoPreguntas = document.getElementById(grupoId);

    if (!grupoPreguntas) {
        console.warn(`No se encontró el grupo con id "${grupoId}"`);
        return;
    }

    const opciones = grupoPreguntas.querySelectorAll(`[name="${preguntaName}"]`);

    if (!opciones.length) {
        console.warn(`No se encontraron opciones para la pregunta "${preguntaName}"`);
        return;
    }

    const preguntasAdicionales = grupoPreguntas.querySelectorAll(`.pregunta[data-index="${indexAdicional}"]`);

    function togglePreguntasAdicionales(mostrar) {
        preguntasAdicionales.forEach(pregunta => {
            pregunta.style.display = mostrar ? 'block' : 'none';
        });
    }

    // Agregar evento a todas las opciones
    opciones.forEach(opcion => {
        opcion.addEventListener('click', () => {
            if (opcion.value === detonador) {
                togglePreguntasAdicionales(true);  // Mostrar
            } else {
                togglePreguntasAdicionales(false); // Ocultar
            }
        });
    });
}












// ESta funcion recibe como parametros las preguntas desde el backend, y se encarga de crear una por una
// y ademas crear sus events listeners

function renderizarPreguntas(listaPreguntas, contenedorId) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) {
        console.error(`No se encontró el contenedor con id: ${contenedorId}`);
        return;
    }

    listaPreguntas.forEach(pregunta => {
        // Crear contenedor de grupo
        const divContenedorPreguntasGrupo = document.createElement("div");
        divContenedorPreguntasGrupo.classList.add("grupo-preguntas");
        divContenedorPreguntasGrupo.id = `grupo-${pregunta.id}`;
        divContenedorPreguntasGrupo.setAttribute("data-categoria", pregunta.categoria);

        // Lista acumuladora de opciones
        const listaOpciones = [];

        // Renderizar preguntas individuales
        pregunta.preguntas.forEach(p => {
            const divPregunta = crearPregunta(p);
            divContenedorPreguntasGrupo.appendChild(divPregunta);

            if (p.opciones) {
                p.opciones.forEach(opcion => {
                    listaOpciones.push(opcion);
                });
            }
        });

        contenedor.appendChild(divContenedorPreguntasGrupo);

        // Configurar preguntas adicionales si la primera es de tipo radio y hay más de una
        if (pregunta.preguntas[0].tipo_pregunta === 'radio' && pregunta.preguntas.length > 1) {
            let posicionOpcion = 0;
            let posicionPregunta = 0;
            let ultimoIndex = 0;

            let contadorOpciones = 0;

            pregunta.preguntas.forEach((p, i) => {
                if (p.opciones) {
                    contadorOpciones = p.opciones.length;
                }

                if (p.index === 1) {
                    posicionPregunta += 1;
                    ultimoIndex = p.index;

                } else if (p.detonador && p.index === 2 && posicionPregunta === 1) {
                    if (listaOpciones[0] === p.detonador) {
                        const detonador = p.detonador;
                        const preguntaPrincipal = pregunta.preguntas[0].index;
                        const preguntaActivar = p.index;

                        configurarPreguntasAdicionales(pregunta.id, preguntaPrincipal, preguntaActivar, detonador);
                    }

                    posicionOpcion += 1;
                    posicionPregunta += 1;
                    ultimoIndex = p.index;

                } else if (p.detonador && p.index === ultimoIndex) {
                    posicionOpcion -= 1;
                    ultimoIndex = p.index;

                } else {
                    if (p.detonador && listaOpciones[posicionOpcion] === p.detonador) {
                        const detonador = p.detonador;
                        let iterador = posicionPregunta - contadorOpciones;

                        if (iterador < 0) iterador = 0;

                        const preguntaPrincipal = pregunta.preguntas[iterador].index;
                        const preguntaActivar = p.index;

                        configurarPreguntasAdicionales(pregunta.id, preguntaPrincipal, preguntaActivar, detonador);
                    }

                    posicionOpcion += 1;
                    posicionPregunta += 1;
                    ultimoIndex = p.index;
                }
            });
        }
    });
}









function renderizarPreguntasTerceros(listaPreguntas, contenedorId) {
    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) {
        console.error(`No se encontró el contenedor con id: ${contenedorId}`);
        return;
    }
    if (!Array.isArray(listaPreguntas)) {
        console.error("listaPreguntas no es un array:", listaPreguntas);
        return;
    }

    listaPreguntas.forEach(pregunta => {
        // Crear contenedor de grupo
        const divContenedorPreguntasGrupo = document.createElement("div");
        divContenedorPreguntasGrupo.classList.add("grupo-preguntas");
        divContenedorPreguntasGrupo.id = `grupo-${pregunta.id}`;
        divContenedorPreguntasGrupo.setAttribute("data-categoria", pregunta.categoria);

        // Lista acumuladora de opciones
        const listaOpciones = [];
        
        // Renderizar preguntas individuales
        pregunta.preguntas.forEach(p => {
            const divPregunta = crearPreguntaTerceros(p);
             

            divContenedorPreguntasGrupo.appendChild(divPregunta);
            divContenedorPreguntasGrupo.style.display = "none"; 

            if (p.opciones) {
                p.opciones.forEach(opcion => {
                    listaOpciones.push(opcion);
                });
            }
        });

        contenedor.appendChild(divContenedorPreguntasGrupo);

        // Configurar preguntas adicionales si la primera es de tipo radio y hay más de una
        if (pregunta.preguntas[0].tipo_pregunta === 'radio' && pregunta.preguntas.length > 1) {
            let posicionOpcion = 0;
            let posicionPregunta = 0;
            let ultimoIndex = 0;

            let contadorOpciones = 0;

            pregunta.preguntas.forEach((p, i) => {
                if (p.opciones) {
                    contadorOpciones = p.opciones.length;
                }

                if (p.index === 1) {
                    posicionPregunta += 1;
                    ultimoIndex = p.index;

                } else if (p.detonador && p.index === 2 && posicionPregunta === 1) {
                    if (listaOpciones[0] === p.detonador) {
                        const detonador = p.detonador;
                        const preguntaPrincipal = pregunta.preguntas[0].index;
                        const preguntaActivar = p.index;

                        configurarPreguntasAdicionales(pregunta.id, preguntaPrincipal, preguntaActivar, detonador);
                    }

                    posicionOpcion += 1;
                    posicionPregunta += 1;
                    ultimoIndex = p.index;

                } else if (p.detonador && p.index === ultimoIndex) {
                    posicionOpcion -= 1;
                    ultimoIndex = p.index;

                } else {
                    if (p.detonador && listaOpciones[posicionOpcion] === p.detonador) {
                        const detonador = p.detonador;
                        let iterador = posicionPregunta - contadorOpciones;

                        if (iterador < 0) iterador = 0;

                        const preguntaPrincipal = pregunta.preguntas[iterador].index;
                        const preguntaActivar = p.index;

                        configurarPreguntasAdicionales(pregunta.id, preguntaPrincipal, preguntaActivar, detonador);
                    }

                    posicionOpcion += 1;
                    posicionPregunta += 1;
                    ultimoIndex = p.index;
                }
            });
        }
    });
}





// //Funciones para controlar carga de archivos
// document.addEventListener("DOMContentLoaded", () => {
//   const inputArchivo = document.getElementById("archivoPregunta");

//   inputArchivo.addEventListener("change", async (event) => {
//     const archivo = event.target.files[0];
//     if (!archivo) return;

//     // Validación frontend
//     const tiposPermitidos = [
//       "image/jpeg",
//       "image/png",
//       "application/pdf",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"        // .xlsx
//     ];

//     if (archivo.size > 10 * 1024 * 1024) {
//       alert("El archivo supera los 10MB.");
//       return;
//     }

//     if (!tiposPermitidos.includes(archivo.type)) {
//       alert("Tipo de archivo no permitido.");
//       return;
//     }

//     // Enviar archivo al backend para revisión
//     const formData = new FormData();
//     formData.append("archivo", archivo);

//     const res = await fetch("http://localhost:8000/validar-archivo", {
//       method: "POST",
//       body: formData
//     });

//     const data = await res.json();

//     if (res.ok && data.aprobado) {
//       alert("Archivo validado correctamente.");
//       // Podrías guardar el archivo en una variable para enviarlo luego
//     } else {
//       alert(`Archivo rechazado: ${data.detalle || "Motivo desconocido"}`);
//       inputArchivo.value = ""; // Limpiar input
//     }
//   });
// });

function obtenerIdsGrupos() {
    const grupos = document.querySelectorAll('.grupo-preguntas');
    const ids = [];

    grupos.forEach(grupo => {
        const idCompleto = grupo.id;
        const idNumero = idCompleto.split('-')[1];
        ids.push(idNumero);
    });

    return ids;
    }

// Buscador reutilizable todas las plantillas
document.addEventListener("DOMContentLoaded", () => {
  const buscador = document.getElementById("buscador");

  if (buscador) {
    buscador.addEventListener("input", function () {
      const filtro = this.value.toLowerCase();
      const filas = document.querySelectorAll("#proveedoresContainer tr");

      filas.forEach(fila => {
        const nombre = fila.children[0]?.textContent.toLowerCase() || "";
        const email = fila.children[1]?.textContent.toLowerCase() || "";
        const formulario = fila.children[2]?.textContent.toLowerCase() || "";

        const coincide =
          nombre.includes(filtro) ||
          email.includes(filtro) ||
          formulario.includes(filtro);

        fila.style.display = coincide ? "" : "none";
      });
    });
  }
});

    // Boton ayuda
    document.addEventListener('DOMContentLoaded', function () {
      // Elementos del modal
      const modal = document.getElementById('modalAyudaPersonalizado');
      const btnAbrir = document.getElementById('botonAyuda');
      const btnCerrar = document.querySelector('.cerrar-modal');
      const btnCerrarModal = document.querySelector('.cerrar-modal-btn');

      // Abrir modal
      btnAbrir.addEventListener('click', function () {
        modal.classList.add('mostrar');
        document.body.style.overflow = 'hidden';
      });

      // Cerrar modal
      function cerrarModal() {
        modal.classList.remove('mostrar');
        document.body.style.overflow = '';
      }

      btnCerrar.addEventListener('click', cerrarModal);
      btnCerrarModal.addEventListener('click', cerrarModal);

      // Cerrar al hacer clic fuera del contenido
      modal.addEventListener('click', function (e) {
        if (e.target === modal) {
          cerrarModal();
        }
      });

      // Cerrar con tecla ESC
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('mostrar')) {
          cerrarModal();
        }
      });
    });
