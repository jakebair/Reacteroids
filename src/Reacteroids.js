import React, { Component } from 'react';
import Ship from './Ship';
import Asteroid from './Asteroid';
import TieFigher from './TieFighter';
import { randomNumBetweenExcluding } from './helpers';

const KEY = {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    A: 65,
    D: 68,
    W: 87,
    SPACE: 32,
    CTRL: 17
};

export class Reacteroids extends Component {
    constructor() {
        super();
        this.state = {
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1,
            },
            context: null,
            keys: {
                left: 0,
                right: 0,
                up: 0,
                down: 0,
                space: 0,
                alt: 0
            },
            asteroidCount: 3,
            asteroids: [],
            fighterCount: 3,
            fighters: [],
            missiles: [],
            currentScore: 0,
            topScore: localStorage['topscore'] || 0,
            inGame: false
        }
        this.ship = [];
        this.asteroids = [];
        this.fighters = [];
        this.bullets = [];
        this.missiles = [];
        this.particles = [];
    }

    handleResize(value, e) {
        this.setState({
            screen: {
                width: window.innerWidth,
                height: window.innerHeight,
                ratio: window.devicePixelRatio || 1,
            }
        });
    }

    handleKeys(value, e) {
        let keys = this.state.keys;
        if (e.keyCode === KEY.LEFT || e.keyCode === KEY.A) keys.left = value;
        if (e.keyCode === KEY.RIGHT || e.keyCode === KEY.D) keys.right = value;
        if (e.keyCode === KEY.UP || e.keyCode === KEY.W) keys.up = value;
        if (e.keyCode === KEY.SPACE) keys.space = value;
        if (e.keyCode === KEY.CTRL) keys.ctrl = value;
        this.setState({
            keys: keys
        });
    }

    componentDidMount() {
        window.addEventListener('keyup', this.handleKeys.bind(this, false));
        window.addEventListener('keydown', this.handleKeys.bind(this, true));
        window.addEventListener('resize', this.handleResize.bind(this, false));

        const context = this.refs.canvas.getContext('2d');
        this.setState({ context: context });
        this.startGame();
        requestAnimationFrame(() => { this.update() });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleKeys);
        window.removeEventListener('resize', this.handleKeys);
        window.removeEventListener('resize', this.handleResize);
    }

    update() {
        const context = this.state.context;
        const keys = this.state.keys;
        const ship = this.ship[0];

        context.save();
        context.scale(this.state.screen.ratio, this.state.screen.ratio);

        // Motion trail
        context.fillStyle = '#000';
        context.globalAlpha = 0.4;
        context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
        context.globalAlpha = 1;

        // Next set of asteroids
        if (!this.asteroids.length) {
            let count = this.state.asteroidCount + 1;
            this.setState({ asteroidCount: count });
            this.generateAsteroids(count)
        }

        // Next set of fighters
        if (!this.fighters.length) {
            let count = this.state.fighterCount + 1;
            this.setState({ fighterCount: count });
            this.generateFighters(count)
        }

        // Check for colisions
        this.checkCollisionsWith(this.bullets, this.asteroids);
        this.checkCollisionsWith(this.missiles, this.asteroids);

        this.checkCollisionsWith(this.bullets, this.fighters);
        this.checkCollisionsWith(this.missiles, this.fighters);

        // this.checkCollisionsWith(this.asteroids, this.asteroids);
        // this.checkCollisionsWith(this.fighters, this.fighters);
        this.checkCollisionsWith(this.asteroids, this.fighters);

        // GOD Mode
        // this.checkCollisionsWith(this.ship, this.asteroids);

        if (this.missiles.length > 0) {
            this.orderByProximity(this.missiles[0].position, this.asteroids);
        }
        this.setState({ asteroids: this.asteroids, fighters: this.fighters, missiles: this.missiles });


        // Remove or render
        this.updateObjects(this.particles, 'particles')
        this.updateObjects(this.asteroids, 'asteroids')
        this.updateObjects(this.fighters, 'fighters')
        this.updateObjects(this.bullets, 'bullets')
        this.updateObjects(this.missiles, 'missiles')
        this.updateObjects(this.ship, 'ship')

        context.restore();

        // Next frame
        requestAnimationFrame(() => { this.update() });
    }

    orderByProximity(position, items) {
        function dist(l) {
            return Math.pow(l.position.x - position.x, 2) + Math.pow(l.position.y - position.y, 2);
        }

        items.sort(function(l1, l2) {
            return dist(l1) - dist(l2);
        });
    }

    addScore(points) {
        if (this.state.inGame) {
            this.setState({
                currentScore: this.state.currentScore + points,
            });
        }
    }

    startGame() {
        this.setState({
            inGame: true,
            currentScore: 0,
        });

        // Make ship
        let ship = new Ship({
            position: {
                x: this.state.screen.width / 2,
                y: this.state.screen.height / 2
            },
            create: this.createObject.bind(this),
            onDie: this.gameOver.bind(this)
        });
        this.createObject(ship, 'ship');

        // Make asteroids
        this.asteroids = [];
        this.generateAsteroids(this.state.asteroidCount)

        // Make tie fighters
        this.fighters = [];
        this.generateFighters(this.state.fighterCount)
    }

    gameOver() {
        this.setState({
            inGame: false,
        });

        // Replace top score
        if (this.state.currentScore > this.state.topScore) {
            this.setState({
                topScore: this.state.currentScore,
            });
            localStorage['topscore'] = this.state.currentScore;
        }
    }

    generateAsteroids(howMany) {
        let asteroids = [];
        let ship = this.ship[0];
        for (let i = 0; i < howMany; i++) {
            let asteroid = new Asteroid({
                size: 80,
                position: {
                    x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x - 60, ship.position.x + 60),
                    y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y - 60, ship.position.y + 60)
                },
                create: this.createObject.bind(this),
                addScore: this.addScore.bind(this)
            });
            this.createObject(asteroid, 'asteroids');
        }
    }

    generateFighters(howMany) {
        let asteroids = [];
        let ship = this.ship[0];
        for (let i = 0; i < howMany; i++) {
            let fighter = new TieFigher({
                size: 80,
                position: {
                    x: randomNumBetweenExcluding(0, this.state.screen.width, ship.position.x - 60, ship.position.x + 60),
                    y: randomNumBetweenExcluding(0, this.state.screen.height, ship.position.y - 60, ship.position.y + 60)
                },
                create: this.createObject.bind(this),
                addScore: this.addScore.bind(this)
            });
            this.createObject(fighter, 'fighters');
        }
    }

    createObject(item, group) {
        this[group].push(item);
    }

    updateObjects(items, group) {
        let index = 0;
        for (let item of items) {
            if (item.delete) {
                this[group].splice(index, 1);
            } else {
                items[index].render(this.state);
            }
            index++;
        }
    }

    checkCollisionsWith(items1, items2) {
        var a = items1.length - 1;
        var b;
        for (a; a > -1; --a) {
            b = items2.length - 1;
            for (b; b > -1; --b) {
                var item1 = items1[a];
                var item2 = items2[b];
                if (this.checkCollision(item1, item2)) {
                    item1.destroy();
                    item2.destroy();
                }
            }
        }
    }

    checkCollision(obj1, obj2) {
        var vx = obj1.position.x - obj2.position.x;
        var vy = obj1.position.y - obj2.position.y;
        var length = Math.sqrt(vx * vx + vy * vy);
        if (length < obj1.radius + obj2.radius) {
            return true;
        }
        return false;
    }

    render() {
        let endgame;
        let message;

        if (this.state.currentScore <= 0) {
            message = '0 points... So sad.';
        } else if (this.state.currentScore >= this.state.topScore) {
            message = 'Top score with ' + this.state.currentScore + ' points. Woo!';
        } else {
            message = this.state.currentScore + ' Points though :)'
        }

        if (!this.state.inGame) {
            endgame = ( <
                div className = "endgame" >
                <
                p > Game over, man! < /p> <
                p > { message } < /p> <
                button onClick = { this.startGame.bind(this) } >
                try again ?
                <
                /button> < /
                div >
            )
        }

        return ( <
            div > { endgame } <
            span className = "score current-score" > Score: { this.state.currentScore } < /span> <
            span className = "score top-score" > Top Score: { this.state.topScore } < /span> <
            span className = "controls" >
            Use[A][S][W][D] or[←][↑][↓][→] to MOVE < br / >
            Use[SPACE] to SHOOT <
            /span> <
            canvas ref = "canvas"
            width = { this.state.screen.width * this.state.screen.ratio }
            height = { this.state.screen.height * this.state.screen.ratio }
            /> < /
            div >
        );
    }
}