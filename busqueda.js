(() => {
  const form = document.querySelector(".busqueda");
  const input = form && form.querySelector('input[name="q"]');
  const resultsSection = document.getElementById("resultados-busqueda");
  const resultsGrid = document.getElementById("productos-encontrados");
  const resultsSummary = document.getElementById("resumen-resultados");
  const emptyState = document.getElementById("sin-resultados");

  if (!form || !input || !resultsSection || !resultsGrid || !resultsSummary || !emptyState) return;

  const query = new URLSearchParams(window.location.search).get("q")?.trim() || "";
  input.value = query;
  if (!query) return;

  document.body.classList.add("busqueda-activa");
  resultsSection.hidden = false;
  document.getElementById("titulo-resultados").textContent = `Resultados para “${query}”`;

  function normalize(value) {
    return value.toLocaleLowerCase("es").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").trim();
  }

  function renderResults() {
    const cards = [...document.querySelectorAll(
      ".productos-seccion:not(#favoritos):not(.categoria-preview) .productos > .producto"
    )];
    const normalizedQuery = normalize(query);
    const matches = cards.filter((card) => {
      const searchableText = [
        card.querySelector("h3")?.textContent,
        card.querySelector(".producto-categoria")?.textContent,
        card.querySelector(".descripcion-producto")?.textContent
      ].join(" ");
      return normalize(searchableText).includes(normalizedQuery);
    });

    resultsGrid.replaceChildren(...matches.map((card) => card.cloneNode(true)));
    resultsSummary.textContent = `${matches.length} ${matches.length === 1 ? "producto encontrado" : "productos encontrados"}.`;
    emptyState.hidden = matches.length > 0;
  }

  if (document.documentElement.dataset.catalogReady === "true") renderResults();
  else document.addEventListener("catalog:ready", renderResults, { once: true });
})();
