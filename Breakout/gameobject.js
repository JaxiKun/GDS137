class GameObject {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color || "#fff";
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    intersects(obj) {
        return !(this.x > obj.x + obj.width ||
                 this.x + this.width < obj.x ||
                 this.y > obj.y + obj.height ||
                 this.y + this.height < obj.y);
    }
}