(() => {
    'use strict';

    const STORAGE_KEY = 'takschool_avatar_v1';
    const ANIMAL_KEY = 'takschool_avatar_animal_v1';

    // Crear la imagen del animalito
    function animalImage(animal) {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="200" height="200" viewBox="0 0 200 200">
                <rect width="200" height="200" rx="100" fill="#f1efff"/>
                <circle cx="100" cy="100" r="85" fill="#ffffff"/>
                <text x="100" y="122"
                      text-anchor="middle"
                      font-size="88">${animal}</text>
            </svg>
        `;

        return 'data:image/svg+xml;charset=UTF-8,' +
               encodeURIComponent(svg);
    }

    // Guardar información en el navegador
    function guardarDato(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
        } catch (error) {
            console.warn('No se pudo guardar el avatar.', error);
        }
    }

    // Seleccionar un animalito
    function seleccionarAnimal(animal, preview, opciones) {
        preview.src = animalImage(animal);
        preview.alt = 'Avatar del estudiante';

        opciones.forEach(boton => {
            const seleccionado = boton.dataset.animal === animal;

            boton.classList.toggle('selected', seleccionado);
            boton.setAttribute(
                'aria-pressed',
                String(seleccionado)
            );
        });

        guardarDato(STORAGE_KEY, preview.src);
        guardarDato(ANIMAL_KEY, animal);
    }

    // Reducir el tamaño de la foto para guardarla
    function comprimirImagen(archivo, callback) {
        const lector = new FileReader();

        lector.onerror = () => {
            callback(new Error('No se pudo leer la imagen.'));
        };

        lector.onload = () => {
            const imagen = new Image();

            imagen.onerror = () => {
                callback(new Error('La imagen no es válida.'));
            };

            imagen.onload = () => {
                const tamañoMaximo = 512;
                const escala = Math.min(
                    1,
                    tamañoMaximo /
                    Math.max(imagen.naturalWidth, imagen.naturalHeight)
                );

                const canvas = document.createElement('canvas');

                canvas.width = Math.max(
                    1,
                    Math.round(imagen.naturalWidth * escala)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(imagen.naturalHeight * escala)
                );

                const contexto = canvas.getContext('2d');

                if (!contexto) {
                    callback(new Error('No se pudo procesar la foto.'));
                    return;
                }

                contexto.drawImage(
                    imagen,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                callback(
                    null,
                    canvas.toDataURL('image/jpeg', 0.82)
                );
            };

            imagen.src = lector.result;
        };

        lector.readAsDataURL(archivo);
    }

    // Activar todas las funciones del avatar
    function iniciarAvatar() {
        const preview = document.getElementById('avatarPreview');
        const input = document.getElementById('avatarInput');
        const botonElegir = document.getElementById('btnElegirAnimal');
        const selector = document.getElementById('selectorAnimales');

        const opciones = Array.from(
            document.querySelectorAll('.animal-option')
        );

        if (!preview || !input || !botonElegir ||
            !selector || opciones.length === 0) {
            console.error('No se encontraron los elementos del avatar.');
            return;
        }

        // Recuperar el avatar guardado
        try {
            const avatarGuardado = localStorage.getItem(STORAGE_KEY);
            const animalGuardado = localStorage.getItem(ANIMAL_KEY);

            if (avatarGuardado) {
                preview.src = avatarGuardado;
            } else {
                preview.src = animalImage('🐰');
            }

            opciones.forEach(boton => {
                const seleccionado =
                    boton.dataset.animal === animalGuardado;

                boton.classList.toggle('selected', seleccionado);
                boton.setAttribute(
                    'aria-pressed',
                    String(seleccionado)
                );
            });
        } catch (error) {
            preview.src = animalImage('🐰');
        }

        // Mostrar u ocultar los animalitos
        botonElegir.addEventListener('click', () => {
            selector.hidden = !selector.hidden;

            botonElegir.setAttribute(
                'aria-expanded',
                String(!selector.hidden)
            );
        });

        // Cambiar el avatar al pulsar un animalito
        opciones.forEach(boton => {
            boton.addEventListener('click', () => {
                seleccionarAnimal(
                    boton.dataset.animal,
                    preview,
                    opciones
                );

                selector.hidden = true;
                botonElegir.setAttribute('aria-expanded', 'false');
            });
        });

        // Abrir el selector de archivos al pulsar el lápiz
        input.addEventListener('change', () => {
            const archivo = input.files[0];

            if (!archivo) return;

            if (!archivo.type.startsWith('image/')) {
                alert('Selecciona un archivo de imagen.');
                input.value = '';
                return;
            }

            comprimirImagen(archivo, (error, imagenGuardada) => {
                if (error) {
                    alert(error.message);
                    input.value = '';
                    return;
                }

                preview.src = imagenGuardada;
                preview.alt = 'Foto de perfil del estudiante';

                guardarDato(STORAGE_KEY, imagenGuardada);

                try {
                    localStorage.removeItem(ANIMAL_KEY);
                } catch (error) {
                    console.warn('No se pudo actualizar el avatar.');
                }

                opciones.forEach(boton => {
                    boton.classList.remove('selected');
                    boton.setAttribute('aria-pressed', 'false');
                });

                selector.hidden = true;
                botonElegir.setAttribute('aria-expanded', 'false');
                input.value = '';
            });
        });

        // Cerrar el selector al pulsar fuera de él
        document.addEventListener('click', evento => {
            if (
                !selector.hidden &&
                !selector.contains(evento.target) &&
                !botonElegir.contains(evento.target)
            ) {
                selector.hidden = true;
                botonElegir.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Esperar a que cargue el HTML
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', iniciarAvatar);
    } else {
        iniciarAvatar();
    }
})();