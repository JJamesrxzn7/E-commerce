(() => {
  const apiBase = (window.APEX_API_BASE || "http://127.0.0.1:8000/api/v1").replace(/\/+$/, "");
  const tokenKey = "apex-api-token-v1";
  const userKey = "apex-api-user-v1";
  const cartOriginKey = "apex-sports-cart-origin-v1";

  function getToken() {
    try { return sessionStorage.getItem(tokenKey); } catch { return null; }
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(userKey) || "null"); } catch { return null; }
  }

  function setSession(data) {
    sessionStorage.setItem(tokenKey, data.access_token);
    sessionStorage.setItem(userKey, JSON.stringify(data.user));
  }

  function clearSession() {
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(userKey);
    if (localStorage.getItem(cartOriginKey) === "server") {
      localStorage.removeItem("apex-sports-cart");
      localStorage.removeItem(cartOriginKey);
    }
  }

  async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("Accept", "application/json");
    if (options.body !== undefined) headers.set("Content-Type", "application/json");
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const response = await fetch(`${apiBase}${path}`, { ...options, headers });
    if (response.status === 204) return null;
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) clearSession();
      const detail = typeof result.detail === "string" ? result.detail : "No se pudo completar la solicitud.";
      throw new Error(detail);
    }
    return result;
  }

  async function login(data) {
    const result = await request("/auth/login", { method: "POST", body: JSON.stringify(data) });
    setSession(result);
    return result.user;
  }

  async function register(data) {
    const result = await request("/auth/register", { method: "POST", body: JSON.stringify(data) });
    setSession(result);
    return result.user;
  }

  async function logout() {
    try {
      if (getToken()) await request("/auth/session", { method: "DELETE" });
    } finally {
      clearSession();
    }
  }

  async function currentUser() {
    if (!getToken()) return null;
    try {
      return await profile();
    } catch {
      clearSession();
      return null;
    }
  }

  async function profile() {
    const user = await request("/auth/me");
    sessionStorage.setItem(userKey, JSON.stringify(user));
    return user;
  }

  function favoriteItems(result) {
    if (!result || !Array.isArray(result.items)
      || !result.items.every((item) => item && typeof item.id === "string")) {
      throw new Error("La API devolvió una lista de favoritos inválida.");
    }
    return result.items;
  }

  async function listFavorites() {
    return favoriteItems(await request("/favorites"));
  }

  async function addFavorite(productSlug) {
    return favoriteItems(await request(`/favorites/${encodeURIComponent(productSlug)}`, { method: "PUT" }));
  }

  async function removeFavorite(productSlug) {
    return favoriteItems(await request(`/favorites/${encodeURIComponent(productSlug)}`, { method: "DELETE" }));
  }

  window.ApexApi = Object.freeze({
    base: apiBase,
    request,
    login,
    register,
    logout,
    currentUser,
    profile,
    listFavorites,
    addFavorite,
    removeFavorite,
    getUser,
    getToken,
    clearSession
  });
})();
