document.addEventListener('DOMContentLoaded', () => {
    
    let originalValues = {};

    // 1. CARGAR DATOS AL ENTRAR
    function loadSavedData() {
        const fields = document.querySelectorAll('input[type="text"]:not(#tagInput), input[type="password"], select, textarea');
        fields.forEach((field, index) => {
            const savedValue = localStorage.getItem(`profile_field_${index}`);
            if (savedValue !== null) {
                field.value = savedValue;
            }
        });

        // Recuperar habilidades guardadas
        const savedTagsHTML = localStorage.getItem('profile_tags_html');
        if (savedTagsHTML !== null) {
            const tagsWrapper = document.querySelector('.tags-wrapper');
            if (tagsWrapper) {
                tagsWrapper.innerHTML = savedTagsHTML;
                // Nos aseguramos de mantener el input al final
                if (!document.getElementById('tagInput')) {
                    tagsWrapper.insertAdjacentHTML('beforeend', '<input type="text" id="tagInput" placeholder="Añadir..." disabled>');
                }
            }
        }

        // Cargar foto de perfil
        const savedAvatar = localStorage.getItem('profile_avatar_base64');
        const avatarPreview = document.getElementById('avatarPreview');
        if (savedAvatar && avatarPreview) {
            avatarPreview.src = savedAvatar;
        }
    }

    loadSavedData();

    // 2. LOGICA DE EDICIÓN Y BLOQUEO POR SECCIÓN
    function toggleCardEditing(card, enable, isSaving = false, isCanceling = false) {
        const fields = card.querySelectorAll('input[type="text"], input[type="password"], select, textarea');
        const actionButtons = card.querySelectorAll('.button-row button, .btn-save, .btn-action-cancel');
        const tagsContainer = card.querySelector('.tags-container');
        const editBtn = card.querySelector('.btn-edit');
        const tagInput = card.querySelector('#tagInput');
        
        const allFields = Array.from(document.querySelectorAll('input[type="text"]:not(#tagInput), input[type="password"], select, textarea'));

        if (enable) {
            fields.forEach((field) => {
                if(field.id !== 'tagInput') {
                    const globalIndex = allFields.indexOf(field);
                    originalValues[globalIndex] = field.value;
                }
            });
            const tagsWrapper = card.querySelector('.tags-wrapper');
            if (tagsWrapper) {
                const tempWrapper = tagsWrapper.cloneNode(true);
                const inputInClone = tempWrapper.querySelector('#tagInput');
                if (inputInClone) inputInClone.remove();
                originalValues['tags_html'] = tempWrapper.innerHTML;
            }
        }

        if (isSaving) {
            fields.forEach((field) => {
                if(field.id !== 'tagInput') {
                    const globalIndex = allFields.indexOf(field);
                    localStorage.setItem(`profile_field_${globalIndex}`, field.value);
                }
            });
            const tagsWrapper = card.querySelector('.tags-wrapper');
            if (tagsWrapper) {
                const tempWrapper = tagsWrapper.cloneNode(true);
                const inputInClone = tempWrapper.querySelector('#tagInput');
                if (inputInClone) inputInClone.remove();
                localStorage.setItem('profile_tags_html', tempWrapper.innerHTML);
            }
        }

        if (isCanceling) {
            fields.forEach((field) => {
                if(field.id !== 'tagInput') {
                    const globalIndex = allFields.indexOf(field);
                    if (originalValues[globalIndex] !== undefined) {
                        field.value = originalValues[globalIndex];
                    }
                }
            });
            const tagsWrapper = card.querySelector('.tags-wrapper');
            if (tagsWrapper && originalValues['tags_html'] !== undefined) {
                tagsWrapper.innerHTML = originalValues['tags_html'];
                tagsWrapper.insertAdjacentHTML('beforeend', '<input type="text" id="tagInput" placeholder="Añadir..." disabled>');
            }
        }

        // Habilitar controles
        fields.forEach(field => field.disabled = !enable);
        actionButtons.forEach(btn => btn.disabled = !enable);

        if (tagsContainer) {
            if (enable) {
                tagsContainer.classList.add('editable-tags');
                if(tagInput) {
                    tagInput.disabled = false;
                    tagInput.value = "";
                }
            } else {
                tagsContainer.classList.remove('editable-tags');
                if(tagInput) {
                    tagInput.disabled = true;
                    tagInput.value = "";
                }
            }
        }

        if (editBtn) {
            editBtn.textContent = enable ? "Cerrar" : (card.classList.contains('profile-sidebar') ? "Editar Perfil" : "Editar");
        }
    }

    // Eventos Click para los botones principales
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const firstField = card.querySelector('input[type="text"], input[type="password"], select, textarea');
            const isOpening = firstField ? firstField.disabled : (card.querySelector('.tags-container') && !card.querySelector('.tags-container').classList.contains('editable-tags'));
            
            toggleCardEditing(card, isOpening);
        });
    });

    document.querySelectorAll('.btn-save').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            toggleCardEditing(card, false, true, false);
        });
    });

    document.querySelectorAll('.btn-cancel, .btn-action-cancel').forEach(button => {
        button.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            toggleCardEditing(card, false, false, true);
        });
    });

    // 3. CAPTURA DE NUEVAS HABILIDADES (ENTER)
    document.body.addEventListener('keydown', (e) => {
        if (e.target.id === 'tagInput' && e.key === 'Enter') {
            e.preventDefault();
            const text = e.target.value.trim();
            
            if (text !== "") {
                // He reemplazado la etiqueta 'i' por un elemento plano 'span' de eliminar (Evita problemas si falla FontAwesome)
                const newTagHTML = `<span class="tag">${text}<span class="remove-tag">&times;</span></span>`;
                e.target.insertAdjacentHTML('beforebegin', newTagHTML);
                e.target.value = "";
            }
        }
    });

    // 4. ACCIÓN DE ELIMINAR ETIQUETAS (AL HACER CLICK EN LA ×)
    // Se procesa de manera global para que funcione con etiquetas viejas y recién creadas
    document.body.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-tag')) {
            const container = e.target.closest('.tags-container');
            // Únicamente permite borrar si el contenedor está en modo 'editable-tags' (Activo)
            if (container && container.classList.contains('editable-tags')) {
                const tagElement = e.target.closest('.tag');
                if (tagElement) {
                    tagElement.remove();
                }
            }
        }
    });

    // Subida de imagen
    const avatarInput = document.getElementById('avatarInput');
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarInput && avatarPreview) {
        avatarInput.addEventListener('change', (e) => {
            const file = e.target.files;
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const base64Data = event.target.result;
                    avatarPreview.src = base64Data;
                    localStorage.setItem('profile_avatar_base64', base64Data);
                };
                reader.readAsDataURL(file);
            }
        });
    }
});


    document.getElementById('logoutBtn').addEventListener('click', function() {
        // 1. Borra los datos guardados del usuario en el navegador
        localStorage.clear(); 
        sessionStorage.clear();

        // 2. Redirige al usuario a la página de inicio (Login)
        // REEMPLAZA 'login.html' por el nombre de tu archivo de inicio de sesión
        window.location.href = "index.html";

    });

