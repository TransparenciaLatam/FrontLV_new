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


function selectorPreguntas_armarPregunta(data,container){
    
    


    container.innerHTML = "";
    data.forEach(preg => {

      const card = document.createElement("div");
      card.className = "category-card";

      const header = document.createElement("div");
      header.className = "category-header";
      header.textContent = preg.categoria.toUpperCase();

      const list = document.createElement("div");

      preg.preguntas.forEach((q) => {
        const item = document.createElement("div");
        item.className = "question-item";
        item.dataset.id = q.id;

        const label = document.createElement("span");
        label.textContent = q.preguntas[0].texto_pregunta;

        const actions = document.createElement("div");
        actions.className = "question-actions";
        actions.innerHTML = `
          <button class="edit-btn" data-id="${q.id}">
            <i class="fas fa-edit text-primary"></i>
          </button>
          <button class="delete-btn" data-id="${q.id}">
            <i class="fas fa-trash text-danger"></i>
          </button>
        `;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "form-check-input";
        checkbox.value = q.id;


        checkbox.addEventListener("change", () => {
          q.id &&
            (checkbox.checked
              ? selectedQuestions.add(q.id)
              : selectedQuestions.delete(q.id));
          updateSelectedQuestions();
        });

        item.appendChild(label);
        item.appendChild(checkbox);
        item.appendChild(actions);
        list.appendChild(item);
      });

      card.appendChild(header);
      card.appendChild(list);
      container.appendChild(card);

  })

}



  function updateSelectedQuestions() {
    const container = document.getElementById("selected-questions");
    const btn = document.getElementById("generate-form");

    if (selectedQuestions.size === 0) {
      container.innerHTML = '<p class="text-muted">No hay preguntas seleccionadas</p>';
      btn.disabled = true;
      return;
    }
    console.log(selectedQuestions)
    container.innerHTML = `<ul class="list-group">
      ${Array.from(selectedQuestions)
        .map((id) => {
          const q = allQuestionsFlat.find((q) => q.id === id);
          return `<li class="list-group-item">${q?.text || "Pregunta " + id}</li>`;
        })
        .join("")}
    </ul><p class="mt-2">Total: ${selectedQuestions.size} preguntas</p>`;
    btn.disabled = false;
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
    subtexto.textContent = "Formatos soportados: PDF, JPG, PNG (Máx. 5MB)";
    div.appendChild(subtexto);

    // --- Input file (oculto)
    const input = document.createElement("input");
    input.type = "file";
    input.className = "d-none";
    input.id = `file-input-${pregunta.index}`;
    input.name = `pregunta-${pregunta.index}[]`;
    input.multiple = true;

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
    subtexto.textContent = "Formatos soportados: PDF, JPG, PNG (Máx. 5MB)";
    div.appendChild(subtexto);

    // --- Input file (oculto)
    const input = document.createElement("input");
    input.type = "file";
    input.className = "d-none";
    input.id = `file-input-${pregunta.index}`;
    input.name = `pregunta-${pregunta.index}[]`;
    input.multiple = true;

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





//Funciones para controlar carga de archivos

function configurarSubidaDeArchivos(selector = 'input[type="file"]') {
  document.querySelectorAll(selector).forEach(input => {
    input.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('nombre_input', event.target.name); // opcional

      try {
        const res = await fetch('http://localhost:8000/subir-archivo', {
          method: 'POST',
          body: formData
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.detail || 'Error al subir archivo');
          return;
        }

        console.log("Archivo subido en:", data.url);

        // Guardar URL en dataset del contenedor
        const container = event.target.closest('.pregunta');
        if (container) {
          container.dataset.fileUrl = data.url;
        }

      } catch (err) {
        console.error('Error al subir archivo', err);
        alert('Error al subir archivo');
      }
    });
  });
}




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