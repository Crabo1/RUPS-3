import { Node } from '../logic/node.js';

class Component {
    constructor(id, type, start, end, image, isVoltageSource = false) {
        console.log(`Creating component: ${id} of type ${type} between ${start.id} and ${end.id}`);
        this.id = id;
        this.type = type;
        this.start = start;
        this.end = end;
        this.isVoltageSource = isVoltageSource;
        this.image = image
        this.debug_color = 0xff0000
        this.measurement = 0;
        this.hasMeasurement = false;
    }

    conducts() {
        // Placeholder for component-specific conduction logic
        return true;
    }

    update(measurement) {
        // Base implementation - override in subclasses
        this.measurement = measurement;
        this.hasMeasurement = true;
        return this.measurement;
    }

    getDisplayValue() {
        // Base implementation - override in subclasses
        return '';
    }

    getTooltip() {
        // Base implementation - override in subclasses
        return `Component: ${this.type}`;
    }
}

export { Component };