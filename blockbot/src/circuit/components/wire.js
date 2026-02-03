import { Node } from '../logic/node.js';
import { Component } from './component.js';

class Wire extends Component{
    constructor(id, start, end, path = []) {
        super(id, 'wire', start, end, 'src/components/wire.svg', true);
        this.resistance = 1;  // 1Ω - realistična vrednost za izobraževanje
        this.is_connected = false;
        this.debug_color = 0x0000ff;
    }
}

export { Wire };