/**
 * Cliente JSON para las futuras rutas del backend.
 * Solo hace una petición cuando un servicio llama explícitamente a requestJson.
 */
export async function requestJson(url, { body, headers, ...options } = {}) {
    const requestHeaders = new Headers(headers);
    if (!requestHeaders.has("Accept")) {
        requestHeaders.set("Accept", "application/json");
    }
    if (body !== undefined && !requestHeaders.has("Content-Type")) {
        requestHeaders.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
        ...options,
        headers: requestHeaders,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });

    if (!response.ok) {
        throw new Error(`La solicitud falló (HTTP ${response.status}).`);
    }
    if (response.status === 204) {
        return null;
    }
    return response.json();
}
