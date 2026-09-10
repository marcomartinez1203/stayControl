import { Habitacion } from "../models/Habitacion.js";
import { HabitacionesService } from "../services/habitacionesService.js";

const filters = document.querySelectorAll(".filter");
const rooms = [...document.querySelectorAll(".room-card")];
const habitacionesService = new HabitacionesService(
    rooms.map(room => new Habitacion({
        numero: room.dataset.numero,
        estado: room.dataset.status
    }))
);

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(item => item.classList.remove("active"));
        filter.classList.add("active");

        const visibles = new Set(
            habitacionesService.listar(filter.dataset.filter)
                .map(habitacion => habitacion.numero)
        );

        rooms.forEach(room => {
            room.style.display = visibles.has(room.dataset.numero) ? "flex" : "none";
        });
    });
});
