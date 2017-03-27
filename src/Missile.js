import Particle from './Particle';
import { rotatePoint, asteroidVertices, randomNumBetween } from './helpers';

export default class Missile {
  constructor(args) {
    let posDelta = rotatePoint({x:0, y:-20}, {x:0,y:0}, args.ship.rotation * Math.PI / 180);
    this.position = {
      x: args.ship.position.x + posDelta.x,
      y: args.ship.position.y + posDelta.y
    };
    this.rotation = args.ship.rotation;
    this.velocity = {
      x:posDelta.x / 2,
      y:posDelta.y / 2
    };
    this.radius = 2;
    this.creationTime = Date.now();
    this.create = args.ship.create;
  }

  createParticle() {
    for (let i = 0; i < this.radius; i++) {
      const particle = new Particle({
        lifeSpan: randomNumBetween(60, 100),
        size: randomNumBetween(1, 3),
        position: {
          x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
          y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
        },
        velocity: {
          x: randomNumBetween(-1.5, 1.5),
          y: randomNumBetween(-1.5, 1.5)
        }
      });
      this.create(particle, 'particles');
    }
  }

  destroy(){
    this.createParticle();
    this.delete = true;
  }

  render(state){
    // Move
    var lifetime = 1000 - (Date.now() - this.creationTime);
    if(lifetime < 0){
      this.destroy();
    } else {
      var speed = 15;
      var target = {
          x: state.asteroids[0].position.x - this.position.x,
          y: state.asteroids[0].position.y - this.position.y
      };

      this.rotation = Math.atan2(target.y, target.x) * 180 / Math.PI;

      var vx = speed * (90 - Math.abs(this.rotation)) / 90;
      var vy = this.rotation < 0 ? -speed + Math.abs(vx) : speed - Math.abs(vx);
      

      this.position.x += vx;
      this.position.y += vy;
      this.createParticle();
    }

    // Screen edges
    if(this.position.x > state.screen.width) this.position.x = 0;
    else if(this.position.x < 0) this.position.x = state.screen.width;
    if(this.position.y > state.screen.height) this.position.y = 0;
    else if(this.position.y < 0) this.position.y = state.screen.height;

    // Draw
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.fillStyle = '#FFF';
    context.lineWidth = 0,5;
    context.beginPath();
    context.arc(0, 0, 2, 0, 2 * Math.PI);
    context.closePath();
    context.fill();
    context.restore();
  }
}
