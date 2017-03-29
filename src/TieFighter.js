import Bullet from './Bullet';
import Particle from './Particle';
import { randomNumBetween } from './helpers';

export default class TieFighter {
    constructor(args) {
        this.position = args.position
        this.velocity = {
            x: randomNumBetween(-1.5, 1.5),
            y: randomNumBetween(-1.5, 1.5)
        }
        this.rotation = 0;
        this.rotationSpeed = randomNumBetween(-0.5, 0.5)
        this.radius = 15;
        this.score = (80 / this.radius) * 5;
        this.create = args.create;
        this.addScore = args.addScore;
        this.lastShot = 0;
        this.lastVolley = 0;
        this.coolDown = 1000;
    }

    destroy() {
        this.delete = true;
        this.addScore(this.score);

        // Explode
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
                }
            });
            this.create(particle, 'particles');
        }
    }

    render(state) {
        // Move
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Rotation
        this.rotation += this.rotationSpeed;
        if (this.rotation >= 360) {
            this.rotation -= 360;
        }
        if (this.rotation < 0) {
            this.rotation += 360;
        }



        if (Date.now() - this.lastVolley < randomNumBetween(3000, 10000)) {
            if (Date.now() - this.lastVolley < randomNumBetween(500, 1000)) {
                if (Date.now() - this.lastShot > 50) {
                    const bullet = new Bullet({ ship: this, range: 200, color: '#61c40b', destroyWithParticle: false });
                    this.create(bullet, 'bullets');
                    this.lastShot = Date.now();
                }
            }
        } else {
            this.lastVolley = Date.now();
        }

        // Screen edges
        if (this.position.x > state.screen.width + this.radius) this.position.x = -this.radius;
        else if (this.position.x < -this.radius) this.position.x = state.screen.width + this.radius;
        if (this.position.y > state.screen.height + this.radius) this.position.y = -this.radius;
        else if (this.position.y < -this.radius) this.position.y = state.screen.height + this.radius;

        // Draw
        const context = state.context;
        context.save();
        context.translate(this.position.x, this.position.y);
        context.rotate(this.rotation * Math.PI / 180);
        context.strokeStyle = '#FFF';
        context.lineWidth = 2;
        context.beginPath();

        // Main axis
        context.beginPath();
        context.moveTo(-8, 1);
        context.lineTo(-8, -1);
        context.lineTo(8, -1);
        context.lineTo(8, 1);
        context.closePath();
        context.stroke();
        context.fill();

        // Main body circle
        context.beginPath();
        context.arc(0, 0, 4, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // LEFT Wing
        context.beginPath();
        context.moveTo(-10, -12);
        context.lineTo(-8, -12);
        context.lineTo(-8, 12);
        context.lineTo(-10, 12);
        context.closePath();
        context.stroke();
        context.fill();

        // RIGHT Wing
        context.beginPath();
        context.moveTo(10, -12);
        context.lineTo(8, -12);
        context.lineTo(8, 12);
        context.lineTo(10, 12);
        context.closePath();
        context.stroke();
        context.fill();

        context.restore();
    }
}