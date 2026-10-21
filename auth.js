(() => {
  const dialog = document.getElementById("modal-auth");
  if (!(dialog instanceof HTMLDialogElement)) return;

  const tabs = [...dialog.querySelectorAll(".auth-tab")];
  const forms = [...dialog.querySelectorAll(".auth-form")];
  const openButtons = [...document.querySelectorAll("[data-open-auth]")];
  const closeButton = dialog.querySelector(".auth-cerrar");
  const logoutButton = document.getElementById("cerrar-sesion");
  const accountLabel = document.getElementById("cuenta-activa");
  const sessionStatus = document.getElementById("session-status");
  const accountsKey = "apex-sports-demo-accounts-v1";
  const sessionKey = "apex-sports-demo-session-v1";
  const iterations = 310000;
  let previousFocus = null;

  function readAccounts() {
    const raw = localStorage.getItem(accountsKey);
    if (!raw) return [];
    const accounts = JSON.parse(raw);
    if (!Array.isArray(accounts) || !accounts.every((account) =>
      account && typeof account.email === "string"
      && typeof account.name === "string"
      && typeof account.salt === "string"
      && typeof account.passwordHash === "string"
    )) {
      throw new Error("Los datos de cuenta local tienen un formato inválido.");
    }
    return accounts;
  }

  function readSession() {
    const raw = localStorage.getItem(sessionKey);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session.email !== "string" || typeof session.name !== "string") {
      throw new Error("La sesión local tiene un formato inválido.");
    }
    return session;
  }

  function showStorageError(form, error) {
    console.error("No se pudo acceder al almacenamiento de cuentas.", error);
    const errorBox = form.querySelector(".auth-error");
    errorBox.textContent = "No pudimos guardar o consultar la cuenta en este navegador. Revisa el almacenamiento y vuelve a intentarlo.";
    errorBox.hidden = false;
  }

  function updateUserState(session) {
    openButtons.forEach((button) => {
      button.hidden = Boolean(session);
    });
    if (accountLabel) {
      accountLabel.hidden = !session;
      accountLabel.textContent = session ? `Hola, ${session.name}` : "";
    }
    if (logoutButton) logoutButton.hidden = !session;
    if (sessionStatus) {
      sessionStatus.textContent = session ? `Sesión local iniciada para ${session.name}.` : "Sesión cerrada.";
    }
  }

  function showMode(mode, focusTab = false) {
    tabs.forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle("auth-tab-activa", active);
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    forms.forEach((form) => {
      form.hidden = form.dataset.authForm !== mode;
    });
    if (focusTab) {
      const activeTab = tabs.find((tab) => tab.dataset.authMode === mode);
      activeTab?.focus();
    }
  }

  function openDialog(mode, opener) {
    if (dialog.open) {
      showMode(mode);
      return;
    }
    previousFocus = opener;
    showMode(mode);
    dialog.showModal();
    dialog.querySelector(`#${mode}-email`)?.focus();
  }

  function clearErrors(form) {
    form.querySelectorAll(".error-campo").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
    const errorBox = form.querySelector(".auth-error");
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function fieldError(form, id, message) {
    const field = form.querySelector(`#${id}`);
    const error = form.querySelector(`#${id}-error`);
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
  }

  function validateEmail(form, id, email) {
    if (!email) {
      fieldError(form, id, "Ingresa tu correo electrónico.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldError(form, id, "Escribe un correo válido, por ejemplo nombre@correo.com.");
      return false;
    }
    fieldError(form, id, "");
    return true;
  }

  async function hashPassword(password, salt) {
    if (!window.crypto?.subtle) {
      throw new Error("La protección de contraseñas necesita HTTPS o localhost.");
    }
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits({
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    }, key, 256);
    return [...new Uint8Array(bits)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  function decodeBase64(value) {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }

  function encodeBase64(value) {
    return btoa(String.fromCharCode(...value));
  }

  async function register(form) {
    const name = form.querySelector("#register-name").value.trim();
    const email = form.querySelector("#register-email").value.trim().toLocaleLowerCase("es");
    const password = form.querySelector("#register-password").value;
    let valid = true;

    if (name.length < 2) {
      fieldError(form, "register-name", "Escribe tu nombre con al menos 2 caracteres.");
      valid = false;
    } else fieldError(form, "register-name", "");
    if (!validateEmail(form, "register-email", email)) valid = false;
    if (password.length < 8) {
      fieldError(form, "register-password", "Usa una contraseña de al menos 8 caracteres.");
      valid = false;
    } else fieldError(form, "register-password", "");
    if (!valid) return;

    const accounts = readAccounts();
    if (accounts.some((account) => account.email === email)) {
      fieldError(form, "register-email", "Ya existe una cuenta local con ese correo. Inicia sesión.");
      return;
    }

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const passwordHash = await hashPassword(password, salt);
    accounts.push({ name, email, salt: encodeBase64(salt), passwordHash });
    localStorage.setItem(accountsKey, JSON.stringify(accounts));
    localStorage.setItem(sessionKey, JSON.stringify({ name, email }));
    updateUserState({ name, email });
    form.reset();
    dialog.close();
  }

  async function login(form) {
    const email = form.querySelector("#login-email").value.trim().toLocaleLowerCase("es");
    const password = form.querySelector("#login-password").value;
    let valid = validateEmail(form, "login-email", email);
    if (!password) {
      fieldError(form, "login-password", "Ingresa tu contraseña.");
      valid = false;
    } else fieldError(form, "login-password", "");
    if (!valid) return;

    const account = readAccounts().find((entry) => entry.email === email);
    if (!account) {
      fieldError(form, "login-email", "No encontramos una cuenta local con ese correo. Puedes crear una cuenta.");
      return;
    }

    const passwordHash = await hashPassword(password, decodeBase64(account.salt));
    if (passwordHash !== account.passwordHash) {
      fieldError(form, "login-password", "La contraseña no coincide. Inténtalo de nuevo.");
      return;
    }

    const session = { name: account.name, email: account.email };
    localStorage.setItem(sessionKey, JSON.stringify(session));
    updateUserState(session);
    form.reset();
    dialog.close();
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => showMode(tab.dataset.authMode));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const mode = tab.dataset.authMode === "login" ? "register" : "login";
      showMode(mode, true);
    });
  });

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openDialog(button.dataset.openAuth, button));
  });

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.open) dialog.close();
  });
  dialog.addEventListener("close", () => {
    if (previousFocus?.isConnected && !previousFocus.hidden) previousFocus.focus();
    previousFocus = null;
  });

  forms.forEach((form) => {
    form.addEventListener("input", (event) => {
      const field = event.target;
      const error = field.id && form.querySelector(`#${field.id}-error`);
      if (error) {
        error.hidden = true;
        error.textContent = "";
        field.setAttribute("aria-invalid", "false");
      }
      const errorBox = form.querySelector(".auth-error");
      errorBox.hidden = true;
      errorBox.textContent = "";
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      clearErrors(form);
      try {
        if (form.dataset.authForm === "register") await register(form);
        else await login(form);
      } catch (error) {
        showStorageError(form, error);
      }
    });
  });

  logoutButton?.addEventListener("click", () => {
    try {
      localStorage.removeItem(sessionKey);
      updateUserState(null);
    } catch (error) {
      console.error("No se pudo cerrar la sesión local.", error);
      if (sessionStatus) sessionStatus.textContent = "No se pudo cerrar la sesión local.";
    }
  });

  try {
    updateUserState(readSession());
  } catch (error) {
    showStorageError(forms[0], error);
    updateUserState(null);
  }
})();
