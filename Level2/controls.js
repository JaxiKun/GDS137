document.addEventListener('keydown', function(event) {
    // Ensure paddle and canvas are defined in the global scope
    if (event.key === 'w') {
        // Move up, but not above the canvas
        if (paddle.y > 0) {
            paddle.y = Math.max(0, paddle.y - 10);
        }
    } else if (event.key === 's') {
        // Move down, but not below the canvas
        if (paddle.y + paddle.height < canvas.height) {
            paddle.y = Math.min(canvas.height - paddle.height, paddle.y + 10);
        }
    }
});
