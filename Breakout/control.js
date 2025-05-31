let leftPressed = false;
let rightPressed = false;

window.addEventListener("keydown", function(e) {
    if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = true;
    if(e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = true;
});
window.addEventListener("keyup", function(e) {
    if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A") leftPressed = false;
    if(e.key === "ArrowRight" || e.key === "d" || e.key === "D") rightPressed = false;
});