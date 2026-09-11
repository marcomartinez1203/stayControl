import { iniciarSesion } from "../services/authService.js";

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");

togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";

    passwordInput.type = isPassword ? "text" : "password";

    togglePassword.setAttribute(
        "aria-label",
        isPassword
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
    );
});

loginButton.addEventListener("click", async event => {
    event.preventDefault();
    if (loginButton.disabled) { return; }
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    loginButton.disabled = true;
    try {
        await iniciarSesion(email, password);
        passwordInput.value = "";
        window.location.assign("/dashboard");
    } catch (error) {
        alert(error.message || "No se pudo iniciar sesión.");
    } finally {
        loginButton.disabled = false;
    }
});
