
const calendarGrid =
    document.getElementById("calendarGrid");
const monthTitle =
    document.getElementById("monthTitle");
const previousMonth =
    document.getElementById("previousMonth");
const nextMonth =
    document.getElementById("nextMonth");
const todayButton =
    document.getElementById("todayButton");
const miniPrevious =
    document.getElementById("miniPrevious");
const miniNext =
    document.getElementById("miniNext");
const miniMonth =
    document.getElementById("miniMonth");
const miniCalendarGrid =
    document.getElementById("miniCalendarGrid");
const upcomingList =
    document.getElementById("upcomingList");
const rightEvents =
    document.getElementById("rightEvents");
const newReminderButton =
    document.getElementById("newReminderButton");
const reminderModal =
    document.getElementById("reminderModal");
const closeModal =
    document.getElementById("closeModal");
const cancelButton =
    document.getElementById("cancelButton");
const reminderForm =
    document.getElementById("reminderForm");
const today = new Date();
let currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
);

const STORAGE_KEY =
    "taskschool_calendario_nuevo";
let events =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];
function saveEvents() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );
}

function getMonthName(date) {

    return date.toLocaleDateString(
        "es-ES",
        {
            month: "long",
            year: "numeric"
        }
    );
}

function capitalize(text) {

    return text.charAt(0).toUpperCase()
        + text.slice(1);
}

function createDateString(
    year,
    month,
    day
) {

    return (
        year +
        "-" +
        String(month + 1).padStart(2, "0") +
        "-" +
        String(day).padStart(2, "0")
    );
}

function formatDate(date) {

    return createDateString(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    );
}

function renderCalendar() {

    calendarGrid.innerHTML = "";


    monthTitle.textContent =
        capitalize(
            getMonthName(currentDate)
        );


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const previousMonthDays =
        new Date(
            year,
            month,
            0
        ).getDate();


    for (
        let i = firstDay - 1;
        i >= 0;
        i--
    ) {

        createDay(
            previousMonthDays - i,
            true,
            null
        );
    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            createDateString(
                year,
                month,
                day
            );


        createDay(
            day,
            false,
            dateString
        );
    }

    const total =
        calendarGrid.children.length;
    const cells =
        total <= 35 ? 35 : 42;
    const remaining =
        cells - total;
    for (
        let day = 1;
        day <= remaining;
        day++
    ) {
        createDay(
            day,
            true,
            null
        );
    }
    renderMiniCalendar();
    renderUpcoming();
    renderRightEvents();
}
function createDay(
    dayNumber,
    otherMonth,
    dateString
) {
    const day =
        document.createElement("div");

    day.classList.add(
        "calendar-day"
    );


    if (otherMonth) {

        day.classList.add(
            "other-month"
        );

    }
    const number =
        document.createElement("div");


    number.classList.add(
        "day-number"
    );
    number.textContent =
        dayNumber;
    day.appendChild(number);
    if (
        !otherMonth &&
        dateString === formatDate(today)
    ) {

        day.classList.add("today");
    }
    if (
        !otherMonth &&
        dateString
    ) {
        const dayEvents =
            events.filter(
                event =>
                    event.date ===
                    dateString
            );
        dayEvents.forEach(
            event => {
                const eventElement =
                    document.createElement("div");
                eventElement.classList.add(
                    "calendar-event",
                    event.type
                );
                eventElement.textContent =
                    event.title;
                eventElement.title =
                    "Haz clic para eliminar";
                eventElement.addEventListener(
                    "click",
                    function(e) {
                        e.stopPropagation();
                        deleteEvent(
                            event.id
                        );

                    } );
                day.appendChild(
                    eventElement
                );

            }
        );
    
        // Mostrar tareas creadas desde Inicio y Tareas
        const tareasGuardadas = JSON.parse(
            localStorage.getItem("tareas") || "[]"
        );

        tareasGuardadas.forEach(tarea => {
            let fechaTarea = (tarea.fecha || "").trim();

            // Convertir DD-MM-AAAA a AAAA-MM-DD
            const partes = fechaTarea.match(
                /^(\d{2})[-/](\d{2})[-/](\d{4})$/
            );

            if (partes) {
                fechaTarea =
                    `${partes[3]}-${partes[2]}-${partes[1]}`;
            }

            if (fechaTarea === dateString) {
                const elementoTarea = document.createElement("div");

                elementoTarea.classList.add(
                    "calendar-event",
                    "tarea"
                );

                elementoTarea.textContent =
                    "✓ " + (
                        tarea.descripcion ||
                        tarea.titulo ||
                        tarea.materia ||
                        "Tarea"
                    );

                elementoTarea.title = "Tarea de " +
                    (tarea.materia || "General");

                elementoTarea.style.cursor = "default";

                day.appendChild(elementoTarea);
            }
        });


        day.addEventListener(
            "dblclick",
            function() {
                openModal(dateString);

            }
        );

    }


    calendarGrid.appendChild(day);
}

