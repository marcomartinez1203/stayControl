const days = document.querySelectorAll(".day");

days.forEach(day => {
    day.addEventListener("click", () => {
        days.forEach(item => item.classList.remove("selected"));
        day.classList.add("selected");
    });
});

const addReservation = document.getElementById("addReservation");

addReservation.addEventListener("click", () => {
    console.log("Nueva reserva");
});
