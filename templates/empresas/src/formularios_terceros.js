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

   console.log(resultado);
}


async function guardarRespuestas(respuestas){

const dataStr = localStorage.getItem("infoTercero");
const infoTercero = JSON.parse(dataStr);

console.log("Info del tercero:", infoTercero);

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
        } else {
            console.log(`Enviado correctamente`);
            alert(`Enviado correctamente`)
        }
    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error en la solicitud:", error)
    }



}