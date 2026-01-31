import Phaser from 'phaser';
import { CircuitGraph } from '../logic/circuit_graph.js';
import { Battery } from '../components/battery.js';
import { Component } from '../components/component.js';
import { Node } from '../logic/node.js';
import { Wire } from '../components/wire.js';

export default class TestScene extends Phaser.Scene {
    constructor() {
        super('TestScene');
    }
    
    create() {

        const graph = new CircuitGraph();

        const battery = new Battery('bat1', 9);
        graph.addNode(battery.nodes[0]);
        graph.addNode(battery.nodes[1]);

        const bulb = new Component('bulb1', 'bulb', [
            new Node('bulb1_a', {x: 0, y: 0}),
            new Node('bulb1_b', {x: 40, y: 0})
        ]);
        graph.addNode(bulb.nodes[0]);
        graph.addNode(bulb.nodes[1]);

        console.log('battery.pos connected_wires:', battery.nodes[0].connected_wires);
        console.log('battery.neg connected_wires:', battery.nodes[1].connected_wires);
        console.log('bulb.a connected_wires:', bulb.nodes[0].connected_wires);
        console.log('bulb.b connected_wires:', bulb.nodes[1].connected_wires);


        const wire1 = new Wire(battery.nodes[0], bulb.nodes[0]);
        const wire2 = new Wire(bulb.nodes[1], battery.nodes[1]);

        graph.addWire(wire1);
        graph.addWire(wire2);

        console.log(battery.nodes[0] === wire1.start); // should be true
        console.log(battery.nodes[1] === wire2.end);   // should be true


        console.log(graph.isConnected(battery.nodes[0], battery.nodes[1])); // true

        this.add.text(300, 250, 'Dobrodošel v laboratoriju!', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#222'
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.start('MenuScene');
        });
    }
}