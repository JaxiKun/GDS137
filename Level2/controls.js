

document.addEventListener('keydown', function(event) {
    if (event.key === 'w') {
        paddle.y -= 10; // Move paddle up
    } else if (event.key === 's') {
        paddle.y += 10; // Move paddle down
    }
});
