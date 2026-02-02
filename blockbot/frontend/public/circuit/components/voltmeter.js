import { Component } from './component.js';

class Voltmeter extends Component {
    constructor(id, start, end) {
        super(id, 'voltmeter', start, end, 'src/components/voltmeter.png', false);
        this.resistance = 1000000; // 1MΩ - visok upor za merjenje napetosti
        this.measurement = 0; // Izmerjena napetost v voltih
        this.is_connected = false;
        this.debug_color = 0x00cc66;
    }

    update(voltage) {
        // Posodobi izmerjeno napetost
        this.measurement = Math.abs(voltage) || 0;
        
        // Zaokroži na 3 decimalna mesta
        this.measurement = Math.round(this.measurement * 1000) / 1000;
        
        return this.measurement;
    }

    getDisplayValue() {
        if (this.is_connected) {
            return `${this.measurement.toFixed(2)} V`;
        }
        return '-- V';
    }

    getTooltip() {
        return `Voltmete:\nMeri napetost med točkama\nVisok upornost: ${this.resistance} Ω\nTrenutno: ${this.getDisplayValue()}`;
    }

    setConnected(connected) {
        this.is_connected = connected;
        if (!connected) {
            this.measurement = 0;
        }
    }
}

export { Voltmeter };