function changeMonth(amount) {

    currentDate.setMonth(
        currentDate.getMonth() + amount
    );

    renderCalendar();
}

previousMonth.addEventListener(
    "click",
    function() {
        changeMonth(-1);

    }
);
nextMonth.addEventListener(
    "click",
    function() {
        changeMonth(1);

    }
);

todayButton.addEventListener(
    "click",
    function() {

        currentDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );

        renderCalendar();

    }
);

miniPrevious.addEventListener(
    "click",
    function() {

        changeMonth(-1);

    }
);
miniNext.addEventListener(
    "click",
    function() {

        changeMonth(1);

    }
);


function renderMiniCalendar() {
    miniCalendarGrid.innerHTML = "";

    miniMonth.textContent = capitalize(
        getMonthName(currentDate)
    );

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(
        year,
        month,
        1
    ).getDay();

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const previousDays = new Date(
        year,
        month,
        0
    ).getDate();

    // Días del mes anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const span = document.createElement("span");

        span.classList.add("other");
        span.textContent = previousDays - i;

        miniCalendarGrid.appendChild(span);
    }

    // Leer las tareas guardadas
    const tareasGuardadas = JSON.parse(
        localStorage.getItem("tareas") || "[]"
    );

    // Dibujar los días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
        const span = document.createElement("span");

        span.textContent = day;

        const fechaDia = createDateString(
            year,
            month,
            day
        );

        // Marcar el día de hoy
        if (
            fechaDia === formatDate(today)
        ) {
            span.classList.add("selected");
        }

        // Revisar si hay tareas para este día
        const hayTareas = tareasGuardadas.some(tarea => {
            let fechaTarea = (tarea.fecha || "").trim();

            // Convertir DD-MM-AAAA o DD/MM/AAAA
            const partes = fechaTarea.match(
                /^(\d{2})[-/](\d{2})[-/](\d{4})$/
            );

            if (partes) {
                fechaTarea =
                    `${partes[3]}-${partes[2]}-${partes[1]}`;
            }

            return fechaTarea === fechaDia;
        });

        // Marcar los días que tienen tareas
        if (hayTareas) {
            span.classList.add("dia-con-tarea");
            span.title = "Tienes tareas para este día";
        }

        miniCalendarGrid.appendChild(span);
    }

    // Completar los espacios finales
    const totalDias = miniCalendarGrid.children.length;
    const restantes = (7 - (totalDias % 7)) % 7;

    for (let day = 1; day <= restantes; day++) {
        const span = document.createElement("span");

        span.classList.add("other");
        span.textContent = day;

        miniCalendarGrid.appendChild(span);
    }
}


