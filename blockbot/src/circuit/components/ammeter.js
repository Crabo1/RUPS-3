import { Component } from './component.js';

class Ammeter extends Component {
    constructor(id, start, end) {
        super(id, 'ammeter', start, end, 'src/components/ammeter.png', false);
        this.resistance = 0.01; // 0.01Ω - zelo nizek upor za merjenje toka
        this.measurement = 0; // Izmerjen tok v amperih
        this.is_connected = false;
        this.debug_color = 0x00cc66;
    }

    update(current) {
        // Posodobi izmerjeni tok
        this.measurement = Math.abs(current) || 0;
        
        // Pretvori v mA če je majhen
        if (this.measurement < 0.001) {
            this.measurement = Math.round(this.measurement * 1000000) / 1000; // µA v mA
        } else {
            this.measurement = Math.round(this.measurement * 1000) / 1000; // Zaokroži na 3 decimalke
        }
        
        return this.measurement;
    }

    getDisplayValue() {
        if (!this.is_connected) return '-- A';
        
        if (this.measurement < 0.001) {
            return `${(this.measurement * 1000).toFixed(2)} mA`; // Prikaži v mA
        } else {
            return `${this.measurement.toFixed(3)} A`;
        }
    }

    getTooltip() {
        return `Ampermeter:\nMeri električni tok\nNizek upornost: ${this.resistance} Ω\nTrenutno: ${this.getDisplayValue()}`;
    }

    setConnected(connected) {
        this.is_connected = connected;
        if (!connected) {
            this.measurement = 0;
        }
    }
}

export { Ammeter };