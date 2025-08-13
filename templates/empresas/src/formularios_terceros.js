function obtenerNumero(nombrePregunta) {
  // Busca la primera secuencia de dígitos y la convierte en número
  const match = nombrePregunta.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}



function recolectarDatosFormulario() {
  const grupos = document.querySelectorAll('.grupo-preguntas');
  const resultado = [];

  grupos.forEach(grupo => {
    // Obtener el id numérico sin la palabra 'grupo-'
    const idGrupo = grupo.id.replace('grupo-', '');

    const respuestas = {};

    // Para cada pregunta dentro del grupo
    const preguntas = grupo.querySelectorAll('.pregunta');



    preguntas.forEach(pregunta => {
      // Suponiendo que cada pregunta tiene al menos un input/select/textarea
      // Usamos el atributo 'name' para identificar la pregunta
      const input = pregunta.querySelector('input, select, textarea');

      if (!input) return; // No hay input, saltar

      let nombre = input.name || input.id;



      if (!nombre) return;



    //   // Solo tomar la respuesta si el elemento está visible
    //   // (puedes quitar esta línea si quieres tomar todas aunque estén ocultas)
         preguntaNumero = obtenerNumero(nombre)
         nombrePregunta = pregunta.getAttribute('id-respuesta'); 

      if (preguntaNumero != 1  &&  pregunta.style.display === 'none') {
        // Si querés guardar vacio cuando está oculto:
        respuestas[nombrePregunta.replace(/-/g, '_')] = '';
        return;
      }

      

      let valor;

      switch (input.type) {
        case 'checkbox':
            const valoresSeleccionados = [];

            // Selecciona todos los checkboxes con el mismo name que el input actual
            const checkboxes = document.querySelectorAll(`input[name="${nombre}"]`);

            checkboxes.forEach(chk => {
            if (chk.checked) {
                valoresSeleccionados.push(chk.value);
            }
            });

            valor = valoresSeleccionados;
            break;

        case 'radio':
          // En radio hay muchos inputs con mismo name, hay que buscar el seleccionado dentro del grupo
          const seleccionado = pregunta.querySelector(`input[name="${nombre}"]:checked`);
          valor = seleccionado ? seleccionado.value : '';
          break;

        default:
          valor = input.value;
      }

      // Cambiar guiones por guion bajo para la clave (ej: pregunta-1 -> pregunta_1)
      respuestas[nombrePregunta.replace(/-/g, '_')] = valor;
    });

    resultado.push({
      id: Number(idGrupo),
      respuestas: respuestas,
    });
  });

   guardarRespuestas(resultado);
}


async function guardarRespuestas(respuestas){

const dataStr = localStorage.getItem("infoTercero");
const infoTercero = JSON.parse(dataStr);

const categoria = sessionStorage.getItem("categoria_actual");

// Datos adicionales que tu API espera
const id_tercero = infoTercero.idTercero;
const formulario_id = infoTercero.tercero.formulario_id;
const categorias = categoria;
const progreso_total = 20;
const progreso_categoria = 100;


  const payload = {
      respuestas: respuestas,
      id_tercero: id_tercero,
      formulario_id: formulario_id,
      categorias: categorias,
      progreso_total: progreso_total,
      progreso_categoria: progreso_categoria
  };

    try {
        console.log(payload)
        const response = await fetch("http://localhost:8000/respuestas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`Error al enviar`, await response.text());
            alert(`Error al enviar`, await response.text())
            window.location.href = "../terceros.html";
        } else {
            console.log(`Enviado correctamente`);
            alert(`Enviado correctamente`)
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la solicitud:", error)
    }



}

















async function obtenerRespuestas(categoria, id_tercero) {


  
    try {
        const url = `http://localhost:8000/respuestas?categorias=${encodeURIComponent(categoria)}&id_tercero=${id_tercero}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error("Error en la solicitud:", response.statusText);
            alert("Error en la solicitud:", response.statusText);
            return;
        }

        const data = await response.json();

        // Si está vacío no hace nada
        if (!data || (Array.isArray(data) && data.length === 0)) {
            console.log("No hay respuestas para cargar.");
            alert("No hay respuestas para cargar.");
            return;
        }

        // Si trae datos, llama a cargarRespuestas
        cargarRespuestas(data.respuestas);

    } catch (error) {
        console.error("Error al obtener respuestas:", error);
        alert("Error al obtener respuestas:", error);
    }
}








function cargarRespuestas(respuestasArray) {
    // Crear loader
    let loader = document.createElement("div");
    loader.id = "loader-respuestas";
    loader.innerHTML = `
        <div style="
            position: fixed;
            top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        ">
            <div style="
                background: white;
                padding: 20px 40px;
                border-radius: 8px;
                font-size: 18px;
                font-family: sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
            ">
                <div class="spinner" style="
                    width: 40px;
                    height: 40px;
                    border: 4px solid #ccc;
                    border-top: 4px solid #3498db;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 10px;
                "></div>
                Cargando respuestas...
            </div>
        </div>
    `;
    document.body.appendChild(loader);

    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
        respuestasArray.forEach(item => {
            const grupoId = item.id;
            const respuestas = item.respuestas;

            const grupo = document.getElementById(`grupo-${grupoId}`);
            if (!grupo) return;

            // Obtener todas las preguntas del grupo como array
            const preguntas = Array.from(grupo.querySelectorAll("[id-respuesta]"));

            preguntas.forEach((preguntaDiv, index) => {
                // Convertir el id-respuesta a clave en JSON
                const preguntaKey = preguntaDiv.getAttribute("id-respuesta").replace(/-/g, "_");

                if (!(preguntaKey in respuestas)) return;

                const valor = respuestas[preguntaKey];

                const input = preguntaDiv.querySelector("input, textarea, select");
                if (!input) return;

                // Asignar valor
                if (input.type === "radio") {
                    const radio = preguntaDiv.querySelector(`input[type="radio"][value="${valor}"]`);
                    if (radio) radio.checked = true;
                } else if (input.type === "checkbox") {
                    if (Array.isArray(valor)) {
                        valor.forEach(v => {
                            const checkbox = preguntaDiv.querySelector(`input[type="checkbox"][value="${v}"]`);
                            if (checkbox) checkbox.checked = true;
                        });
                    }
                } else {
                    input.value = valor;
                }

                // NUEVO: Mostrar las preguntas adicionales si tienen contenido
                if (index > 0) { // solo las que no son la primera
                    if (valor !== "" && !(Array.isArray(valor) && valor.length === 0)) {
                        preguntaDiv.style.display = "block"; // quitar display:none
                    }
                }
            });
        });

        // Quitar loader
        loader.remove();
    }, 300);
}
