
/* =====================================
   TABLERO DE TAREAS DE TAKSCHOOL
   ===================================== */

const columnaPorHacer = document.getElementById("col-por-hacer");
const columnaEnProgreso = document.getElementById("col-en-progreso");
const columnaCompletado = document.getElementById("col-completado");
const botonNuevaTarea = document.getElementById("btnNuevaTareaKanban");

function obtenerTareas() {
    return JSON.parse(localStorage.getItem("tareas")) || [];
}

function guardarTareasKanban(tareas) {
    localStorage.setItem("tareas", JSON.stringify(tareas));
    mostrarTareasKanban();
}

function obtenerEstado(tarea) {
    if (tarea.completada) return "completado";

    return tarea.estado || "por-hacer";
}

function crearBoton(texto, clase, accion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = texto;
    boton.className = clase;
    boton.addEventListener("click", accion);
    return boton;
}

/* =====================================
   MOSTRAR TAREAS
   ===================================== */

function mostrarTareasKanban() {
    if (!columnaPorHacer || !columnaEnProgreso || !columnaCompletado) {
        return;
    }

    columnaPorHacer.innerHTML = "";
    columnaEnProgreso.innerHTML = "";
    columnaCompletado.innerHTML = "";

    const tareas = obtenerTareas();

    tareas.forEach((tarea, index) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-kanban";

        const titulo = document.createElement("div");
        titulo.className = "tarjeta-kanban-titulo";
        titulo.textContent = tarea.descripcion || tarea.titulo || "Sin título";

        const etiquetas = document.createElement("div");
        etiquetas.className = "tarjeta-kanban-tags";

        const prioridad = document.createElement("span");
        const nivel = ["alta", "media", "baja"].includes(tarea.prioridad)
            ? tarea.prioridad
            : "media";

        prioridad.className = "badge-prioridad " + nivel;
        prioridad.textContent = "Prioridad " + nivel;

        const materia = document.createElement("span");
        materia.className = "tarjeta-kanban-materia";
        materia.textContent = tarea.materia || "General";

        etiquetas.append(prioridad, materia);
        tarjeta.append(titulo, etiquetas);

        if (tarea.fecha) {
            const fecha = document.createElement("small");
            fecha.textContent = "Fecha: " + tarea.fecha;
            tarjeta.appendChild(fecha);
        }

        const botones = document.createElement("div");
        botones.className = "tarjeta-kanban-botones";

        const estado = obtenerEstado(tarea);

        if (estado === "por-hacer") {
            botones.appendChild(
                crearBoton("Empezar", "btn-editar-tarea", () => {
                    cambiarEstado(index, "en-progreso");
                })
            );
        } else if (estado === "en-progreso") {
            botones.appendChild(
                crearBoton("Volver", "btn-editar-tarea", () => {
                    cambiarEstado(index, "por-hacer");
                })
            );

            botones.appendChild(
                crearBoton("Completar", "btn-editar-tarea", () => {
                    cambiarEstado(index, "completado");
                })
            );
        } else {
            botones.appendChild(
                crearBoton("Volver", "btn-editar-tarea", () => {
                    cambiarEstado(index, "en-progreso");
                })
            );
        }

        botones.appendChild(
            crearBoton("Editar", "btn-editar-tarea", () => {
                editarTareaKanban(index);
            })
        );

        botones.appendChild(
            crearBoton("Eliminar", "btn-eliminar-tarea", () => {
                eliminarTareaKanban(index);
            })
        );

        tarjeta.appendChild(botones);

        if (estado === "en-progreso") {
            columnaEnProgreso.appendChild(tarjeta);
        } else if (estado === "completado") {
            columnaCompletado.appendChild(tarjeta);
        } else {
            columnaPorHacer.appendChild(tarjeta);
        }
    });
}

/* =====================================
   CAMBIAR DE COLUMNA
   ===================================== */

function cambiarEstado(index, nuevoEstado) {
    const tareas = obtenerTareas();
    if (!tareas[index]) return;

    tareas[index].estado = nuevoEstado;
    tareas[index].completada = nuevoEstado === "completado";

    guardarTareasKanban(tareas);
}

/* =====================================
   AGREGAR TAREA DESDE EL TABLERO
   ===================================== */

if (botonNuevaTarea) {
    botonNuevaTarea.addEventListener("click", () => {
        const descripcion = prompt("Título de la tarea:");
        if (!descripcion || !descripcion.trim()) return;

        const materia = prompt("Materia:", "General");
        if (!materia || !materia.trim()) return;

        const prioridadRespuesta = prompt(
            "Prioridad: alta, media o baja",
            "media"
        );

        if (prioridadRespuesta === null) return;

        const prioridad = prioridadRespuesta.trim().toLowerCase();

        if (!["alta", "media", "baja"].includes(prioridad)) {
            alert("Escribe alta, media o baja.");
            return;
        }

        const fecha = prompt(
            "Fecha de entrega (AAAA-MM-DD). Déjala vacía si no tiene fecha:",
            ""
        );

        if (fecha === null) return;

        const tareas = obtenerTareas();

        tareas.push({
            id: Date.now().toString(),
            descripcion: descripcion.trim(),
            materia: materia.trim(),
            fecha: fecha.trim(),
            prioridad,
            estado: "por-hacer",
            completada: false
        });

        guardarTareasKanban(tareas);
    });
}

/* =====================================
   EDITAR TAREA
   ===================================== */

function editarTareaKanban(index) {
    const tareas = obtenerTareas();
    const tarea = tareas[index];

    if (!tarea) return;

    const descripcion = prompt(
        "Editar título:",
        tarea.descripcion || tarea.titulo || ""
    );
    if (descripcion === null) return;

    const materia = prompt("Editar materia:", tarea.materia || "General");
    if (materia === null) return;

    const fecha = prompt(
        "Editar fecha (AAAA-MM-DD). Vacía si no tiene:",
        tarea.fecha || ""
    );
    if (fecha === null) return;

    if (!descripcion.trim() || !materia.trim()) {
        alert("El título y la materia no pueden quedar vacíos.");
        return;
    }

    tarea.descripcion = descripcion.trim();
    tarea.materia = materia.trim();
    tarea.fecha = fecha.trim();

    guardarTareasKanban(tareas);
}

/* =====================================
   ELIMINAR TAREA
   ===================================== */

function eliminarTareaKanban(index) {
    const tareas = obtenerTareas();
    if (!tareas[index]) return;

    if (!confirm("¿Deseas eliminar esta tarea?")) return;

    tareas.splice(index, 1);
    guardarTareasKanban(tareas);
}

/* =====================================
   ACTUALIZAR SI CAMBIA OTRA PÁGINA
   ===================================== */

window.addEventListener("storage", (evento) => {
    if (evento.key === "tareas") {
        mostrarTareasKanban();
    }
});

mostrarTareasKanban();
