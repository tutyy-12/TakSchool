
// ===============================
// USUARIO
// ===============================
const elementoNombre = document.getElementById("nombreUsuario");
const botonEditarNombre = document.getElementById("editarNombreUsuario");

function cargarNombreUsuario() {
    const nombre = localStorage.getItem("usuario") || "Usuario";

    if (elementoNombre) {
        elementoNombre.textContent = nombre;
    }
}

function editarNombreUsuario() {
    const nombreActual = localStorage.getItem("usuario") || "Usuario";
    const nuevoNombre = prompt(
        "¿Cómo quieres que te llamemos en TakSchool?",
        nombreActual
    );

    if (nuevoNombre === null) return;

    if (!nuevoNombre.trim()) {
        alert("Escribe un nombre válido.");
        return;
    }

    localStorage.setItem("usuario", nuevoNombre.trim());
    cargarNombreUsuario();
}

if (botonEditarNombre) {
    botonEditarNombre.addEventListener("click", editarNombreUsuario);
}

cargarNombreUsuario();

// ===============================
// TAREAS GUARDADAS
// ===============================
let tareas = JSON.parse(localStorage.getItem("tareas")) || [];

const formulario = document.getElementById("taskForm");
const lista = document.getElementById("taskList");
const campoFecha = document.getElementById("taskFecha");

function guardarTareas() {
    localStorage.setItem("tareas", JSON.stringify(tareas));

    if (typeof mostrarTareasKanban === "function") {
        mostrarTareasKanban();
    }
}

// ===============================
// CALENDARIO
// ===============================
const calendarioGrid = document.getElementById("calendarioGrid");
const tituloCalendario = document.getElementById("calendarario-mes-año");
const botonMesAnterior = document.getElementById("prevMonthBtn");
const botonMesSiguiente = document.getElementById("nextMonthBtn");

let fechaActual = new Date();
let fechaSeleccionada = "";

function mostrarCalendario() {
    if (!calendarioGrid || !tituloCalendario) return;

    calendarioGrid.innerHTML = "";

    const mes = fechaActual.getMonth();
    const año = fechaActual.getFullYear();

    const nombreMes = fechaActual.toLocaleDateString("es-ES", {
        month: "long"
    });

    tituloCalendario.textContent =
        nombreMes.charAt(0).toUpperCase() +
        nombreMes.slice(1) + " " + año;

    const primerDia = new Date(año, mes, 1).getDay();
    const diasMes = new Date(año, mes + 1, 0).getDate();
    const espaciosIniciales = (primerDia + 6) % 7;
    const hoy = new Date();

    for (let i = 0; i < espaciosIniciales; i++) {
        calendarioGrid.insertAdjacentHTML("beforeend", "<span></span>");
    }

    for (let dia = 1; dia <= diasMes; dia++) {
        const fechaDia =
            año + "-" +
            String(mes + 1).padStart(2, "0") + "-" +
            String(dia).padStart(2, "0");

        const tieneTarea = tareas.some(
            tarea => tarea.fecha === fechaDia
        );

        const esHoy =
            dia === hoy.getDate() &&
            mes === hoy.getMonth() &&
            año === hoy.getFullYear();

        const clases = [];

        if (esHoy) clases.push("active-day");
        if (tieneTarea) clases.push("dia-con-tarea");
        if (fechaDia === fechaSeleccionada) {
            clases.push("dia-seleccionado");
        }

        calendarioGrid.insertAdjacentHTML("beforeend", `
            <span
                class="${clases.join(" ")}"
                data-fecha="${fechaDia}"
                title="${tieneTarea ? "Tienes tarea este día" : "Seleccionar fecha"}"
                role="button"
                tabindex="0"
            >${dia}</span>
        `);
    }
}

// Seleccionar una fecha en el calendario
if (calendarioGrid) {
    calendarioGrid.addEventListener("click", function (e) {
        const dia = e.target.closest("[data-fecha]");
        if (!dia) return;

        fechaSeleccionada = dia.dataset.fecha;

        if (campoFecha) {
            campoFecha.value = fechaSeleccionada;
        }

        mostrarCalendario();
    });

    calendarioGrid.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;

        const dia = e.target.closest("[data-fecha]");
        if (!dia) return;

        e.preventDefault();
        fechaSeleccionada = dia.dataset.fecha;

        if (campoFecha) {
            campoFecha.value = fechaSeleccionada;
        }

        mostrarCalendario();
    });
}

