(() => {
  const productsPerPage = 15;
  const grids = document.querySelectorAll(".productos-seccion .productos");

  function setupPagination(grid) {
    const section = grid.closest(".productos-seccion");
    if (!grid.id) {
      grid.id = `productos-${section.id}`;
    }
    let pagination = grid.nextElementSibling;

    if (!pagination || !pagination.classList.contains("paginacion")) {
      pagination = document.createElement("nav");
      pagination.className = "paginacion";
      pagination.setAttribute(
        "aria-label",
        `Paginación de ${section.querySelector("h2").textContent.trim()}`
      );
      pagination.innerHTML = `
        <button class="pagina-anterior" type="button">Anterior</button>
        <span class="pagina-actual" aria-current="page" aria-live="polite"></span>
        <button class="pagina-siguiente" type="button">Siguiente</button>
      `;
      grid.after(pagination);
    }

    const previous = pagination.querySelector(".pagina-anterior");
    const next = pagination.querySelector(".pagina-siguiente");
    const pageLabel = pagination.querySelector(".pagina-actual");
    let currentPage = 1;
    previous.setAttribute("aria-controls", grid.id);
    next.setAttribute("aria-controls", grid.id);

    function updatePage() {
      const cards = [...grid.querySelectorAll(".producto")];
      const pageCount = Math.max(1, Math.ceil(cards.length / productsPerPage));
      currentPage = Math.min(currentPage, pageCount);

      cards.forEach((card, index) => {
        card.hidden = index < (currentPage - 1) * productsPerPage
          || index >= currentPage * productsPerPage;
      });

      pagination.hidden = cards.length <= productsPerPage;
      pageLabel.textContent = `Página ${currentPage} de ${pageCount}`;
      previous.disabled = currentPage === 1;
      next.disabled = currentPage === pageCount;
    }

    previous.addEventListener("click", () => {
      currentPage -= 1;
      updatePage();
      previous.focus();
    });

    next.addEventListener("click", () => {
      currentPage += 1;
      updatePage();
      next.focus();
    });

    window.addEventListener("hashchange", () => {
      currentPage = 1;
      updatePage();
    });

    new MutationObserver(() => {
      currentPage = 1;
      updatePage();
    }).observe(grid, { childList: true });

    updatePage();
  }

  grids.forEach(setupPagination);
})();
