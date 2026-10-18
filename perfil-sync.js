(() => {
    'use strict';

    const AVATAR_KEY = 'takschool_avatar_v1';
    const NAME_KEY = 'takschool_nombre_usuario_v1';

    // Leer datos guardados
    function leer(clave) {
        try {
            return localStorage.getItem(clave);
        } catch (error) {
            return null;
        }
    }

    // Guardar datos
    function guardar(clave, valor) {
        try {
            localStorage.setItem(clave, valor);
            return true;
        } catch (error) {
            console.warn('No se pudieron guardar los datos.', error);
            return false;
        }
    }

    // Limpiar el nombre
    function limpiarNombre(texto) {
        return String(texto || '')
            .replace(/👋/gu, '')
            .replace(/[!！]+/gu, '')
            .trim();
    }

    // Actualizar el nombre en el dashboard y el perfil
    function aplicarNombre(nombre) {
        const limpio = limpiarNombre(nombre);

        if (!limpio) return;

        const elementoDashboard =
            document.getElementById('nombreUsuario');

        const campoPerfil =
            document.getElementById('nombrePerfil');

        if (elementoDashboard) {
            elementoDashboard.textContent = `${limpio}! 👋`;
        }

        if (campoPerfil) {
            campoPerfil.value = limpio;
        }
    }
      function aplicarAvatar(avatar) {
    if (!avatar) return;

    // Cambiar solamente el avatar del encabezado
    const avatarCabecera = document.getElementById('avatarHeader');

    if (avatarCabecera) {
        avatarCabecera.style.backgroundImage = `url("${avatar}")`;
        avatarCabecera.style.backgroundSize = 'cover';
        avatarCabecera.style.backgroundPosition = 'center';
        avatarCabecera.style.backgroundRepeat = 'no-repeat';
        avatarCabecera.textContent = '';

        avatarCabecera.setAttribute(
            'aria-label',
            'Avatar de perfil'
        );
    }
}

    // Iniciar sincronización
    function iniciarSincronizacion() {
        const nombreGuardado = leer(NAME_KEY);
        const avatarGuardado = leer(AVATAR_KEY);

        if (nombreGuardado) {
            aplicarNombre(nombreGuardado);
        }

        if (avatarGuardado) {
            aplicarAvatar(avatarGuardado);
        }

        // Detectar cambios de nombre en el dashboard
        const elementoDashboard =
            document.getElementById('nombreUsuario');

        if (elementoDashboard) {
            const observador = new MutationObserver(() => {
                const nombre = limpiarNombre(
                    elementoDashboard.textContent
                );

                if (
                    nombre &&
                    nombre.toLowerCase() !== 'usuario'
                ) {
                    guardar(NAME_KEY, nombre);

                    const campoPerfil =
                        document.getElementById('nombrePerfil');

                    if (campoPerfil) {
                        campoPerfil.value = nombre;
                    }
                }
            });

            observador.observe(elementoDashboard, {
                childList: true,
                characterData: true,
                subtree: true
            });
        }

        // Guardar los cambios realizados en el perfil
        const campoPerfil =
            document.getElementById('nombrePerfil');

        if (campoPerfil) {
            const guardarNombrePerfil = () => {
                const nombre = limpiarNombre(campoPerfil.value);

                if (!nombre) return;

                guardar(NAME_KEY, nombre);

                const elemento =
                    document.getElementById('nombreUsuario');

                if (elemento) {
                    elemento.textContent = `${nombre}! 👋`;
                }
            };

            campoPerfil.addEventListener(
                'input',
                guardarNombrePerfil
            );

            campoPerfil.addEventListener(
                'change',
                guardarNombrePerfil
            );
        }

        // Detectar cambios realizados en otra pestaña
        window.addEventListener('storage', (evento) => {
            if (evento.key === AVATAR_KEY) {
                aplicarAvatar(evento.newValue);
            }

            if (evento.key === NAME_KEY && evento.newValue) {
                aplicarNombre(evento.newValue);
            }
        });
    }

    // Esperar a que cargue el HTML
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            iniciarSincronizacion
        );
    } else {
        iniciarSincronizacion();
    }
})();