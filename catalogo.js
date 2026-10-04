(() => {
  const categoryProducts = {
    futbol: [
      ["Espinilleras Shield", "Protección ligera para entrenamientos y partidos.", "Fútbol · Protección", "$18,50"],
      ["Botines Striker", "Suela con tacos para mejorar el agarre en cancha.", "Fútbol · Calzado", "$59,90"],
      ["Medias Match", "Tejido elástico y ajuste cómodo para jugar.", "Fútbol · Ropa", "$9,75"],
      ["Bomba de aire Compact", "Incluye aguja para inflar balones deportivos.", "Fútbol · Accesorios", "$8,90"],
      ["Guantes de arquero Grip", "Palma adherente y ajuste seguro en la muñeca.", "Fútbol · Arquero", "$32,00"],
      ["Camiseta de entrenamiento", "Tela liviana para practicar con comodidad.", "Fútbol · Ropa", "$27,50"],
      ["Balón Training", "Balón resistente para prácticas frecuentes.", "Fútbol · Balones", "$22,90"]
    ],
    basketball: [
      ["Zapatillas Court Jump", "Suela con tracción para movimientos rápidos.", "Basketball · Calzado", "$72,00"],
      ["Balón Indoor Pro", "Superficie de agarre para juego en interiores.", "Basketball · Balones", "$34,50"],
      ["Camiseta Basket Team", "Prenda ligera de corte deportivo.", "Basketball · Ropa", "$29,90"],
      ["Manga de compresión", "Ajuste elástico para entrenar con comodidad.", "Basketball · Protección", "$15,00"],
      ["Banda para la cabeza", "Tejido suave para mantener el ajuste durante el juego.", "Basketball · Accesorios", "$8,50"],
      ["Bomba para balón", "Formato compacto para llevar a la cancha.", "Basketball · Accesorios", "$9,25"],
      ["Balón Outdoor", "Cubierta resistente para jugar al aire libre.", "Basketball · Balones", "$27,90"]
    ],
    tennis: [
      ["Raqueta Control 98", "Marco liviano para golpes con buen control.", "Tennis · Raquetas", "$79,00"],
      ["Bolso para raquetas", "Compartimentos para transportar equipo de juego.", "Tennis · Bolsos", "$44,90"],
      ["Grip antideslizante", "Cinta de recambio para mejorar el agarre.", "Tennis · Accesorios", "$7,50"],
      ["Muñequera absorbente", "Tejido suave para acompañar el entrenamiento.", "Tennis · Accesorios", "$8,00"],
      ["Visera Court", "Visera ajustable para jugar al aire libre.", "Tennis · Ropa", "$16,90"],
      ["Pelotas Match (3)", "Pelotas para práctica y partidos recreativos.", "Tennis · Pelotas", "$14,50"],
      ["Antivibrador para raqueta", "Accesorio pequeño para el encordado.", "Tennis · Accesorios", "$5,90"]
    ],
    mma: [
      ["Guantes MMA Sparring", "Acolchado para entrenamiento controlado.", "Artes marciales · Guantes", "$48,00"],
      ["Vendas elásticas", "Soporte ajustable para sesiones de práctica.", "Artes marciales · Protección", "$12,50"],
      ["Short de combate", "Corte flexible para entrenamientos de contacto.", "Artes marciales · Ropa", "$34,90"],
      ["Espinilleras MMA", "Protección acolchada para entrenamiento.", "Artes marciales · Protección", "$39,00"],
      ["Cuerda de saltar Pro", "Mangos cómodos para calentamiento y cardio.", "Artes marciales · Entrenamiento", "$15,90"],
      ["Saco de golpeo", "Equipo de práctica para entrenar combinaciones.", "Artes marciales · Entrenamiento", "$89,00"],
      ["Coquilla deportiva", "Protección con ajuste elástico.", "Artes marciales · Protección", "$18,00"]
    ],
    volleyball: [
      ["Balón Indoor Match", "Balón suave al contacto para juego en cancha.", "Volleyball · Balones", "$32,00"],
      ["Red portátil", "Red ajustable para prácticas recreativas.", "Volleyball · Redes", "$54,90"],
      ["Short de volleyball", "Prenda ligera con libertad de movimiento.", "Volleyball · Ropa", "$22,50"],
      ["Manguitos deportivos", "Mangas elásticas para entrenar y jugar.", "Volleyball · Protección", "$16,00"],
      ["Balón Beach", "Balón para jugar en arena y exteriores.", "Volleyball · Balones", "$29,90"],
      ["Cinta para dedos", "Soporte adhesivo para entrenamientos.", "Volleyball · Protección", "$6,50"],
      ["Bolso deportivo Team", "Espacio para guardar ropa y accesorios.", "Volleyball · Bolsos", "$35,00"]
    ],
    ropa: [
      ["Leggings Active", "Tejido elástico para entrenar con comodidad.", "Ropa deportiva · Leggings", "$34,90"],
      ["Short deportivo Move", "Corte cómodo para correr o entrenar.", "Ropa deportiva · Shorts", "$22,00"],
      ["Top deportivo Support", "Ajuste cómodo para actividades de impacto moderado.", "Ropa deportiva · Tops", "$28,50"],
      ["Chaqueta ligera Wind", "Capa liviana para actividades al aire libre.", "Ropa deportiva · Chaquetas", "$46,00"],
      ["Polo Dry Fit", "Tela ligera para sesiones de entrenamiento.", "Ropa deportiva · Camisetas", "$25,90"],
      ["Medias deportivas (3)", "Paquete de medias con ajuste elástico.", "Ropa deportiva · Medias", "$12,00"],
      ["Gorra deportiva", "Visera curva y ajuste posterior.", "Ropa deportiva · Accesorios", "$17,50"]
    ],
    running: [
      ["Zapatillas Road Pace", "Amortiguación ligera para recorridos diarios.", "Running · Calzado", "$82,00"],
      ["Reloj deportivo básico", "Cronómetro y registro de tiempo para entrenar.", "Running · Accesorios", "$38,00"],
      ["Medias Run (2 pares)", "Ajuste cómodo para recorridos de entrenamiento.", "Running · Ropa", "$13,90"],
      ["Gorra Run Mesh", "Paneles ligeros para actividades al aire libre.", "Running · Accesorios", "$18,00"],
      ["Luz para corredor", "Luz compacta para mejorar la visibilidad.", "Running · Seguridad", "$14,50"],
      ["Camiseta técnica Run", "Tejido ligero para correr.", "Running · Ropa", "$26,00"],
      ["Banda reflectiva", "Accesorio ajustable para recorridos nocturnos.", "Running · Seguridad", "$9,50"]
    ],
    ciclismo: [
      ["Guantes Road Grip", "Palma acolchada para sujetar el manubrio.", "Ciclismo · Guantes", "$21,00"],
      ["Botella para bicicleta", "Botella deportiva compatible con portabotella.", "Ciclismo · Hidratación", "$11,50"],
      ["Bomba portátil Mini", "Bomba compacta para llevar en la bicicleta.", "Ciclismo · Herramientas", "$19,00"],
      ["Kit de reparación", "Accesorios básicos para reparaciones de emergencia.", "Ciclismo · Herramientas", "$13,50"],
      ["Lentes Road", "Lentes deportivos para salidas en bicicleta.", "Ciclismo · Protección", "$28,00"],
      ["Camiseta Cycling", "Prenda ligera para recorridos en bicicleta.", "Ciclismo · Ropa", "$42,00"],
      ["Candado para bicicleta", "Candado compacto para asegurar la bicicleta.", "Ciclismo · Seguridad", "$24,90"]
    ],
    fitness: [
      ["Kettlebell 6 kg", "Peso compacto para rutinas de fuerza.", "Fitness · Fuerza", "$35,00"],
      ["Cuerda de resistencia", "Accesorio elástico para ejercicios variados.", "Fitness · Resistencia", "$14,00"],
      ["Rodillo de masaje", "Rodillo texturizado para rutinas de recuperación.", "Fitness · Recuperación", "$19,90"],
      ["Bloques de yoga (2)", "Soporte firme para ejercicios de movilidad.", "Fitness · Yoga", "$17,50"],
      ["Guantes de gimnasio", "Agarre cómodo para ejercicios de fuerza.", "Fitness · Protección", "$16,00"],
      ["Rueda abdominal", "Accesorio compacto para ejercicios de core.", "Fitness · Fuerza", "$21,50"],
      ["Banda de suspensión", "Sistema de correas para ejercicios con peso corporal.", "Fitness · Entrenamiento", "$45,00"]
    ],
    natacion: [
      ["Aletas de entrenamiento", "Aletas cortas para ejercicios en piscina.", "Natación · Entrenamiento", "$29,90"],
      ["Tabla de natación", "Apoyo flotante para ejercicios de piernas.", "Natación · Entrenamiento", "$18,00"],
      ["Tapones para oídos", "Par reutilizable para sesiones de piscina.", "Natación · Accesorios", "$6,90"],
      ["Bolso impermeable", "Bolso para transportar ropa y accesorios húmedos.", "Natación · Bolsos", "$24,00"],
      ["Toalla de microfibra", "Toalla ligera para llevar a la piscina.", "Natación · Accesorios", "$15,50"],
      ["Paletas de natación", "Accesorio de entrenamiento para técnica de brazada.", "Natación · Entrenamiento", "$17,00"],
      ["Sandalias de piscina", "Calzado ligero para vestidores y piscina.", "Natación · Calzado", "$13,00"]
    ],
    outdoor: [
      ["Bastones de trekking (2)", "Bastones ajustables para caminatas.", "Outdoor · Senderismo", "$39,90"],
      ["Sombrero Trail", "Ala amplia para actividades al aire libre.", "Outdoor · Accesorios", "$19,00"],
      ["Brújula de bolsillo", "Brújula compacta para orientarse en excursiones.", "Outdoor · Navegación", "$12,00"],
      ["Manta térmica", "Manta compacta para llevar en la mochila.", "Outdoor · Seguridad", "$9,90"],
      ["Lámpara frontal", "Luz ajustable para caminatas y campamento.", "Outdoor · Iluminación", "$27,50"],
      ["Bolsa seca 10 L", "Bolsa enrollable para proteger objetos del agua.", "Outdoor · Bolsos", "$16,50"],
      ["Kit de primeros auxilios", "Estuche compacto para llevar en excursiones.", "Outdoor · Seguridad", "$22,00"]
    ],
    accesorios: [
      ["Bolso deportivo Core", "Compartimento principal para equipo y ropa.", "Accesorios · Bolsos", "$36,00"],
      ["Cinta métrica flexible", "Cinta retráctil para medidas de entrenamiento.", "Accesorios · Entrenamiento", "$7,90"],
      ["Toalla de entrenamiento", "Toalla compacta para gimnasio y cancha.", "Accesorios · Entrenamiento", "$11,00"],
      ["Botella deportiva 1 L", "Botella reutilizable para hidratarse durante el ejercicio.", "Accesorios · Hidratación", "$14,00"],
      ["Canguro deportivo", "Bolso compacto para objetos personales.", "Accesorios · Bolsos", "$18,50"],
      ["Candado para casillero", "Candado de combinación para uso diario.", "Accesorios · Entrenamiento", "$10,00"],
      ["Organizador de equipo", "Bolsa para separar accesorios en el bolso.", "Accesorios · Bolsos", "$12,50"]
    ]
  };

  const artworks = {
    futbol: '<circle cx="60" cy="60" r="37"/><path d="m60 42 14 10-5 16H51l-5-16 14-10Zm0 0V23m14 29 17-6M69 68l8 17m-26-17L36 78m10-26-17-6m15 40-7-17m30 0 16 6"/>',
    basketball: '<circle cx="60" cy="60" r="38"/><path d="M22 60h76M60 22v76M33 33c18 15 36 39 54 54M87 33C69 48 51 72 33 87"/>',
    tennis: '<ellipse cx="54" cy="47" rx="19" ry="28" transform="rotate(35 54 47)"/><path d="m67 66 21 22M42 26l25 39M70 29 39 63m-2-22 38 14"/>',
    mma: '<path d="M42 59V37a6 6 0 0 1 12 0v14-24a6 6 0 0 1 12 0v24-18a6 6 0 0 1 12 0v19l5-8a6 6 0 0 1 10 6L83 81a17 17 0 0 1-15 9h-8a18 18 0 0 1-16-10L33 65a6 6 0 0 1 9-7Z"/><path d="M50 77h28"/>',
    volleyball: '<circle cx="60" cy="60" r="38"/><path d="M39 31c15 12 23 34 23 67m29-54C73 46 52 57 34 78m57 5C74 70 54 68 23 73"/>',
    ropa: '<path d="m43 24 17 9 17-9 25 14-12 20-13-7v43H43V51l-13 7-12-20 25-14Z"/><path d="M47 25a13 13 0 0 0 26 0"/>',
    running: '<path d="M22 65c18 0 28-13 34-32l13 10 11 17 22 7a9 9 0 0 1-3 18H32a12 12 0 0 1-10-20Z"/><path d="m55 48 15 8M37 78h55"/>',
    ciclismo: '<circle cx="29" cy="72" r="18"/><circle cx="91" cy="72" r="18"/><path d="m29 72 22-38 19 38H29Zm22-38h21m-3 0 22 38M42 28h18"/>',
    fitness: '<path d="M42 39v42m36-42v42M28 48v24m64-24v24M42 60h36M19 48v24m82-24v24"/>',
    natacion: '<path d="M23 43h25l9 9h7l9-9h25v18H70l-8 8h-9l-9-8H23V43Z"/><path d="M19 84c9-10 18 10 27 0s18 10 27 0 18 10 27 0"/><circle cx="35" cy="52" r="7"/><circle cx="85" cy="52" r="7"/>',
    outdoor: '<path d="m15 91 31-55 20 32 11-18 26 41H15Z"/><path d="m38 56 8 8 8-5m14 9 10 6 8-5"/>',
    accesorios: '<path d="M35 27c0 17 50 29 50 48M85 27c0 17-50 29-50 48"/><circle cx="35" cy="27" r="7"/><circle cx="85" cy="27" r="7"/><circle cx="35" cy="75" r="7"/><circle cx="85" cy="75" r="7"/>'
  };

  const existingDescriptions = {
    "Balón Pro Match": "Balón de fútbol talla 5 para partidos y entrenamientos.",
    "Conos de agilidad (10)": "Conjunto de conos para ejercicios de coordinación y velocidad.",
    "Petos de entrenamiento (5)": "Petos ligeros para distinguir equipos durante la práctica.",
    "Balón Court One": "Balón de basketball para partidos y prácticas en cancha.",
    "Muñequera Court": "Muñequera deportiva para entrenar y jugar con comodidad.",
    "Red de aro reforzada": "Red de recambio resistente para aro de basketball.",
    "Raqueta Ace 100": "Raqueta de tennis liviana para entrenar y jugar.",
    "Pelotas de tennis (3)": "Paquete de tres pelotas para práctica recreativa.",
    "Overgrip Comfort (3)": "Cintas de agarre de recambio para raquetas.",
    "Guantes de entrenamiento": "Guantes acolchados para sesiones de artes marciales.",
    "Vendas para boxeo": "Vendas para brindar soporte durante el entrenamiento.",
    "Protector bucal": "Protector moldeable para entrenamiento de contacto.",
    "Balón Set Point": "Balón de volleyball para prácticas y partidos.",
    "Rodilleras Flex": "Rodilleras acolchadas para protegerte al jugar.",
    "Muñequeras de soporte": "Muñequeras elásticas para acompañar el entrenamiento.",
    "Camiseta Move": "Camiseta ligera de manga corta para actividad física.",
    "Sudadera Warm Up": "Sudadera cómoda para calentamiento y uso diario.",
    "Pantalón Training Flex": "Pantalón flexible para entrenamientos y movilidad.",
    "Zapatillas Pace Run": "Zapatillas para correr con diseño ligero.",
    "Botella Trail 600 ml": "Botella reutilizable para llevar agua durante la carrera.",
    "Cinturón para correr": "Cinturón ajustable para llevar objetos pequeños al correr.",
    "Casco Urban Ride": "Casco ajustable para protegerte en recorridos urbanos.",
    "Portabotella Road": "Soporte para mantener la botella al alcance en bicicleta.",
    "Luces recargables (2)": "Juego de luces recargables para mejorar la visibilidad.",
    "Mancuernas (2 × 3 kg)": "Par de mancuernas de 3 kg para ejercicios de fuerza.",
    "Mat de yoga Comfort": "Mat acolchado para yoga, estiramientos y movilidad.",
    "Bandas elásticas (3)": "Juego de bandas de resistencia para rutinas variadas.",
    "Gafas Aqua Fit": "Gafas ajustables para entrenar en piscina.",
    "Gorro de natación": "Gorro elástico para sesiones de natación.",
    "Pull buoy de entrenamiento": "Flotador de entrenamiento para ejercicios de técnica.",
    "Mochila Summit 20 L": "Mochila de 20 litros para caminatas y excursiones.",
    "Linterna Trail Mini": "Linterna compacta para recorridos al aire libre.",
    "Botella térmica Trek": "Botella térmica para llevar bebidas en excursiones.",
    "Cuerda de salto Speed": "Cuerda ajustable para calentamiento y ejercicio cardiovascular.",
    "Shaker deportivo 700 ml": "Vaso mezclador reutilizable de 700 ml.",
    "Toalla deportiva Dry": "Toalla compacta para gimnasio y entrenamiento."
  };

  function makeProductCard(categoryId, item, index) {
    const [name, description, type, price] = item;
    const section = document.getElementById(categoryId);
    const categoryName = section.querySelector("h2").textContent.trim();
    const card = document.createElement("article");
    card.className = "producto";
    card.innerHTML = `
      <div class="producto-imagen imagen-${categoryId}">
        <span class="etiqueta-producto">${categoryName}</span>
        <svg class="ilustracion-producto ilustracion-${categoryId}" viewBox="0 0 120 120" aria-hidden="true" focusable="false">${artworks[categoryId]}</svg>
      </div>
      <div class="producto-info">
        <p class="producto-categoria">${type}</p>
        <h3>${name}</h3>
        <p class="descripcion-producto">${description}</p>
        <p class="precio">${price}</p>
        <a class="boton boton-ancho" href="carrito.html">Añadir al carrito</a>
      </div>
    `;
    card.dataset.catalogIndex = String(index);
    return card;
  }

  function addCarousel(categoryId, section) {
    const title = section.querySelector("h2").textContent.trim();
    const products = [...section.querySelectorAll(".productos > .producto")].slice(0, 10);
    const preview = document.createElement("section");
    preview.className = "seccion-catalogo categoria-preview";
    preview.setAttribute("aria-labelledby", `titulo-${categoryId}`);
    preview.innerHTML = `
      <div class="titulo-seccion">
        <div>
          <p class="sobrelinea">SELECCIÓN PARA TI</p>
          <h2 id="titulo-${categoryId}">${title}</h2>
        </div>
        <a class="enlace-texto enlace-explorar" href="#${categoryId}">Explorar categoría <span aria-hidden="true">→</span></a>
      </div>
      <div class="controles-carrusel">
        <button class="control-carrusel control-anterior" type="button" aria-label="Ver productos anteriores de ${title}">←</button>
        <button class="control-carrusel control-siguiente" type="button" aria-label="Ver productos siguientes de ${title}">→</button>
      </div>
      <div class="carrusel-productos" tabindex="0" aria-label="Productos destacados de ${title}"></div>
    `;

    const carousel = preview.querySelector(".carrusel-productos");
    products.forEach((product) => carousel.append(product.cloneNode(true)));

    const more = document.createElement("a");
    more.className = "tarjeta-ver-mas";
    more.href = `#${categoryId}`;
    more.setAttribute("aria-label", `Ver todos los productos de ${title}`);
    more.innerHTML = `
      <span class="icono-mas" aria-hidden="true">+</span>
      <strong>Ver más</strong>
      <span>Explora toda la categoría ${title}</span>
    `;
    carousel.append(more);

    const previous = preview.querySelector(".control-anterior");
    const next = preview.querySelector(".control-siguiente");

    function updateControls() {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      previous.disabled = carousel.scrollLeft <= 1;
      next.disabled = carousel.scrollLeft >= maxScroll - 1;
    }

    function moveCarousel(direction) {
      const card = carousel.querySelector(".producto, .tarjeta-ver-mas");
      const gap = parseFloat(getComputedStyle(carousel).columnGap) || 16;
      const amount = card.getBoundingClientRect().width + gap;
      carousel.scrollBy({
        left: amount * direction,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    previous.addEventListener("click", () => moveCarousel(-1));
    next.addEventListener("click", () => moveCarousel(1));
    carousel.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    requestAnimationFrame(updateControls);
    return preview;
  }

  const productSections = [...document.querySelectorAll(".productos-seccion:not(#favoritos)")];
  const categoryList = document.querySelector(".categorias");
  const previews = document.createDocumentFragment();

  productSections.forEach((section) => {
    const id = section.id;
    const grid = section.querySelector(".productos");
    const additionalProducts = categoryProducts[id] || [];
    const currentCount = grid.querySelectorAll(".producto").length;

    grid.querySelectorAll(".producto").forEach((product) => {
      if (product.querySelector(".descripcion-producto")) return;
      const name = product.querySelector("h3").textContent.trim();
      const description = document.createElement("p");
      description.className = "descripcion-producto";
      description.textContent = existingDescriptions[name]
        || `${section.querySelector("h2").textContent.trim()} para entrenar y jugar.`;
      product.querySelector("h3").after(description);
    });

    additionalProducts.forEach((item, index) => {
      grid.append(makeProductCard(id, item, currentCount + index));
    });

    previews.append(addCarousel(id, section));
  });

  categoryList.closest(".seccion-catalogo").after(previews);
})();
