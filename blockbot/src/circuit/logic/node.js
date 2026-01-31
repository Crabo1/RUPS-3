class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.connected = new Set();
        this.bit_value = 0;
    }

    // addConnection(node, wire) {
    //     this.connected.set(node.id, { node: node, wire: wire });
    //     node.connected.set(this.id, { node: this, wire: wire });
    // }

    // removeConnection(node) {
    //     this.connected.delete(node.id);
    //     node.connected.delete(this.id);
    // }
}

export { Node };