function obtenerProximosItems() {
    const tareas = JSON.parse(
        localStorage.getItem("tareas") || "[]"
    );

    const ahora = new Date();
    const elementos = [];

    // Agregar tareas pendientes
    tareas.forEach(tarea => {
        if (
            tarea.completada ||
            tarea.estado === "completado"
        ) {
            return;
        }

        let fecha = (tarea.fecha || "").trim();

        // Convertir DD-MM-AAAA o DD/MM/AAAA
        const partes = fecha.match(
            /^(\d{2})[-/](\d{2})[-/](\d{4})$/
        );

        if (partes) {
            fecha = `${partes[3]}-${partes[2]}-${partes[1]}`;
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return;
        }

        // Las tareas sin hora vencen al final del día
        const fechaHora = new Date(`${fecha}T23:59:59`);

        if (Number.isNaN(fechaHora.getTime()) || fechaHora < ahora) {
            return;
        }

        elementos.push({
            titulo: tarea.descripcion || tarea.titulo || tarea.materia || "Tarea",
            fecha: fecha,
            hora: "",
            tipo: "tarea",
            fechaHora: fechaHora
        });
    });

    // Agregar recordatorios del calendario
    events.forEach(evento => {
        if (!evento.date || !evento.time) {
            return;
        }

        const fechaHora = new Date(
            `${evento.date}T${evento.time}`
        );

        if (
            Number.isNaN(fechaHora.getTime()) ||
            fechaHora < ahora
        ) {
            return;
        }

        elementos.push({
            titulo: evento.title,
            fecha: evento.date,
            hora: evento.time,
            tipo: evento.type || "tarea",
            fechaHora: fechaHora
        });
    });

    // Ordenar desde el elemento más próximo
    return elementos.sort(
        (a, b) => a.fechaHora - b.fechaHora
    );
}



function renderUpcoming() {
    upcomingList.innerHTML = "";

    const elementos = obtenerProximosItems().slice(0, 6);

    if (elementos.length === 0) {
        upcomingList.innerHTML = `
            <p class="empty-message">
                No tienes tareas ni recordatorios próximos.
            </p>
        `;
        return;
    }

    elementos.forEach(item => {
        const elemento = document.createElement("div");
        elemento.classList.add("upcoming-item");

        elemento.innerHTML = `
            <div class="event-icon">
                ${getIcon(item.tipo)}
            </div>

            <div class="event-info">
                <h3>${escapeHTML(item.titulo)}</h3>
                <p>${item.tipo === "tarea" ? "Tarea" : getType(item.tipo)}</p>
            </div>

            <div class="event-date">
                ${formatDisplayDate(item.fecha)}
            </div>

            <div class="event-time">
                ${item.hora || "Por entregar"}
            </div>
        `;

        upcomingList.appendChild(elemento);
    });
}




