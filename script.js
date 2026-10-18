document.addEventListener("DOMContentLoaded", () => {
  
  /* ==========================================================================
     1. EFECTO DE TARJETAS 3D INTERACTIVAS (TILT EFFECT)
     Aplica un giro tridimensional a las tarjetas de beneficios al mover el mouse.
     ========================================================================== */
  const tarjetas = document.querySelectorAll(".tarjeta-beneficio");

  tarjetas.forEach((tarjeta) => {
    // Configurar perspectiva en el contenedor padre de la tarjeta
    tarjeta.parentElement.style.perspective = "1000px";

    tarjeta.addEventListener("mousemove", (e) => {
      const rect = tarjeta.getBoundingClientRect();
      const x = e.clientX - rect.left; // Posición X del mouse dentro de la tarjeta
      const y = e.clientY - rect.top;  // Posición Y del mouse dentro de la tarjeta

      // Calcular el giro basado en el centro de la tarjeta
      const rotacionX = ((rect.height / 2 - y) / (rect.height / 2)) * 15; // Máximo 15 grados
      const rotacionY = ((x - rect.width / 2) / (rect.width / 2)) * 15;

      tarjeta.style.transform = `rotateX(${rotacionX}deg) rotateY(${rotacionY}deg) scale(1.03)`;
    });

    // Restablecer la posición original cuando el mouse sale de la tarjeta
    tarjeta.addEventListener("mouseleave", () => {
      tarjeta.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
    });
  });


  /* ==========================================================================
     2. REVELACIÓN AL HACER SCROLL (SCROLL REVEAL EFFECT)
     Hace que las secciones aparezcan suavemente con un leve desplazamiento al bajar.
     ========================================================================== */
  const elementosAparecer = document.querySelectorAll(
    ".tarjeta-paso, .tarjeta-beneficio, .funcionamiento-encabezado, .beneficio-encabezado"
  );

  // Estilos iniciales para la animación mediante JS (manteniendo limpio tu CSS original)
  elementosAparecer.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(40px)";
    el.style.transition = "opacity 0.8s cubic-bezier(0.25, 1, 0.5, 1), transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
  });

  const observadorScroll = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          // Preservar la transformación base si el elemento tiene interacciones previas (como las tarjetas 3D)
          if (entry.target.classList.contains("tarjeta-beneficio")) {
            entry.target.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
          } else {
            entry.target.style.transform = "translateY(0)";
          }
          observer.unobserve(entry.target); // Detener observación una vez animado
        }
      });
    },
    {
      threshold: 0.15, // Se activa cuando el 15% del elemento es visible
    }
  );

  elementosAparecer.forEach((el) => observadorScroll.observe(el));


  /* ==========================================================================
     3. PARTICULAS FLOTANTES DE FONDO (BACKGROUND PARTICLES)
     Crea pequeños puntos mágicos que flotan detrás de la sección de la ilustración.
     ========================================================================== */
  const contenedorHero = document.querySelector(".columna-izquierda");
  
  if (contenedorHero) {
    // Asegurar que el contenedor tenga posición relativa para que las partículas no se salgan
    contenedorHero.style.position = "relative";
    contenedorHero.style.overflow = "hidden";

    // Crear 15 partículas mágicas flotantes
    for (let i = 0; i < 15; i++) {
      const particula = document.createElement("span");
      
      // Estilos CSS dinámicos aplicados por JS para no tocar tu archivo físico de estilos
      particula.style.position = "absolute";
      particula.style.width = `${Math.random() * 6 + 4}px`; // Tamaños aleatorios entre 4px y 10px
      particula.style.height = particula.style.width;
      particula.style.backgroundColor = "rgba(79, 70, 229, 0.15)"; // Color morado traslúcido a juego
      particula.style.borderRadius = "50%";
      particula.style.left = `${Math.random() * 100}%`;
      particula.style.top = `${Math.random() * 100}%`;
      particula.style.pointerEvents = "none"; // Evita que interfiera con clicks
      
      contenedorHero.appendChild(particula);

      // Animación matemática de flotación personalizada por partícula
      let posicionY = parseFloat(particula.style.top);
      let velocidad = Math.random() * 0.2 + 0.1;

      function animarParticula() {
        posicionY -= velocidad;
        // Si la partícula se sale por arriba de la sección, vuelve a aparecer abajo
        if (posicionY < -5) {
          posicionY = 105;
          particula.style.left = `${Math.random() * 100}%`;
        }
        particula.style.top = `${posicionY}%`;
        requestAnimationFrame(animarParticula);
      }
      
      animarParticula();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.querySelector(".menu-central");
  const links = document.querySelectorAll(".menu-central li a");
  const sections = document.querySelectorAll(".columna-izquierda, .funcionamiento-seccion, .beneficios-seccion, .nosotros-seccion");

  let indicator = document.querySelector(".linea-indicadora");
  if (!indicator) {
    indicator = document.createElement("div");
    indicator.className = "linea-indicadora";
    menu.appendChild(indicator);
  }

  function moverBarra(enlace) {
    if (!enlace) return;
    const enlaceLeft = enlace.offsetLeft;
    const enlaceWidth = enlace.offsetWidth;
    const paddingLateral = 15; 

    indicator.style.left = `${enlaceLeft + paddingLateral}px`;
    indicator.style.width = `${enlaceWidth - (paddingLateral * 2)}px`;
  }

  // Clic manual en el menú
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.parentElement.classList.remove("activo"));
      link.parentElement.classList.add("activo");
      moverBarra(link);
    });
  });

  // Detector inteligente de secciones centrales
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idSeccion = entry.target.getAttribute("id");
        const linkActivo = document.querySelector(`.menu-central a[href="#${idSeccion}"]`);
        
        if (linkActivo) {
          links.forEach(l => l.parentElement.classList.remove("activo"));
          linkActivo.parentElement.classList.add("activo");
          moverBarra(linkActivo);
        }
      }
    });
  }, { rootMargin: "-40% 0px -40% 0px", threshold: 0 });

  sections.forEach(section => observer.observe(section));

  // --- ¡ESTA ES LA CORRECCIÓN CLAVE PARA EL INICIO! ---
  window.addEventListener("scroll", () => {
    // Si el scroll llega arriba del todo (cerca del inicio)
    if (window.scrollY < 80) {
      const inicioLink = document.querySelector('.menu-central a[href="#inicio"]');
      if (inicioLink) {
        links.forEach(l => l.parentElement.classList.remove("activo"));
        inicioLink.parentElement.classList.add("activo");
        moverBarra(inicioLink);
      }
    }
  });

  window.addEventListener("resize", () => {
    const activeLink = document.querySelector(".menu-central li.activo a");
    if (activeLink) moverBarra(activeLink);
  });

  setTimeout(() => {
    const activeLink = document.querySelector(".menu-central li.activo a") || links[0];
    if (activeLink) moverBarra(activeLink);
  }, 200);
});