// Cambiar de mes
if (botonMesAnterior) {
    botonMesAnterior.addEventListener("click", function () {
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        mostrarCalendario();
    });
}

if (botonMesSiguiente) {
    botonMesSiguiente.addEventListener("click", function () {
        fechaActual.setMonth(fechaActual.getMonth() + 1);
        mostrarCalendario();
    });
}

// ===============================
// MOSTRAR TAREAS
// ===============================
function mostrarTareas() {
    if (!lista) return;

    lista.innerHTML = "";

    tareas.forEach((tarea, index) => {
        const elemento = document.createElement("li");
        elemento.className = "task-item";

        const etiqueta = document.createElement("label");
        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = Boolean(tarea.completada);

        casilla.addEventListener("change", function () {
            completarTarea(index);
            
        });

        const texto = document.createElement("span");
        texto.textContent = `${tarea.materia} - ${tarea.descripcion}`;

        if (tarea.completada) {
            texto.classList.add("tarea-completada");
        }

        etiqueta.append(casilla, texto);

        const acciones = document.createElement("div");
        acciones.className = "task-actions";

        const fecha = document.createElement("span");
        fecha.className = "task-date";
        fecha.textContent = tarea.fecha || "";

        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.className = "btn-editar";
        botonEditar.title = "Editar tarea";
        botonEditar. innerHTML= '<span class="material-symbols-outlined">edit</span>';
        botonEditar.addEventListener("click", function () {
            editarTarea(index);

            
        });

        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "btn-delete-task";
        botonEliminar.title = "Eliminar tarea";
        botonEliminar. innerHTML=  '<span class="material-symbols-outlined">delete</span>';
        botonEliminar.addEventListener("click", function () {
            eliminarTarea(index);
        });

        acciones.append(fecha, botonEditar, botonEliminar);
        elemento.append(etiqueta, acciones);
        lista.appendChild(elemento);
    });

    actualizarContadores();
    actualizarNotificaciones();
}

// ===============================
// EDITAR TAREA
// ===============================

function editarTarea(index) {
    const tarea = tareas[index];
    if (!tarea) return;

    const materia = prompt("Editar materia:", tarea.materia);
    if (materia === null) return;

    const descripcion = prompt(
        "Editar descripción:",
        tarea.descripcion
    );
    if (descripcion === null) return;

    const fecha = prompt(
        "Editar fecha (AAAA-MM-DD):",
        tarea.fecha
    );
    if (fecha === null) return;

    const fechaLimpia = fecha.trim();

    const coincideFormato = /^\d{4}-\d{2}-\d{2}$/.test(fechaLimpia);
    const fechaConvertida = new Date(fechaLimpia + "T12:00:00");

    const fechaValida =
        coincideFormato &&
        !Number.isNaN(fechaConvertida.getTime()) &&
        fechaConvertida.getFullYear() === Number(fechaLimpia.slice(0, 4)) &&
        fechaConvertida.getMonth() + 1 === Number(fechaLimpia.slice(5, 7)) &&
        fechaConvertida.getDate() === Number(fechaLimpia.slice(8, 10));

    if (!materia.trim() || !descripcion.trim() || !fechaValida) {
        alert("Completa los campos y escribe una fecha válida como 2026-10-20.");
        return;
    }

    tarea.materia = materia.trim();
    tarea.descripcion = descripcion.trim();
    tarea.fecha = fechaLimpia;

    guardarTareas();
    mostrarTareas();
    mostrarCalendario();
    actualizarEventos();
}


