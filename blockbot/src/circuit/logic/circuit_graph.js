class CircuitGraph {
    constructor() {
        this.nodes = new Map();
        this.components = [];
        this.MERGE_RADIUS = 25;

        this.lastSimulation = null;
    }

    addNode(node) {
        if (!node) return null;

        if (!node.connected) node.connected = new Set();

        // Združi vozlišča, če so znotraj MERGE_RADIUS
        for (const existingNode of this.nodes.values()) {
            const dx = existingNode.x - node.x;
            const dy = existingNode.y - node.y;
            const distance = Math.hypot(dx, dy);

            if (distance < this.MERGE_RADIUS) {
                existingNode.connected.add(node);
                node.connected.add(existingNode);
                return existingNode;
            }
        }

        this.nodes.set(node.id, node);
        return node;
    }

    addComponent(component) {
        if (!component || !component.start || !component.end) return;

        // Dodaj ali združi vozlišča komponente
        component.start = this.addNode(component.start);
        component.end = this.addNode(component.end);

        // Poveži vozlišča med seboj
        component.start.connected.add(component.end);
        component.end.connected.add(component.start);

        this.components.push(component);
    }

    getConnections(node) {
        // Vrni komponente, povezane z danim vozliščem
        return this.components.filter(comp =>
            this.sameNode(comp.start, node) ||
            this.sameNode(comp.end, node)
        );
    }

    componentConducts(comp) {
        if (!comp) return false;
        if (comp.type === 'switch') return comp.is_on;
        if (comp.type === 'bulb' && comp.burnedOut) return false;
        const conductiveTypes = ['wire', 'bulb', 'resistor', 'battery', 'switch', 'voltmeter', 'ammeter'];
        return conductiveTypes.includes(comp.type);
    }

    sameNode(a, b) {
        return a && b && a.x === b.x && a.y === b.y;
    }

    nodeKey(node) {
        return `${node.x},${node.y}`;
    }

    getOtherNode(component, node) {
        if (this.sameNode(component.start, node)) return component.end;
        return component.start;
    }

    getComponentResistance(comp) {
        // Vrni upor komponente (Infinity za odprto vezje)
        if (!comp) return Infinity;
        if (comp.type === 'switch' && !comp.is_on) return Infinity;
        if (comp.type === 'bulb' && comp.burnedOut) return Infinity;

        switch (comp.type) {
            case 'wire': return comp.resistance || 1;
            case 'bulb': return comp.resistance || 100;
            case 'resistor': return comp.ohm || 220;
            case 'switch': return comp.resistance || 0.5;
            case 'battery': return comp.internalResistance || 0;
            case 'voltmeter': return comp.resistance || 1000000; // Visok upor
            case 'ammeter': return comp.resistance || 0.01; // Nizek upor
            default: return 10;
        }
    }

    // Pripomoček: reševanje linearnega sistema Ax = b z Gaussovo eliminacijo
    static solveLinearSystem(A, b) {
        const n = A.length;
        // Ustvari razširjeno matriko [A|b]
        const M = new Array(n);
        for (let i = 0; i < n; i++) {
            M[i] = new Array(n + 1);
            for (let j = 0; j < n; j++) {
                M[i][j] = A[i][j];
            }
            M[i][n] = b[i];
        }

        // Eliminacija naprej in pivotiranje
        for (let k = 0; k < n; k++) {
            // Delno pivotiranje
            let maxRow = k;
            let maxVal = Math.abs(M[k][k]);
            for (let i = k + 1; i < n; i++) {
                const val = Math.abs(M[i][k]);
                if (val > maxVal) {
                    maxVal = val;
                    maxRow = i;
                }
            }
            if (maxVal === 0 || maxVal < 1e-15) {
                // Singularna matrika
                return null;
            }

            // Zamenjaj vrstice
            if (maxRow !== k) {
                const tmp = M[k];
                M[k] = M[maxRow];
                M[maxRow] = tmp;
            }

            // Normalizacija in eliminacija
            for (let i = k + 1; i < n; i++) {
                const factor = M[i][k] / M[k][k];
                for (let j = k; j <= n; j++) {
                    M[i][j] -= factor * M[k][j];
                }
            }
        }

        // Vračajoča substitucija
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            let sum = M[i][n];
            for (let j = i + 1; j < n; j++) {
                sum -= M[i][j] * x[j];
            }
            x[i] = sum / M[i][i];
        }
        return x;
    }

    // MODIFICIRANA VOZLIŠČNA ANALIZA (MNA)
    solveCircuit() {
        // 0. FIRST: Find all components that are actually connected to batteries
        const connectedComponents = new Set();
        const visitedNodes = new Set();

        // Start DFS from battery nodes
        const batteries = this.components.filter(c => c.type === 'battery');
        const stack = [];

        for (const battery of batteries) {
            stack.push(battery.start);
            stack.push(battery.end);
            connectedComponents.add(battery);
        }

        // DFS to find all connected components
        while (stack.length > 0) {
            const node = stack.pop();
            const nodeKey = this.nodeKey(node);

            if (visitedNodes.has(nodeKey)) continue;
            visitedNodes.add(nodeKey);

            const connectedComps = this.getConnections(node);
            for (const comp of connectedComps) {
                if (this.componentConducts(comp)) {
                    connectedComponents.add(comp);
                    const otherNode = this.sameNode(comp.start, node) ? comp.end : comp.start;
                    const otherKey = this.nodeKey(otherNode);
                    if (!visitedNodes.has(otherKey)) {
                        stack.push(otherNode);
                    }
                }
            }
        }

        // Only use connected components for MNA
        const activeComponents = Array.from(connectedComponents);

        if (activeComponents.length === 0) {
            console.log("No connected active components found");
            return null;
        }

        // 1. Zgradi seznam edinstvenih vozlišč IZ AKTIVNIH KOMPONENT
        const nodePositions = new Map();
        const nodeList = [];

        for (const comp of activeComponents) { // Changed from this.components
            if (!this.componentConducts(comp) && comp.type !== 'battery') continue;

            const startKey = this.nodeKey(comp.start);
            const endKey = this.nodeKey(comp.end);

            if (!nodePositions.has(startKey)) {
                nodePositions.set(startKey, nodeList.length);
                nodeList.push({
                    x: comp.start.x,
                    y: comp.start.y,
                    key: startKey,
                    node: comp.start
                });
            }
            if (!nodePositions.has(endKey)) {
                nodePositions.set(endKey, nodeList.length);
                nodeList.push({
                    x: comp.end.x,
                    y: comp.end.y,
                    key: endKey,
                    node: comp.end
                });
            }
        }

        const N = nodeList.length;
        if (N < 1) {
            console.log("No nodes found in active components");
            return null;
        }

        // Izberi prvo vozlišče kot referenčno (ozemljitveno = 0 V)
        const groundIndex = 0;

        // 2. Zberi napetostne vire (baterije)
        const voltageSources = [];
        for (const comp of activeComponents) { // Changed from this.components
            if (comp.type === 'battery') {
                // Pozitivni pol je comp.end, negativni pol je comp.start
                voltageSources.push({
                    comp,
                    posKey: this.nodeKey(comp.end),
                    negKey: this.nodeKey(comp.start),
                    voltage: comp.voltage || 0
                });
            }
        }
        const M = voltageSources.length; // Število napetostnih virov

        if (M === 0) {
            console.log("No batteries found in connected circuit");
            return null;
        }

        const nv = Math.max(0, N - 1); // Število neznanih napetosti vozlišč (brez referenčnega)
        const unknowns = nv + M; // Skupno število neznank [Vozlišča] + [Tokovi virov]

        if (unknowns === 0) {
            console.log("No unknowns to solve");
            return null;
        }

        // Preslikava indeksa vozlišča -> indeksa spremenljivke MNA (-1, če je referenčno)
        const nodeIndexToVar = new Array(N).fill(-1);
        let varCounter = 0;
        for (let i = 0; i < N; i++) {
            if (i === groundIndex) {
                nodeIndexToVar[i] = -1;
            } else {
                nodeIndexToVar[i] = varCounter++;
            }
        }

        // Inicializacija matrike MNA (A) in desne strani (z)
        const A = new Array(unknowns);
        const z = new Array(unknowns).fill(0);
        for (let i = 0; i < unknowns; i++) {
            A[i] = new Array(unknowns).fill(0);
        }

        // 3. Vstavljanje prevodnosti za uporovne komponente
        for (const comp of activeComponents) { // Changed from this.components
            if (!this.componentConducts(comp) && comp.type !== 'battery') continue;

            const R = this.getComponentResistance(comp);
            if (!isFinite(R) || R === 0) continue;

            const startKey = this.nodeKey(comp.start);
            const endKey = this.nodeKey(comp.end);
            const iNode = nodePositions.get(startKey);
            const jNode = nodePositions.get(endKey);

            if (iNode === undefined || jNode === undefined) continue;

            const g = 1 / R; // Prevodnost

            const vi = nodeIndexToVar[iNode];
            const vj = nodeIndexToVar[jNode];

            // Vstavljanje: G matrika (Kirchhoffov zakon za tok)
            if (vi !== -1) A[vi][vi] += g;
            if (vj !== -1) A[vj][vj] += g;
            if (vi !== -1 && vj !== -1) {
                A[vi][vj] -= g;
                A[vj][vi] -= g;
            }
        }

        // 4. Vstavljanje napetostnih virov (baterij)
        for (let k = 0; k < M; k++) {
            const vs = voltageSources[k];
            const posIndex = nodePositions.get(vs.posKey);
            const negIndex = nodePositions.get(vs.negKey);

            if (posIndex === undefined || negIndex === undefined) continue;

            const col = nv + k; // Stolpec za tok I_k

            // Enačbe vozlišč (vrstice 0..nv-1): B matrika
            if (posIndex !== undefined) {
                const r = nodeIndexToVar[posIndex];
                if (r !== -1) A[r][col] += 1;
            }
            if (negIndex !== undefined) {
                const r = nodeIndexToVar[negIndex];
                if (r !== -1) A[r][col] -= 1;
            }

            // Enačba napetostnega vira (vrstica nv+k): C matrika (transponirana B)
            const row = nv + k;
            // V_pos - V_neg = V_vir
            if (posIndex !== undefined) {
                const c = nodeIndexToVar[posIndex];
                if (c !== -1) A[row][c] += 1;
            }
            if (negIndex !== undefined) {
                const c = nodeIndexToVar[negIndex];
                if (c !== -1) A[row][c] -= 1;
            }

            // Desna stran (RHS)
            z[row] = vs.voltage;
        }

        // 5. Reši linearni sistem
        const x = CircuitGraph.solveLinearSystem(A, z);
        if (!x) {
            console.log("Reševanje MNA ni uspelo");
            return null;
        }

        // 6. Ekstrahiraj napetosti vozlišč
        const voltages = new Array(N).fill(0);
        for (let i = 0; i < N; i++) {
            const vi = nodeIndexToVar[i];
            voltages[i] = vi === -1 ? 0 : x[vi];
        }

        // Ekstrahiraj tokove virov
        const vsCurrents = new Array(M).fill(0);
        for (let k = 0; k < M; k++) {
            vsCurrents[k] = x[nv + k]; // Tok od pozitivnega (end) k negativnemu (start)
        }

        // 7. Izračunaj tokove in napetosti komponent
        const componentCurrents = new Map();
        const componentVoltages = new Map();

        for (const comp of activeComponents) { // Changed from this.components
            const startKey = this.nodeKey(comp.start);
            const endKey = this.nodeKey(comp.end);
            const iNode = nodePositions.get(startKey);
            const jNode = nodePositions.get(endKey);

            if (iNode === undefined || jNode === undefined) continue;

            const vStart = voltages[iNode];
            const vEnd = voltages[jNode];
            const voltageDiff = vEnd - vStart; // V_end - V_start

            let current = 0;

            if (comp.type === 'battery') {
                const vsIndex = voltageSources.findIndex(vs => vs.comp === comp);
                if (vsIndex !== -1) {
                    current = vsCurrents[vsIndex];
                    // Pretvorba v konvencijo: tok od start -> end
                    current = -current;
                } else {
                    current = 0;
                }
            } else {
                const R = this.getComponentResistance(comp);
                if (!isFinite(R) || R === 0) {
                    current = 0;
                } else {
                    current = (vStart - vEnd) / R; // Tok od start -> end (Ohmov zakon)
                }
            }

            componentCurrents.set(comp.id, current);
            componentVoltages.set(comp.id, { start: vStart, end: vEnd, diff: voltageDiff });
        }

        const nodeVoltages = new Map();
        for (let i = 0; i < N; i++) {
            nodeVoltages.set(nodeList[i].key, voltages[i]);
        }

        return {
            nodeVoltages,
            componentCurrents,
            componentVoltages,
            nodeList,
            nodePositions,
            voltageSourceCurrents: vsCurrents,
            voltageSources,
            activeComponents: activeComponents
        };
    }


    simulate() {
        this.lastSimulation = null;

        const battery = this.components.find(c => c.type === 'battery');
        if (!battery) {
            console.log("Baterija ni najdena.");
            return {
                status: -1,
                message: "Baterija ni najdena",
                closed: false
            };
        }

        // Preveri, ali so vsa stikala zaprta
        const switches = this.components.filter(c => c.type === 'switch');
        for (const s of switches) {
            if (!s.is_on) {
                console.log(`Stikalo ${s.id} je ODPIRTO`);
                return {
                    status: -2,
                    message: `Stikalo ${s.id} je ODPIRTO`,
                    closed: false,
                    openSwitch: s.id
                };
            }
        }

        const primaryBattery = this.components.find(c => c.type === 'battery');
        if (!primaryBattery) {
            return {
                status: -1,
                message: "Baterija ni najdena",
                closed: false
            };
        }

        // Preveri, ali obstaja zaprta zanka
        const hasPath = this.findClosedLoopPath(primaryBattery.start, primaryBattery.end);
        if (!hasPath) {
            console.log("Vezje odprto. Tok ne teče.");

            // Posodobi stanje žarnic na IZKLOPLJENO
            const bulbs = this.components.filter(c => c.type === 'bulb');
            bulbs.forEach(b => {
                if (typeof b.update === 'function') {
                    b.update(0);
                } else {
                    b.is_on = false;
                }
            });

            return {
                status: 0,
                message: "Vezje odprto. Tok ne teče.",
                closed: false
            };
        }

        // Reši vezje z MNA - nova verzija bo ignorirala nepovezane komponente
        console.log("Vezje zaprto! Reševanje z MNA...");
        const solution = this.solveCircuit();

        if (!solution) {
            console.log("Reševanje vezja ni uspelo");
            return {
                status: 0,
                message: "Reševanje vezja ni uspelo",
                closed: false
            };
        }

        // Določi rezultate in posodobi komponente
        console.log('\n=== MNA Rešitev ===');
        console.log('Napetosti vozlišč:');
        for (const [key, voltage] of solution.nodeVoltages) {
            console.log(`  ${key}: ${voltage.toFixed(6)} V`);
        }

        console.log('\nTokovi komponent:');
        let totalCurrent = 0;
        const componentDetails = [];

        // Use only active components from solution
        const activeComponents = solution.activeComponents || this.components;

        for (const comp of activeComponents) {
            const current = solution.componentCurrents.get(comp.id) || 0;
            const voltageInfo = solution.componentVoltages.get(comp.id);

            if (comp.type === 'battery') {
                totalCurrent += Math.abs(current);
            }

            console.log(`  ${comp.type} (${comp.id}): ${(current * 1000).toFixed(4)} mA, ${voltageInfo ? voltageInfo.diff.toFixed(6) : 0} V padec`);

            // Posodobi stanje komponente (npr. svetlost žarnice)
            if (comp.type === 'bulb' && typeof comp.update === 'function') {
                comp.update(Math.abs(current));
            }

            componentDetails.push({
                id: comp.id,
                type: comp.type,
                current: current,
                voltage: voltageInfo ? voltageInfo.diff : 0,
                startVoltage: voltageInfo ? voltageInfo.start : 0,
                endVoltage: voltageInfo ? voltageInfo.end : 0
            });
        }

        console.log(`\nSkupni tok: ${(totalCurrent * 1000).toFixed(4)} mA`);
        console.log('==========================\n');

        this.lastSimulation = {
            status: 1,
            message: "Vezje rešeno z MNA",
            closed: true,
            current: totalCurrent,
            totalVoltage: activeComponents.filter(c => c.type === 'battery').length === 1 ? (activeComponents.find(c => c.type === 'battery').voltage || 0) : undefined,
            nodeVoltages: solution.nodeVoltages,
            componentCurrents: solution.componentCurrents,
            componentVoltages: solution.componentVoltages,
            componentDetails
        };

        return this.lastSimulation;
    }

    // Uporabljeno za preverjanje, ali je vezje sklenjeno (zaprt krog)
    findClosedLoopPath(current, target, visitedComps = new Set(), path = []) {
        if (!current || !target) return null;

        // Najdena zaprta zanka
        if (this.sameNode(current, target) && path.length > 0) {
            return [...path];
        }

        for (const comp of this.getConnections(current)) {
            if (!this.componentConducts(comp) || visitedComps.has(comp)) continue;

            visitedComps.add(comp);
            path.push(comp);

            let next = this.sameNode(comp.start, current) ? comp.end : comp.start;
            if (!next) {
                path.pop();
                visitedComps.delete(comp);
                continue;
            }

            // Izogibaj se kratkim zankam
            if (this.sameNode(next, target) && path.length < 2) {
                path.pop();
                visitedComps.delete(comp);
                continue;
            }

            const result = this.findClosedLoopPath(next, target, visitedComps, path);
            if (result) {
                return result;
            }

            path.pop();
            visitedComps.delete(comp);
        }

        return null;
    }

    getSimulationResults() {
        return this.lastSimulation;
    }
}

export { CircuitGraph };