import { TareaLimpieza } from "../models/TareaLimpieza.js";
import { LimpiezaService } from "../services/limpiezaService.js";

const taskCards = [...document.querySelectorAll(".task-card")];
const estados = ["pending", "process", "completed"];
const etiquetas = {
    pending: "Pendiente",
    process: "En Proceso",
    completed: "Completada"
};
const limpiezaService = new LimpiezaService(
    taskCards.map(card => {
        const status = card.querySelector(".task-status");
        return new TareaLimpieza({
            numero: card.dataset.numero,
            estado: estados.find(estado => status.classList.contains(estado)) || "pending"
        });
    })
);

taskCards.forEach(card => {
    const checkbox = card.querySelector(".checkbox");
    const status = card.querySelector(".task-status");

    checkbox.addEventListener("click", () => {
        const tarea = limpiezaService.alternarCompletada(card.dataset.numero);

        checkbox.classList.toggle("checked", tarea.estado === "completed");
        status.textContent = etiquetas[tarea.estado];
        status.classList.remove(...estados);
        status.classList.add(tarea.estado);
    });
});
