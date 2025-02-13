document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startBtn").addEventListener("click", () => {
        window.myApi.startSession();
    });
});