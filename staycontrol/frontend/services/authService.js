import { requestJson } from "./apiService.js";

export function iniciarSesion(email, password) {
    return requestJson("/api/v1/auth/login", { method: "POST", body: { email, password } });
}

export function consultarSesion() {
    return requestJson("/api/v1/auth/me");
}

export function cerrarSesion() {
    return requestJson("/api/v1/auth/logout", { method: "POST" });
}
