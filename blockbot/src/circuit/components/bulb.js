import { Component } from './component.js';

class Bulb extends Component {
    constructor(id, start, end, resistance = 100) {
        super(id, 'bulb', start, end, 'src/components/lamp.png', false);
        this.resistance = resistance;      // 100Ω - tipična majhna žarnica
        this.is_on = false;
        this.brightness = 0;               // 0-100%
        this.minCurrent = 0.001;           // A - ne sveti pod 1mA
        this.maxCurrent = 0.2;             // A - zgori nad 200mA
        this.burnedOut = false;
    }

    update(current) {
        if (this.burnedOut) {
            this.is_on = false;
            this.brightness = 0;
            return;
        }
        
        if (current > this.maxCurrent) {
            this.burnOut();
        } else if (current < this.minCurrent) {
            this.is_on = false;
            this.brightness = 0;
        } else {
            this.is_on = true;
            // Brightness scales with current
            this.brightness = Math.min(100, (current / this.maxCurrent) * 100);
        }
    }

    burnOut() {
        this.burnedOut = true;
        this.is_on = false;
        this.brightness = 0;
        console.log(`Bulb ${this.id} burned out!`);
    }

    reset() {
        this.burnedOut = false;
        this.is_on = false;
        this.brightness = 0;
    }

    turnOn() {
        if (!this.burnedOut) {
            this.is_on = true;
            console.log(`Bulb ${this.id} is now ON.`);
        }
    }

    turnOff() {
        this.is_on = false;
        this.brightness = 0;
        console.log(`Bulb ${this.id} is now OFF.`);
    }
}

export { Bulb };