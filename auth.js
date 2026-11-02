(() => {
  const api = window.ApexApi;
  const dialog = document.getElementById("modal-auth");
  if (!api || !(dialog instanceof HTMLDialogElement)) return;

  const tabs = [...dialog.querySelectorAll(".auth-tab")];
  const forms = [...dialog.querySelectorAll(".auth-form")];
  const openButtons = [...document.querySelectorAll("[data-open-auth]")];
  const closeButton = dialog.querySelector(".auth-cerrar");
  const logoutButton = document.getElementById("cerrar-sesion");
  const accountLabel = document.getElementById("cuenta-activa");
  const sessionStatus = document.getElementById("session-status");
  const authContext = document.getElementById("auth-context");
  let previousFocus = null;
  let pendingAction = null;

  function updateUserState(user) {
    openButtons.forEach((button) => { button.hidden = Boolean(user); });
    if (accountLabel) {
      accountLabel.hidden = !user;
      accountLabel.textContent = user ? `Hola, ${user.name}` : "";
    }
    if (logoutButton) logoutButton.hidden = !user;
    if (sessionStatus) sessionStatus.textContent = user
      ? `Sesión iniciada para ${user.name}.`
      : "Sesión cerrada.";
  }

  function showMode(mode) {
    tabs.forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle("auth-tab-activa", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    forms.forEach((form) => { form.hidden = form.dataset.authForm !== mode; });
  }

  function openDialog(mode, opener) {
    previousFocus = opener instanceof HTMLElement ? opener : document.activeElement;
    showMode(mode);
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(`#${mode}-email`)?.focus();
  }

  function clearErrors(form) {
    form.querySelectorAll(".error-campo").forEach((box) => {
      box.textContent = "";
      box.hidden = true;
    });
    const general = form.querySelector(".auth-error");
    if (general) {
      general.textContent = "";
      general.hidden = true;
    }
  }

  function showGeneral(form, message) {
    const box = form.querySelector(".auth-error");
    box.textContent = message;
    box.hidden = false;
  }

  function fieldError(form, id, message) {
    const field = form.querySelector(`#${id}`);
    const error = form.querySelector(`#${id}-error`);
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
  }

  function validateEmail(form, id) {
    const field = form.querySelector(`#${id}`);
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    fieldError(form, id, valid ? "" : "Escribe un correo electrónico válido.");
    return valid;
  }

  async function loadCities() {
    const select = document.getElementById("register-city");
    if (!select) return;
    try {
      const cities = await api.request("/products/cities");
      select.replaceChildren(new Option("Selecciona tu ciudad", ""));
      cities.forEach((city) => select.add(new Option(city.name, city.id)));
    } catch {
      select.replaceChildren(new Option("No disponibles; revisa la conexión", ""));
      select.disabled = true;
    }
  }

  function finish(user) {
    updateUserState(user);
    const action = pendingAction;
    pendingAction = null;
    dialog.close();
    action?.onAuthenticated(user);
  }

  async function submitLogin(form) {
    const email = form.querySelector("#login-email").value.trim();
    const password = form.querySelector("#login-password").value;
    if (!validateEmail(form, "login-email") || !password) {
      if (!password) fieldError(form, "login-password", "Ingresa tu contraseña.");
      return;
    }
    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const user = await api.login({ email, password });
      form.reset();
      finish(user);
    } catch (error) {
      showGeneral(form, error.message);
    } finally {
      submit.disabled = false;
    }
  }

  async function submitRegistration(form) {
    const fullName = form.querySelector("#register-name").value.trim();
    const email = form.querySelector("#register-email").value.trim();
    const password = form.querySelector("#register-password").value;
    const identification = form.querySelector("#register-identification").value.trim();
    const cityId = form.querySelector("#register-city").value;
    let valid = validateEmail(form, "register-email");
    const nameValid = fullName.split(/\s+/).length >= 2 && fullName.length <= 40;
    fieldError(form, "register-name", nameValid ? "" : "Escribe nombre y apellido (máximo 40 caracteres).");
    valid = nameValid && valid;
    const identificationValid = /^\d{10}(?:\d{3})?$/.test(identification);
    fieldError(form, "register-identification", identificationValid ? "" : "Ingresa una cédula de 10 o un RUC de 13 dígitos.");
    valid = identificationValid && valid;
    fieldError(form, "register-city", cityId ? "" : "Selecciona tu ciudad.");
    valid = Boolean(cityId) && valid;
    fieldError(form, "register-password", password.length >= 12 ? "" : "Usa al menos 12 caracteres.");
    valid = password.length >= 12 && valid;
    if (!valid) return;

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;
    try {
      const user = await api.register({
        full_name: fullName,
        email,
        password,
        identification,
        city_id: cityId
      });
      form.reset();
      finish(user);
    } catch (error) {
      showGeneral(form, error.message);
    } finally {
      submit.disabled = false;
    }
  }

  window.ApexAuth = Object.freeze({
    requireSession({ mode = "login", opener = document.activeElement, message, onAuthenticated = () => {}, onCancel } = {}) {
      const cachedUser = api.getUser();
      if (cachedUser && api.getToken()) {
        onAuthenticated(cachedUser);
        return true;
      }
      if (authContext && message) authContext.textContent = message;
      pendingAction = { onAuthenticated, onCancel };
      openDialog(mode, opener);
      return false;
    }
  });

  tabs.forEach((tab) => tab.addEventListener("click", () => showMode(tab.dataset.authMode)));
  openButtons.forEach((button) => button.addEventListener("click", () => openDialog(button.dataset.openAuth, button)));
  closeButton?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (previousFocus?.isConnected && !previousFocus.hidden) previousFocus.focus();
    previousFocus = null;
    const action = pendingAction;
    pendingAction = null;
    action?.onCancel?.();
  });
  forms.forEach((form) => {
    form.addEventListener("input", (event) => {
      if (event.target instanceof HTMLElement) event.target.removeAttribute("aria-invalid");
      clearErrors(form);
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);
      if (form.dataset.authForm === "register") submitRegistration(form);
      else submitLogin(form);
    });
  });
  logoutButton?.addEventListener("click", async () => {
    try {
      await api.logout();
      updateUserState(null);
    } catch {
      sessionStatus.textContent = "No se pudo cerrar la sesión. Inténtalo otra vez.";
    }
  });

  loadCities();
  api.currentUser().then(updateUserState);
  if (document.querySelector("[data-require-auth='delivery']")) {
    api.currentUser().then((user) => {
      if (user) {
        updateUserState(user);
        return;
      }
      if (authContext) authContext.textContent = "Para continuar con la entrega, inicia sesión o crea una cuenta.";
      pendingAction = { onAuthenticated: () => {}, onCancel: () => window.location.replace("carrito.html") };
      openDialog("login");
    });
  }
})();
