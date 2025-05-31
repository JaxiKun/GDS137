let leftPressed = false;
let rightPressed = false;

window.addEventListener("keydown", function(e) {
    if(e.key === "ArrowLeft") leftPressed = true;
    if(e.key === "ArrowRight") rightPressed = true;
});
window.addEventListener("keyup", function(e) {
    if(e.key === "ArrowLeft") leftPressed = false;
    if(e.key === "ArrowRight") rightPressed = false;
});