// ===============================
// AGREGAR TAREA
// ===============================
if (formulario) {
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();

        const materia = document.getElementById("taskMateria");
        const descripcion = document.getElementById("taskDescripcion");

        if (!materia || !descripcion || !campoFecha) return;

        const nuevaTarea = {
             id: Date.now().toString(),
    materia: materia.value.trim(),
    descripcion: descripcion.value.trim(),
    fecha: campoFecha.value,
    prioridad: "media",
    estado: "por-hacer",
    completada: false
        };

        if (
            !nuevaTarea.materia ||
            !nuevaTarea.descripcion ||
            !nuevaTarea.fecha
        ) {
            alert("Completa la materia, la descripción y la fecha.");
            return;
        }

        tareas.push(nuevaTarea);
        guardarTareas();

        fechaSeleccionada = nuevaTarea.fecha;

        mostrarTareas();
        mostrarCalendario();

        formulario.reset();
        fechaSeleccionada = "";
        mostrarCalendario();
    });
}

// ===============================
// COMPLETAR TAREA
// ===============================
function completarTarea(index) {
    if (!tareas[index]) return;

    tareas[index].completada = !tareas[index].completada;
    tareas[index].estado = tareas[index].completada
    ? "completado"
        : "por-hacer";
    guardarTareas();
    mostrarTareas();
    mostrarCalendario();
}

// ===============================
// ELIMINAR TAREA
// ===============================
function eliminarTarea(index) {
    if (!tareas[index]) return;

    if (confirm("¿Deseas eliminar esta tarea?")) {
        tareas.splice(index, 1);

        guardarTareas();
        mostrarTareas();
        mostrarCalendario();
    }
}

// ===============================
// NOTIFICACIONES
// ===============================
const campana = document.getElementById("campana");
const notificationBox = document.getElementById("notificationBox");
const notificationList = document.getElementById("notificationList");

function actualizarNotificaciones() {
    if (!notificationList) return;

    const pendientes = tareas.filter(tarea => !tarea.completada);

    if (campana) {
        campana.classList.toggle(
            "sin-notificaciones",
            pendientes.length === 0
        );
    }

    if (pendientes.length === 0) {
        notificationList.innerHTML =
            "<p>No tienes tareas pendientes. ¡Todo al día!</p>";
        return;
    }

    notificationList.innerHTML = "";

    pendientes.slice(0, 5).forEach(tarea => {
        const aviso = document.createElement("p");
        const titulo = document.createElement("strong");
        titulo.textContent = tarea.materia;

        const descripcion = document.createElement("span");
        descripcion.textContent = tarea.descripcion;

        const fecha = document.createElement("small");
        fecha.textContent = "Fecha: " + tarea.fecha;

        aviso.className = "notification-item";
        aviso.append(titulo, descripcion, fecha);
        notificationList.appendChild(aviso);
    });

    if (pendientes.length > 5) {
        const mas = document.createElement("p");
        mas.textContent = `Y ${pendientes.length - 5} tareas más.`;
        notificationList.appendChild(mas);
    }
}

if (campana && notificationBox) {
    campana.addEventListener("click", function (e) {
        e.stopPropagation();
        notificationBox.classList.toggle("active");
    });

    notificationBox.addEventListener("click", function (e) {
        e.stopPropagation();
    });

    document.addEventListener("click", function () {
        notificationBox.classList.remove("active");
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            notificationBox.classList.remove("active");
        }
    });
}

// ===============================
// CONTADORES
// ===============================
function actualizarContadores() {
    const contadorPendientes = document.getElementById("contadorPendientes");
    const contadorCompletadas = document.getElementById("contadorCompletadas");

    if (contadorPendientes) {
        contadorPendientes.textContent =
            tareas.filter(tarea => !tarea.completada).length;
    }

    if (contadorCompletadas) {
        contadorCompletadas.textContent =
            tareas.filter(tarea => tarea.completada).length;
    }

    actualizarEventos();
}

// ===============================
// EVENTOS DE HOY
// ===============================
function actualizarEventos() {
    const contadorEventos = document.getElementById("contadorEventos");
    if (!contadorEventos) return;

    const hoy = new Date();
    const fechaHoy =
        hoy.getFullYear() + "-" +
        String(hoy.getMonth() + 1).padStart(2, "0") + "-" +
        String(hoy.getDate()).padStart(2, "0");

    // Contar las tareas cuya fecha es hoy.
    const eventosHoy = tareas.filter(
        tarea => tarea.fecha === fechaHoy
    ).length;

    contadorEventos.textContent = eventosHoy;
}

