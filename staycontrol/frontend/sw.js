/* Incrementar VERSION al publicar cambios en los recursos offline. */
const VERSION = "staycontrol-pwa-vue-v2";
const OFFLINE = "/offline.html";
// Lista cerrada: nada de sesiones, perfiles, HTML de negocio ni respuestas API.
const PUBLICOS = [OFFLINE, "/assets/css/pwa.css", "/controllers/pwaController.js",
    "/assets/fonts/DMSans-Variable.ttf", "/assets/icons/pwa-192.png", "/assets/icons/pwa-512.png"];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(
        PUBLICOS.map(url => new Request(url, { cache: "reload", credentials: "omit" }))
    )));
    // Sin skipWaiting: no sustituir el worker de una pestaña con formularios abiertos.
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const nombres = await caches.keys();
        await Promise.all(nombres.filter(nombre => nombre.startsWith("staycontrol-pwa-") && nombre !== VERSION)
            .map(nombre => caches.delete(nombre)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);
    // Las escrituras y todas las APIs usan exclusivamente la red. Nunca se encolan.
    if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
    if (request.mode === "navigate") {
        event.respondWith(fetch(request).catch(async () => {
            const cache = await caches.open(VERSION);
            return await cache.match(OFFLINE) || new Response("Sin conexión. Vuelve a intentarlo cuando el servidor esté disponible.", {
                status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" }
            });
        }));
        return;
    }
    if (PUBLICOS.includes(url.pathname) && !url.search) {
        event.respondWith((async () => {
            const cache = await caches.open(VERSION);
            return await cache.match(url.pathname) || fetch(request);
        })());
    }
});
