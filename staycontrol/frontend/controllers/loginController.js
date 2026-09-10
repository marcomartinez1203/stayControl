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

loginButton.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Completa todos los campos.");
        return;
    }

    console.log("Login:", {
        email,
        password
    });
});
