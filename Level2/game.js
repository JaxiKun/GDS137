const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.body.appendChild(canvas);

function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Animation logic goes here
    requestAnimationFrame(animate);
}

setInterval(animate, 1000 / 60);
