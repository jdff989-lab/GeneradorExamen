const generarBtn = document.getElementById("generarBtn");
const limpiarBtn = document.getElementById("limpiarBtn");
const resultado = document.getElementById("resultado");
const estado = document.getElementById("estado");

generarBtn.addEventListener("click", generarExamen);
limpiarBtn.addEventListener("click", limpiar);

async function generarExamen() {
  const texto = document.getElementById("texto").value.trim();
  const numeroPreguntas = Number(document.getElementById("numeroPreguntas").value);
  const dificultad = document.getElementById("dificultad").value;

  if (!texto) {
    mostrarError("Pega primero unos apuntes o un texto.");
    return;
  }

  estado.textContent = "Generando examen con IA...";
  resultado.style.display = "none";

  try {
    const response = await fetch("/api/examen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        texto,
        numeroPreguntas,
        dificultad
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "No se pudo generar el examen.");
    }

    pintarExamen(data);
    estado.textContent = "Examen generado correctamente.";
  } catch (error) {
    console.error(error);
    estado.textContent = "IA no disponible. Mostrando examen de ejemplo.";

    pintarExamen({
      titulo: "Examen de ejemplo",
      preguntas: [
        {
          pregunta: "¿Cuál es el objetivo principal de este generador?",
          opciones: [
            "A) Crear imágenes",
            "B) Convertir apuntes en preguntas tipo test",
            "C) Editar vídeos",
            "D) Crear música"
          ],
          respuestaCorrecta: "B",
          explicacion: "La aplicación transforma texto en preguntas de examen."
        }
      ]
    });
  }
}

function pintarExamen(examen) {
  resultado.style.display = "block";

  resultado.innerHTML = `
    <h2>${examen.titulo}</h2>
    ${examen.preguntas.map((p, index) => `
      <div class="pregunta-card">
        <h3>${index + 1}. ${p.pregunta}</h3>

        <ul class="opciones">
          ${p.opciones.map(opcion => `<li>${opcion}</li>`).join("")}
        </ul>

        <div class="respuesta">
          Respuesta correcta: ${p.respuestaCorrecta}
        </div>

        <p class="explicacion">${p.explicacion}</p>
      </div>
    `).join("")}
  `;
}

function mostrarError(mensaje) {
  estado.textContent = "";
  resultado.style.display = "block";
  resultado.innerHTML = `<p class="error">${mensaje}</p>`;
}

function limpiar() {
  document.getElementById("texto").value = "";
  document.getElementById("numeroPreguntas").value = 5;
  document.getElementById("dificultad").value = "fácil";
  estado.textContent = "";
  resultado.style.display = "none";
  resultado.innerHTML = "";
}