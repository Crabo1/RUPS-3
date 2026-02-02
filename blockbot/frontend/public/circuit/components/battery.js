import { Node } from '../logic/node.js';
import { Component } from './component.js';

class Battery extends Component {
    constructor(id, start, end, voltage) {
        super(id, 'battery', start, end, 'src/components/battery.png', true);
        this.voltage = voltage;
        this.debug_color = 0x00ff00;
    }
}

export { Battery };