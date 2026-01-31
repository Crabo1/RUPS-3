class CurrentFlowAnimation {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.labels = [];
  }

  start(result, placedComponents, graph) {
    this.stop();
    if (!result.closed) return;

    const nodeVoltages = result.nodeVoltages;
    const componentCurrents = result.componentCurrents;
    const componentVoltages = result.componentVoltages;
    if (!nodeVoltages || !componentVoltages) return;

    const flowDirections = new Map();
    const componentSequence = new Map();
    let sequenceNumber = 0;

    for (const comp of graph.components) {
      const current = componentCurrents.get(comp.id) || 0;
      if (Math.abs(current) < 0.001) continue;

      let fromX, fromY, toX, toY;

      if (current > 0) {
        fromX = comp.start.x;
        fromY = comp.start.y;
        toX = comp.end.x;
        toY = comp.end.y;
      } else {
        fromX = comp.end.x;
        fromY = comp.end.y;
        toX = comp.start.x;
        toY = comp.start.y;
      }

      const Vinfo = componentVoltages.get(comp.id) || { start: 0, end: 0 };

      flowDirections.set(comp.id, {
        fromX,
        fromY,
        toX,
        toY,
        current: Math.abs(current),
        startV: Vinfo.start,
        endV: Vinfo.end
      });

      componentSequence.set(comp.id, sequenceNumber++);
    }

    const baseSpeed = 1500;

    for (const placedComp of placedComponents) {
      const logicComp = placedComp.getData('logicComponent');
      if (!logicComp) continue;
      if (!graph.componentConducts(logicComp)) continue;

      const direction = flowDirections.get(logicComp.id);
      if (!direction) continue;

      const { fromX, fromY, toX, toY, current } = direction;
      if (current < 0.001) continue;

      const speedMultiplier = Math.max(0.3,  0.066 / current);
      const speed = baseSpeed * speedMultiplier;

      const seq = componentSequence.get(logicComp.id);
      // if (seq !== undefined && logicComp.type !== 'wire') {
      //   const Vinfo = componentVoltages.get(logicComp.id);
      //   const voltageDrop = Vinfo ? Math.abs(Vinfo.end - Vinfo.start) : 0;
      //   const power = current * voltageDrop;

      //   let labelText;
      //   if (logicComp.type === 'bulb' || logicComp.type === 'resistor') {
      //     labelText = `${current.toFixed(3)}A\n${voltageDrop.toFixed(2)}V\n${power.toFixed(3)}W`;
      //   } else if (logicComp.type === 'battery') {
      //     labelText = `${current.toFixed(3)}A\n${(logicComp.voltage || 9).toFixed(1)}V`;
      //   } else {
      //     labelText = `${current.toFixed(3)}A\n${voltageDrop.toFixed(2)}V`;
      //   }

      //   const label = this.scene.add.text(
      //     placedComp.x,
      //     placedComp.y - 50,
      //     labelText,
      //     {
      //       fontSize: "11px",
      //       fontStyle: "bold",
      //       color: "#ffffff",
      //       backgroundColor: "#000000aa",
      //       padding: { x: 4, y: 2 },
      //       align: "center"
      //     }
      //   ).setOrigin(0.5).setDepth(300);

      //   this.labels.push(label);
      // }

      const dot = this.scene.add.circle(
        fromX,
        fromY,
        4,
        0x00ffff,
        0.8
      ).setDepth(150);

      dot.setData("fromX", fromX);
      dot.setData("fromY", fromY);

      this.scene.tweens.add({
        targets: dot,
        x: toX,
        y: toY,
        duration: speed,
        repeat: -1,
        onRepeat: () => {
          dot.x = dot.getData("fromX");
          dot.y = dot.getData("fromY");
        }
      });

      this.particles.push(dot);
    }
  }

  stop() {
    for (const particle of this.particles) {
      this.scene.tweens.killTweensOf(particle);
      particle.destroy();
    }
    this.particles = [];

    for (const label of this.labels) {
      label.destroy();
    }
    this.labels = [];
  }
}

export { CurrentFlowAnimation };