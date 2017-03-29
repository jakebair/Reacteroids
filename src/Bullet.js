import Particle from './Particle';
import { rotatePoint, asteroidVertices, randomNumBetween } from './helpers';

export default class Bullet {
    constructor(args) {
        let posDelta = rotatePoint({ x: 0, y: -30 }, { x: 0, y: 0 }, args.ship.rotation * Math.PI / 180);
        this.position = {
            x: args.ship.position.x + posDelta.x,
            y: args.ship.position.y + posDelta.y
        };
        this.rotation = args.ship.rotation;
        this.velocity = {
            x: posDelta.x / 2,
            y: posDelta.y / 2
        };
        this.radius = 2;
        this.creationTime = Date.now();
        this.create = args.ship.create;
        this.range = args.range || 500;
        this.color = args.color || '#ed1c1f';
        this.destroyWithParticle = args.destroyWithParticle;
    }

    createParticle() {
        for (let i = 0; i < this.radius; i++) {
            const particle = new Particle({
                lifeSpan: randomNumBetween(60, 100),
                size: randomNumBetween(1, 3),
                position: {
                    x: this.position.x + randomNumBetween(-this.radius / 4, this.radius / 4),
                    y: this.position.y + randomNumBetween(-this.radius / 4, this.radius / 4)
                },
                velocity: {
                    x: randomNumBetween(-1.5, 1.5),
                    y: randomNumBetween(-1.5, 1.5)
                },
                color: this.color
            });
            this.create(particle, 'particles');
        }
    }

    destroy() {
        if (this.destroyWithParticle) {
            this.createParticle();
        }
        this.delete = true;
    }

    render(state) {
        // Move
        var lifetime = this.range - (Date.now() - this.creationTime);
        if (lifetime < 0) {
            this.destroy();
        } else {
            this.position.x += this.velocity.x * lifetime / 100;
            this.position.y += this.velocity.y * lifetime / 100;
        }

        // Screen edges
        if (this.position.x > state.screen.width) this.position.x = 0;
        else if (this.position.x < 0) this.position.x = state.screen.width;
        if (this.position.y > state.screen.height) this.position.y = 0;
        else if (this.position.y < 0) this.position.y = state.screen.height;

        // Draw
        const context = state.context;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation * Math.PI / 180);
        context.fillStyle = this.color;
        context.lineWidth = 0, 5;
        context.beginPath();
        context.arc(0, 0, 2, 0, 2 * Math.PI);
        context.closePath();
        context.fill();
        context.restore();
    }
}