// ===============================
// MENÚ ACTIVO
// ===============================
const botonesMenu = document.querySelectorAll(".menu-item");

botonesMenu.forEach(boton => {
    boton.addEventListener("click", function () {
        botonesMenu.forEach(item => item.classList.remove("active"));
        this.classList.add("active");
    });
});

// ===============================
// INICIAR
// ===============================
mostrarCalendario();
mostrarTareas();
actualizarEventos();

window.addEventListener("storage", function (evento) {
    if (evento.key === "tareas") {
        tareas = JSON.parse(evento.newValue) || [];

        mostrarTareas();
        mostrarCalendario();
        actualizarContadores();
        actualizarEventos();
    }
});
/* ===============================
   Parte de TAREAS
   =============================== */
const botonNuevaTareaTablero = document.getElementById('btnNuevaTarea');

if (botonNuevaTareaTablero) {
    botonNuevaTareaTablero.addEventListener('click', () => {
        const titulo = prompt("Ingresa el título de la tarea:", "Nueva Tarea");
        if (!titulo || !titulo.trim()) return;

        const materia = prompt("Ingresa la materia:", "General");
        if (!materia || !materia.trim()) return;

        const prioridadInput = prompt("Prioridad (alta, media, baja):", "alta");
        if (prioridadInput === null) return;
        
        let clasePrioridad = 'alta';
        const pLimpia = prioridadInput.toLowerCase().trim();
        if (['media', 'baja'].includes(pLimpia)) {
            clasePrioridad = pLimpia;
        }

        // Crear la estructura de la tarjeta Kanban
        const nuevaTarjeta = document.createElement('div');
        nuevaTarjeta.className = 'tarjeta-kanban';
        nuevaTarjeta.innerHTML = `
            <div class="tarjeta-kanban-titulo">${titulo.trim()}</div>
            <div class="tarjeta-kanban-tags">
                <span class="badge-prioridad ${clasePrioridad}">Prioridad</span>
                <span class="tarjeta-kanban-materia">${materia.trim()}</span>
            </div>
        `;

        // Insertar la tarjeta en la primera columna ("Por hacer")
        const columnaPorHacer = document.getElementById('col-por-hacer');
        if (columnaPorHacer) {
            columnaPorHacer.appendChild(nuevaTarjeta);
        }
    });
}


/* ==================================
   MOSTRAR TAREAS EN EL TABLERO
   ================================== */
function mostrarTareasKanban() {
    const porHacer = document.getElementById("col-por-hacer");
    const enProgreso = document.getElementById("col-en-progreso");
    const completado = document.getElementById("col-completado");

    // Si no estamos en la página Tareas, no hacer nada.
    if (!porHacer || !enProgreso || !completado) return;

    // Limpiar las columnas antes de volver a mostrar las tareas.
    porHacer.innerHTML = "";
    enProgreso.innerHTML = "";
    completado.innerHTML = "";

    // Leer las tareas guardadas en el navegador.
    const tareasGuardadas =
        JSON.parse(localStorage.getItem("tareas")) || [];

    tareasGuardadas.forEach((tarea) => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-kanban";

        const titulo = document.createElement("div");
        titulo.className = "tarjeta-kanban-titulo";
        titulo.textContent = tarea.descripcion;

        const materia = document.createElement("span");
        materia.className = "tarjeta-kanban-materia";
        materia.textContent = tarea.materia;

        const fecha = document.createElement("small");
        fecha.textContent = tarea.fecha || "";

        tarjeta.append(titulo, materia, fecha);

        // Las tareas completadas van a Completado.
        // Las demás aparecen en Por hacer.
        if (tarea.completada) {
            completado.appendChild(tarjeta);
        } else {
            porHacer.appendChild(tarjeta);
        }
    });
}

// Mostrar las tareas cuando se abre la página.
mostrarTareasKanban();
