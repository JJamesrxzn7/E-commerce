(() => {
  if (document.getElementById("modal-auth")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <dialog class="auth-dialog" id="modal-auth" aria-labelledby="auth-titulo">
      <div class="auth-modal">
        <button class="auth-cerrar" type="button" aria-label="Cerrar">×</button>
        <div class="auth-brand" aria-hidden="true"><span class="marca-icono">A</span><span>APEX <strong>SPORTS</strong></span></div>
        <p class="auth-eyebrow">TU CUENTA APEX</p>
        <h1 class="solo-lectores" id="auth-titulo">Acceso a tu cuenta Apex Sports</h1>
        <p class="auth-context" id="auth-context" role="status">Inicia sesión o crea una cuenta para continuar.</p>
        <div class="auth-tabs" role="tablist" aria-label="Opciones de acceso">
          <button class="auth-tab auth-tab-activa" id="login-tab" type="button" role="tab" aria-controls="login-panel" data-auth-mode="login" aria-selected="true">Iniciar sesión</button>
          <button class="auth-tab" id="register-tab" type="button" role="tab" aria-controls="register-panel" data-auth-mode="register" aria-selected="false">Crear cuenta</button>
        </div>

        <form class="auth-form" id="login-panel" role="tabpanel" aria-labelledby="login-tab" data-auth-form="login" novalidate>
          <h2>Qué bueno verte de nuevo</h2>
          <p class="auth-description">Ingresa tus datos para continuar.</p>
          <div class="campo">
            <label for="login-email">Correo electrónico</label>
            <input id="login-email" name="email" type="email" autocomplete="email" maxlength="50" placeholder="nombre@correo.com" required>
            <small class="error-campo" id="login-email-error" role="alert" hidden></small>
          </div>
          <div class="campo">
            <label for="login-password">Contraseña</label>
            <input id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Tu contraseña" required>
            <small class="error-campo" id="login-password-error" role="alert" hidden></small>
          </div>
          <button class="boton boton-ancho" type="submit">Iniciar sesión</button>
          <p class="auth-error" id="login-error" role="alert" hidden></p>
        </form>

        <form class="auth-form" id="register-panel" role="tabpanel" aria-labelledby="register-tab" data-auth-form="register" novalidate hidden>
          <h2 id="register-title">Crea tu cuenta</h2>
          <p class="auth-description">Datos mínimos de cuenta; la entrega se indica para cada pedido.</p>
          <div class="campo">
            <label for="register-name">Nombre completo</label>
            <input id="register-name" name="name" type="text" autocomplete="name" maxlength="40" placeholder="Tu nombre completo (máximo 40 caracteres)" required>
            <small class="error-campo" id="register-name-error" role="alert" hidden></small>
          </div>
          <div class="campo">
            <label for="register-email">Correo electrónico</label>
            <input id="register-email" name="email" type="email" autocomplete="email" maxlength="50" placeholder="nombre@correo.com" required>
            <small class="error-campo" id="register-email-error" role="alert" hidden></small>
          </div>
          <div class="campo">
            <label for="register-identification">Cédula o RUC</label>
            <input id="register-identification" name="identification" inputmode="numeric" autocomplete="off" maxlength="13" required>
            <small class="error-campo" id="register-identification-error" role="alert" hidden></small>
          </div>
          <div class="campo">
            <label for="register-city">Ciudad</label>
            <select id="register-city" name="city_id" autocomplete="address-level2" required>
              <option value="">Cargando ciudades…</option>
            </select>
            <small class="error-campo" id="register-city-error" role="alert" hidden></small>
          </div>
          <div class="campo">
            <label for="register-password">Contraseña</label>
            <input id="register-password" name="password" type="password" autocomplete="new-password" placeholder="Mínimo 12 caracteres" minlength="12" required>
            <small class="error-campo" id="register-password-error" role="alert" hidden></small>
          </div>
          <button class="boton boton-ancho" type="submit">Crear cuenta</button>
          <p class="auth-error" id="register-error" role="alert" hidden></p>
        </form>
        <p class="auth-demo-note">El registro crea una cuenta de cliente. El teléfono y la dirección se solicitan al preparar cada pedido; no se guardan como dirección fija del perfil. Los accesos administrativos los provisiona el administrador.</p>
      </div>
    </dialog>
  `);
})();
