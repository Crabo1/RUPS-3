import { Component } from "./component";

class Resistor extends Component{
    constructor(id, start, end, ohm) {
        super(id, 'resistor', start, end, 'src/components/resistor.png', true);
        this.ohm = ohm
    }
}

export {Resistor}