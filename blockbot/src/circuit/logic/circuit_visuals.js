class CircuitVisuals {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Update visuals for all placed components based on simulation result
   */
  updateComponentVisuals(result, placedComponents, graph) {
    if (!result) return;

    for (const placedComp of placedComponents) {
      const logicComp = placedComp.getData('logicComponent');
      if (!logicComp) continue;

      const type = placedComp.getData('type');

      if (type === 'svetilka') {
        this.updateBulbVisual(placedComp, logicComp, result);
      } else if (type === 'upor') {
        this.updateResistorVisual(placedComp, logicComp, result);
      } else if (type === 'voltmeter') {
        this.updateVoltmeterVisual(placedComp, logicComp, result);
      } else if (type === 'ampermeter') {
        this.updateAmmeterVisual(placedComp, logicComp, result);
      }
    }
  }

  /**
   * Update bulb visual - glow effect based on brightness
   */
  updateBulbVisual(placedComp, logicComp, result) {
    const image = placedComp.list.find(child => child.type === 'Image');
    if (!image) return;

    // ALWAYS hide text for bulbs - only show glow
    this.hideComponentValue(placedComp);

    if (result.closed && logicComp.is_on) {
      const brightness = logicComp.brightness || 50;

      // Calculate tint based on brightness (yellow glow)
      const glowIntensity = Math.floor((brightness / 100) * 255);
      const tint = Phaser.Display.Color.GetColor(255, 255, 128 + Math.floor(glowIntensity * 0.5));

      image.setTint(tint);

      // Add glow effect (no text)
      if (!placedComp.getData('glowEffect')) {
        const glow = this.scene.add.circle(placedComp.x, placedComp.y, 28, 0xffff00, 0.5);
        glow.setDepth(5);
        placedComp.setData('glowEffect', glow);
      }

      const glow = placedComp.getData('glowEffect');
      if (glow) {
        const alpha = 0.3 + (brightness / 100) * 0.5;
        glow.setAlpha(alpha);
        glow.setPosition(placedComp.x, placedComp.y);
        glow.setVisible(true);

        // Kill existing tweens before adding new
        this.scene.tweens.killTweensOf(glow);

        // Pulsing glow animation
        this.scene.tweens.add({
          targets: glow,
          alpha: { from: alpha * 0.6, to: alpha },
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }

    } else if (logicComp.burnedOut) {
      image.setTint(0x333333);
      this.removeGlowEffect(placedComp);

    } else {
      image.clearTint();
      this.removeGlowEffect(placedComp);
    }
  }

  /**
   * Update resistor visual - color based on heat/power
   */
  updateResistorVisual(placedComp, logicComp, result) {
    const image = placedComp.list.find(child => child.type === 'Image');
    if (!image) return;

    // Hide text for resistors
    this.hideComponentValue(placedComp);

    if (result.closed && result.componentDetails) {
      const detail = result.componentDetails.find(d => d.id === logicComp.id);
      if (detail) {
        const voltageDrop = Math.abs(detail.voltage || detail.voltageDrop || 0);
        const current = Math.abs(detail.current || 0);

        const power = current * voltageDrop;
        if (power > 0.5) {
          image.setTint(0xff6600); // Orange - hot
        } else if (power > 0.2) {
          image.setTint(0xffaa00); // Yellow-orange - warm
        } else {
          image.clearTint();
        }
      }
    } else {
      image.clearTint();
    }
  }

  updateVoltmeterVisual(placedComp, logicComp, result) {
    const image = placedComp.list.find(child => child.type === 'Image');
    if (!image) return;

    if (result && result.componentVoltages) {
      const voltageInfo = result.componentVoltages.get(logicComp.id);
      if (voltageInfo) {
        const voltageDrop = Math.abs(voltageInfo.diff);
        logicComp.update(voltageDrop);
        logicComp.setConnected(true);

        // SHOW TEXT ONLY FOR VOLTMETER
        this.showComponentValue(placedComp, logicComp.getDisplayValue());

        // Barva glede na napetost
        if (voltageDrop > 9) {
          image.setTint(0xff0000); // Rdeča - visoka napetost
        } else if (voltageDrop > 1) {
          image.setTint(0xffcc00); // Rumena - normalna napetost
        } else {
          image.clearTint();
        }
      } else {
        logicComp.setConnected(false);
        this.showComponentValue(placedComp, '-- V');
        image.clearTint();
      }
    } else {
      logicComp.setConnected(false);
      this.showComponentValue(placedComp, '-- V');
      image.clearTint();
    }
  }

  updateAmmeterVisual(placedComp, logicComp, result) {
    const image = placedComp.list.find(child => child.type === 'Image');
    if (!image) return;

    if (result && result.componentCurrents) {
      const current = result.componentCurrents.get(logicComp.id) || 0;
      logicComp.update(Math.abs(current));
      logicComp.setConnected(true);

      // SHOW TEXT ONLY FOR AMMETER
      this.showComponentValue(placedComp, logicComp.getDisplayValue());

      // Barva glede na tok
      const absCurrent = Math.abs(current);
      if (absCurrent > 0.5) {
        image.setTint(0xff0000); // Rdeča - prevelik tok
      } else if (absCurrent > 0.1) {
        image.setTint(0xffcc00); // Rumena - normalen tok
      } else {
        image.clearTint();
      }
    } else {
      logicComp.setConnected(false);
      this.showComponentValue(placedComp, '-- A');
      image.clearTint();
    }
  }

  /**
   * Show a value label above a component
   */
  showComponentValue(placedComp, value) {
    let valueText = placedComp.getData('valueText');

    if (!valueText) {
      valueText = this.scene.add.text(placedComp.x, placedComp.y - 30, value, {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(200);
      placedComp.setData('valueText', valueText);
    } else {
      valueText.setText(value);
      valueText.setPosition(placedComp.x, placedComp.y - 50);
      valueText.setVisible(true);
    }
  }

  /**
   * Hide value label for a component
   */
  hideComponentValue(placedComp) {
    const valueText = placedComp.getData('valueText');
    if (valueText) {
      valueText.setVisible(false);
    }
  }

  /**
   * Remove glow effect from a component
   */
  removeGlowEffect(placedComp) {
    const glow = placedComp.getData('glowEffect');
    if (glow) {
      this.scene.tweens.killTweensOf(glow);
      glow.destroy();
      placedComp.setData('glowEffect', null);
    }
  }

  /**
   * Reset all visual effects for placed components
   */
  resetAllVisuals(placedComponents) {
    for (const placedComp of placedComponents) {
      const type = placedComp.getData('type');

      // Don't hide values for meters during reset
      if (type !== 'voltmeter' && type !== 'ampermeter') {
        this.hideComponentValue(placedComp);
      }

      // Remove glow effects for non-meter components
      if (type !== 'voltmeter' && type !== 'ampermeter') {
        this.removeGlowEffect(placedComp);
      }

      const image = placedComp.list.find(child => child.type === 'Image');
      if (image) {
        // Keep tint for meters, clear for others
        if (type !== 'voltmeter' && type !== 'ampermeter') {
          image.clearTint();
        }
      }
    }
  }
}

export { CircuitVisuals };