function renderRightEvents() {
    rightEvents.innerHTML = "";

    // Obtener las tareas guardadas.
    let tareas = [];

    try {
        tareas = JSON.parse(
            localStorage.getItem("tareas") || "[]"
        );
    } catch (error) {
        tareas = [];
    }

    // Obtener la fecha actual sin la hora.
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Límite: hoy y los próximos 3 días.
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 4);

    // Filtrar las tareas que deben aparecer.
    const elementos = tareas
        .filter(tarea => {
            const estado = tarea.estado || (
                tarea.completada
                    ? "completado"
                    : "por-hacer"
            );

            // Excluir las tareas completadas.
            if (
                estado !== "por-hacer" &&
                estado !== "en-progreso"
            ) {
                return false;
            }

            if (!tarea.fecha) return false;

            // Convertir la fecha de la tarea.
            let fechaTexto = tarea.fecha.trim();

            // Aceptar fechas DD-MM-AAAA o DD/MM/AAAA.
            const partes = fechaTexto.match(
                /^(\d{2})[-/](\d{2})[-/](\d{4})$/
            );

            if (partes) {
                fechaTexto =
                    `${partes[3]}-${partes[2]}-${partes[1]}`;
            }

            // Comprobar que la fecha sea válida.
            if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)) {
                return false;
            }

            const fecha = new Date(
                fechaTexto + "T00:00:00"
            );

            if (isNaN(fecha.getTime())) {
                return false;
            }

            // Incluir hoy y los próximos 3 días.
            return fecha >= hoy && fecha < limite;
        })
        .sort((a, b) => {
            return a.fecha.localeCompare(b.fecha);
        })
        .slice(0, 4);

    // Mostrar mensaje si no hay tareas próximas.
    if (elementos.length === 0) {
        rightEvents.innerHTML = `
            <p class="empty-right">
                No hay tareas próximas.
            </p>
        `;
        return;
    }

    // Mostrar las tareas encontradas.
    elementos.forEach(tarea => {
        const elemento = document.createElement("div");
        elemento.classList.add("right-event");

        const titulo =
            tarea.descripcion ||
            tarea.titulo ||
            tarea.materia ||
            "Tarea sin título";

        const estado = tarea.estado || (
            tarea.completada
                ? "completado"
                : "por-hacer"
        );

        elemento.innerHTML = `
            <div class="right-event-icon">
                ${getIcon("tarea")}
            </div>

            <div class="right-event-info">
                <h3>${escapeHTML(titulo)}</h3>
                <p>
                    Tarea · ${formatDisplayDate(
                        tarea.fecha.match(/^\d{4}-\d{2}-\d{2}$/)
                            ? tarea.fecha
                            : (() => {
                                const p = tarea.fecha.match(
                                    /^(\d{2})[-/](\d{2})[-/](\d{4})$/
                                );
                                return p
                                    ? `${p[3]}-${p[2]}-${p[1]}`
                                    : tarea.fecha;
                            })()
                    )}
                    · ${estado === "en-progreso"
                        ? "En proceso"
                        : "Por hacer"}
                </p>
            </div>
        `;

        rightEvents.appendChild(elemento);
    });
}




function getIcon(type) {
    const icons = {
        tarea: "✓",
        examen: "!",
        proyecto: "▣",
        estudio: "◷"

    };


    return icons[type] || "•";
}

function getType(type) {
    const types = {
        tarea: "Tarea",
        examen: "Examen",
        proyecto: "Proyecto",
        estudio: "Estudio"

    };


    return types[type] || "Actividad";
}

function formatDisplayDate(dateString) {
    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    return date.toLocaleDateString(
        "es-ES",
        {
            day: "numeric",
            month: "short"
        }
    );
}


function openModal(date = "") {

    reminderModal.classList.remove(
        "hidden"
    );

    if (date) {

        document.getElementById(
            "date"
        ).value = date;

    }
}
function closeReminderModal() {

    reminderModal.classList.add(
        "hidden"
    );


    reminderForm.reset();
}
newReminderButton.addEventListener(
    "click",
    function() {
        openModal();

    }
);

closeModal.addEventListener(
    "click",
    closeReminderModal
);


cancelButton.addEventListener(
    "click",
    closeReminderModal
);

reminderForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const title =
            document.getElementById(
                "title"
            ).value.trim();


        const date =
            document.getElementById(
                "date"
            ).value;


        const time =
            document.getElementById(
                "time"
            ).value;


        const type =
            document.getElementById(
                "type"
            ).value;


        if (
            !title ||
            !date ||
            !time
        ) {

            return;

        }


        const newEvent = {
            id: Date.now(),
            title: title,
            date: date,
            time: time,
            type: type

        };
        events.push(newEvent);
        saveEvents();
        closeReminderModal();
        renderCalendar();

    }
);

function deleteEvent(id) {

    const event =
        events.find(
            item =>
                item.id === id
        );
    if (!event) {
        return;
    }
    const confirmation =
        confirm(
            `¿Quieres eliminar "${event.title}"?`
        );
    if (!confirmation) {
        return;
    }
    events =
        events.filter(
            item =>
                item.id !== id
        );
    saveEvents();
    renderCalendar();
}

function escapeHTML(text) {

    const element =
        document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}

renderCalendar();
