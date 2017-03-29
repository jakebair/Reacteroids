import Bullet from './Bullet';
import Missile from './Missile';
import Particle from './Particle';
import { rotatePoint, randomNumBetween } from './helpers';

export default class Ship {
    constructor(args) {
        this.position = args.position
        this.velocity = {
            x: 0,
            y: 0
        }
        this.rotation = 0;
        this.rotationSpeed = 6;
        this.speed = 0.15;
        this.inertia = 0.99;
        this.radius = 20;
        this.lastShot = 0;
        this.create = args.create;
        this.onDie = args.onDie;
    }

    destroy() {
        this.delete = true;
        this.onDie();

        // Explode
        for (let i = 0; i < 60; i++) {
            const particle = new Particle({
                lifeSpan: randomNumBetween(60, 100),
                size: randomNumBetween(1, 4),
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

    rotate(dir) {
        if (dir == 'LEFT') {
            this.rotation -= this.rotationSpeed;
        }
        if (dir == 'RIGHT') {
            this.rotation += this.rotationSpeed;
        }
    }

    accelerate(val) {
        this.velocity.x -= Math.sin(-this.rotation * Math.PI / 180) * this.speed;
        this.velocity.y -= Math.cos(-this.rotation * Math.PI / 180) * this.speed;

        // Thruster particles
        let posDelta = rotatePoint({ x: 0, y: -10 }, { x: 0, y: 0 }, (this.rotation - 180) * Math.PI / 180);
        const particle = new Particle({
            lifeSpan: randomNumBetween(20, 40),
            size: randomNumBetween(1, 3),
            position: {
                x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
                y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
            },
            velocity: {
                x: posDelta.x / randomNumBetween(3, 5),
                y: posDelta.y / randomNumBetween(3, 5)
            },
            color: '#94aace'
        });
        this.create(particle, 'particles');
    }

    render(state) {
        // Controls
        if (state.keys.up) {
            this.accelerate(1);
        }
        if (state.keys.left) {
            this.rotate('LEFT');
        }
        if (state.keys.right) {
            this.rotate('RIGHT');
        }
        if (state.keys.space && Date.now() - this.lastShot > 100) {
            const bullet = new Bullet({ ship: this });
            this.create(bullet, 'bullets');
            this.lastShot = Date.now();
        }
        if (state.keys.ctrl && state.missiles.length == 0) {
            const missile = new Missile({ ship: this });
            this.create(missile, 'missiles');
            this.lastShot = Date.now();
        }

        // Move
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.velocity.x *= this.inertia;
        this.velocity.y *= this.inertia;

        // Rotation
        if (this.rotation >= 360) {
            this.rotation -= 360;
        }
        if (this.rotation < 0) {
            this.rotation += 360;
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
        context.strokeStyle = '#ffffff';
        context.fillStyle = '#000000';
        context.lineWidth = 2;

        // LEFT Front Arrow
        context.beginPath();
        context.moveTo(-4, 0);
        context.lineTo(-4, -32);
        context.lineTo(-6, -32);
        context.lineTo(-20, 0);
        context.closePath();
        context.stroke();
        context.fill();

        // RIGHT Front Arrow
        context.beginPath();
        context.moveTo(4, 0);
        context.lineTo(4, -32);
        context.lineTo(6, -32);
        context.lineTo(20, 0);
        context.closePath();
        context.stroke();
        context.fill();

        // Main body circle
        context.beginPath();
        context.arc(0, 0, 20, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // Front rectangle
        context.beginPath();
        context.moveTo(2, 0);
        context.lineTo(-2, 0);
        context.lineTo(-2, -24);
        context.lineTo(2, -24);
        context.closePath();
        context.stroke();
        context.fill();

        // cockpit access tunnel
        context.beginPath();
        context.moveTo(2, 2);
        context.lineTo(22, -8);
        context.lineTo(22, -12);
        context.lineTo(18, -12);
        context.lineTo(2, -2);
        context.closePath();
        context.stroke();
        context.fill();

        // cockpit 
        context.beginPath();
        context.moveTo(22, -12);
        context.lineTo(18, -12);
        context.lineTo(19, -16);
        context.lineTo(21, -16);
        context.closePath();
        context.stroke();
        context.fill();

        // Gun port
        context.beginPath();
        context.arc(0, 0, 6, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // Body port
        context.beginPath();
        context.arc(0, -4, 2, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // Body port
        context.beginPath();
        context.arc(0, 12, 2, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // Body port
        context.beginPath();
        context.arc(8, 10, 2, 0, 2 * Math.PI);
        context.stroke();
        context.fill();

        // Body port
        context.beginPath();
        context.arc(-8, 10, 2, 0, 2 * Math.PI);
        context.stroke();
        context.fill();




        context.restore();
    }
}