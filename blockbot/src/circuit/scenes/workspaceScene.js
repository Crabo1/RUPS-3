import Phaser from 'phaser';
import { Battery } from '../components/battery';
import { Bulb } from '../components/bulb';
import { Wire } from '../components/wire';
import { CircuitGraph } from '../logic/circuit_graph';
import { Node } from '../logic/node';
import { Switch } from '../components/switch';
import { Resistor } from '../components/resistor';
import { CircuitVisuals } from '../logic/circuit_visuals';
import { CurrentFlowAnimation } from '../logic/currentFlowAnimation';
import { Voltmeter } from '../components/voltmeter.js';
import { Ammeter } from '../components/ammeter.js';

export default class WorkspaceScene extends Phaser.Scene {
  constructor() {
    super('WorkspaceScene');
    this.simulationThrottle = null;
    this.isSimulationRunning = false;
    this.simulationDelay = 500;
  }

  init() {
    const savedIndex = localStorage.getItem('currentCircuitChallengeIndex');
    this.currentChallengeIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
  }

  preload() {
    this.graph = new CircuitGraph();
    this.load.image('baterija', '/circuit/components/battery.svg');
    this.load.image('upor', '/circuit/components/resistor.svg');
    this.load.image('svetilka', '/circuit/components/lamp.svg');
    this.load.image('stikalo-on', '/circuit/components/switch-on.svg');
    this.load.image('stikalo-off', '/circuit/components/switch-off.svg');
    this.load.image('žica', '/circuit/components/wire.svg');
    this.load.image('ampermeter', '/circuit/components/ammeter.svg');
    this.load.image('voltmeter', '/circuit/components/voltmeter.svg');
    this.load.image('background', '/background.svg')
  }

  create() {
    const { width, height } = this.cameras.main;

    let blockbotChallenge = null;
    let blockbotInventory = this.registry.get('blockbotInventory') || [];
    let blockbotLevelIndex = 0;
  
    try {
      if (this.registry) {
        blockbotChallenge = this.registry.get('circuitChallenge');
        blockbotInventory = this.registry.get('blockbotInventory') || [];
        blockbotLevelIndex = this.registry.get('blockbotLevelIndex') || 0;
      }
    } catch (error) {
      console.error('Error reading registry:', error);
    }

    this.circuitVisuals = new CircuitVisuals(this);
    this.currentFlowAnim = new CurrentFlowAnimation(this);

    // Get inventory from registry (passed from React)
    /*const blockbotInventory = this.registry.get('blockbotInventory') || [];
    console.log('Circuit scene received inventory:', blockbotInventory);*/

    // Wires are always available
    const alwaysAvailable = ['žica'];
    this.enabledComponents = [...new Set([...blockbotInventory, ...alwaysAvailable])];
    console.log('Enabled components:', this.enabledComponents);

    const desk = this.add.image(0, 0, 'background').setOrigin(0).setDisplaySize(width, height).setAlpha(0.4);
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x00b3a4 , 0.8);
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, height);
      gridGraphics.strokePath();
    }
    for (let y = 0; y < height; y += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(width, y);
      gridGraphics.strokePath();
    }

    this.infoWindow = this.add.container(0, 0);
    this.infoWindow.setDepth(1000);
    this.infoWindow.setVisible(false);

    const infoBox = this.add.rectangle(0, 0, 200, 80, 0x2c2c2c, 0.95);
    infoBox.setStrokeStyle(2, 0xffffff);
    const infoText = this.add.text(0, 0, '', {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      color: '#ffffff',
      align: 'left',
      wordWrap: { width: 180 }
    }).setOrigin(0.5);

    this.infoWindow.add([infoBox, infoText]);
    this.infoText = infoText;

    this.currentFlowParticles = [];

    this.circuitChallenges = [
      {
        prompt: 'Poveži baterijo s svetilko, da bo prižgana',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'žica'],
        theory: ['Električni tok teče samo po sklenjeni poti od pozitivnega pola baterije do svetilke in nazaj k negativnemu polu. To je osnovni električni krog.'],
        hints: ['Baterija je vir napetosti', 'Svetilka porablja energijo', 'Potrebuješ najmanj dve žici za zaprtje kroga']
      },
      {
        prompt: 'Dodaj stikalo za vklop/izklop svetilke',
        requiredComponents: ['baterija', 'svetilka', 'stikalo', 'žica', 'žica', 'žica'],
        theory: ['Stikalo omogoča nadzor nad tokom. Ko je stikalo zaprto, tok teče in svetilka sveti. Ko je odprto, tok ne more teči in svetilka ugasne.'],
        hints: ['Stikalo mora biti v poti toka', 'Klikni na stikalo, da ga preklopiš', 'Preveri, ali je stikalo zaprto']
      },
      {
        prompt: 'Uporabi upor, da bo svetilka manj svetla',
        requiredComponents: ['baterija', 'svetilka', 'upor', 'žica', 'žica', 'žica'],
        theory: ['Upor omejuje električni tok. Po Ohmovem zakonu: I = U/R. Večji upor pomeni manjši tok, zato je svetilka manj svetla.'],
        hints: ['Upor postavi v serijo s svetilko', 'Svetilka mora še vedno svetiti', 'Poskusi z različnimi pozicijami upora']
      },
      {
        prompt: 'Poveži dve svetilki zaporedno',
        requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Pri zaporedni vezavi teče isti tok skozi obe svetilki. Napetost baterije se porazdeli med svetilkama, zato sta obe manj svetli kot če bi bila sama.'],
        hints: ['Tok mora teči skozi prvo IN nato skozi drugo svetilko', 'Obe svetilki morata svetiti', 'Poskusi z različnimi povezavami']
      },
      {
        prompt: 'Poveži dve svetilki vzporedno',
        requiredComponents: ['baterija', 'svetilka', 'svetilka', 'žica', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Pri vzporedni vezavi ima vsaka svetilka celotno napetost baterije. Tok se deli med svetilkama, zato sta obe polno svetli.'],
        hints: ['Obe svetilki morata biti neposredno povezani z baterijo', 'Uporabi več žic', 'Poskusi z različnimi potmi']
      },
      {
        prompt: 'Izmeri napetost na svetilki, ko sveti',
        requiredComponents: ['baterija', 'svetilka', 'voltmeter', 'žica', 'žica', 'žica'],
        theory: ['Voltmetri se priključujejo VZPOREDNO z elementom, katerega napetost želimo izmeriti. Voltmetri imajo zelo visok upor, da ne vplivajo na krog.'],
        hints: ['Voltmeter poveži vzporedno s svetilko', 'Rdeča priključek na pozitivno stran', 'Črna priključek na negativno stran'],
        checkVoltmeter: true
      },
      {
        prompt: 'Izmeri tok skozi svetilko',
        requiredComponents: ['baterija', 'svetilka', 'ampermeter', 'žica', 'žica', 'žica'],
        theory: ['Ampermetri se priključujejo ZAPOREDNO v krog, da merijo tok. Imajo zelo nizek upor, da ne vplivajo na tok v krogu.'],
        hints: ['Ampermeter mora biti v poti toka', 'Tok mora teči skozi ampermeter', 'Pazi na smer povezave'],
        checkAmmeter: true
      },
      {
        prompt: 'Naj dva upora delita 9V napetosti - to preveri z voltmetrom',
        requiredComponents: ['baterija', 'upor', 'upor', 'voltmeter', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Pri zaporedni vezavi uporov se napetost deli sorazmerno z upornostjo. Vsota napetosti na uporih je enaka napetosti baterije.'],
        hints: ['Poveži upora zaporedno', 'Voltmetrom izmeri napetost na vsakem uporu', 'Vsota mora biti približno 9V'],
        checkVoltageDivision: true
      },
      {
        prompt: 'Kaj se zgodi, če povežeš žico čez svetilko?',
        requiredComponents: ['baterija', 'svetilka', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Kratek stik nastane, ko nizkouporna povezava (žica) obide uporovni element. Tok teče po lažji poti, svetilka ugasne, baterija se hitro izprazni. To je lahko nevarno!'],
        hints: ['Dodaj žico vzporedno s svetilko', 'Opazuj, kaj se zgodi s svetilko', 'Preveri tok z ampermetrom'],
        allowShortCircuit: true
      },
      {
        prompt: 'Izmeri napetost IN tok v delujočem krogu',
        requiredComponents: ['baterija', 'svetilka', 'voltmeter', 'ampermeter', 'žica', 'žica', 'žica', 'žica'],
        theory: ['Z merjenjem napetosti in toka lahko izračunamo moč (P = U × I) in upornost (R = U/I). To so temeljna merjenja v elektrotehniki.'],
        hints: ['Voltmeter vzporedno s svetilko', 'Ampermeter zaporedno v krog', 'Oba merilnika morata delovati'],
        checkBothMeters: true
      }
    ];

    // Use blockbot challenge prompt if available, otherwise use default circuit challenges
    const promptToShow = blockbotChallenge 
      ? blockbotChallenge.prompt 
      : (this.circuitChallenges[this.currentChallengeIndex]?.prompt || 'Sestavi električni krog');
    this.promptText = this.add.text(width / 2, height - 30, promptToShow, {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      fontSize: '20px',
      color: '#333',
      fontStyle: 'bold',
      backgroundColor: '#ffffff88',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.checkText = this.add.text(width / 2, height - 70, '', {
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      fontSize: '18px',
      color: '#cc0000',
      fontStyle: 'bold',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    const buttonWidth = 180;
    const buttonHeight = 45;
    const cornerRadius = 10;

    const makeButton = (x, y, label, onClick) => {
      const bg = this.add.graphics();
      bg.fillStyle(0x00b3a4, 1);
      bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);

      const text = this.add.text(x, y, label, {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        resolution: 2,
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          bg.clear();
          bg.fillStyle(0x00998c, 1);
          bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
        })
        .on('pointerout', () => {
          bg.clear();
          bg.fillStyle(0x00b3a4, 1);
          bg.fillRoundedRect(x - buttonWidth / 2, y - buttonHeight / 2, buttonWidth, buttonHeight, cornerRadius);
        })
        .on('pointerdown', onClick);

      return { bg, text };
    };

    makeButton(width - 140, 110, 'Preveri krog', () => this.checkCircuit());
    makeButton(width - 140, 160, 'Namig', () => this.showHint());

    const panelWidth = 150;
    this.add.rectangle(0, 0, panelWidth, height, 0x00998c).setOrigin(0);
    this.add.rectangle(0, 0, panelWidth, height, 0x000000, 0.2).setOrigin(0);

    this.add.text(panelWidth / 2, 60, 'Komponente', {
      fontSize: '18px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const startY = 100;
    const spacing = 90;
    
    const paletteItems = [
      { type: 'baterija', color: 0xffcc00 },
      { type: 'upor', color: 0xff6600 },
      { type: 'svetilka', color: 0xff0000 },
      { type: 'stikalo', color: 0x666666 },
      { type: 'žica', color: 0x0066cc },
      { type: 'ampermeter', color: 0x00cc66 },
      { type: 'voltmeter', color: 0x00cc66 },
    ];

    paletteItems.forEach((item, index) => {
      const isEnabled = this.enabledComponents.length === 0 || this.enabledComponents.includes(item.type);
      console.log(`Component ${item.type}: enabled=${isEnabled}, in enabledComponents=${this.enabledComponents.includes(item.type)}`);
      this.createComponent(
        panelWidth / 2,
        startY + index * spacing,
        item.type,
        item.color,
        isEnabled
      );
    });

    this.add.text(width / 2 + 50, 30, 'Povleci komponente na mizo in zgradi svoj električni krog!', {
      fontSize: '20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      color: '#333',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#ffffff88',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5);

    this.placedComponents = [];
    this.gridSize = 40;
  }

  scheduleSimulation() {
    if (this.simulationThrottle) {
      clearTimeout(this.simulationThrottle);
    }

    this.simulationThrottle = setTimeout(() => {
      this.runSimulation();
      this.simulationThrottle = null;
    }, this.simulationDelay);
  }

  runSimulation() {
    if (this.isSimulationRunning) {
      return null;
    }

    this.isSimulationRunning = true;

    try {
      this.currentFlowAnim.stop();
      this.circuitVisuals.resetAllVisuals(this.placedComponents);

      const result = this.graph.simulate();

      if (result) {
        this.circuitVisuals.updateComponentVisuals(result, this.placedComponents, this.graph);

        if (result.status === 1) {
          this.checkText.setStyle({ color: '#00aa00' });
          this.checkText.setText('Električni tok teče!');
          this.sim = true;

          this.currentFlowAnim.start(result, this.placedComponents, this.graph);
        }
      } else {
        this.checkText.setStyle({ color: '#cc0000' });
        this.checkText.setText('Krog ni pravilno sestavljen');
        this.sim = false;
      }

      return result;
    } catch (error) {
      console.error('Simulation error:', error);
      this.checkText.setStyle({ color: '#cc0000' });
      this.checkText.setText('Napaka pri simulaciji');
      return null;
    } finally {
      this.isSimulationRunning = false;
    }
  }

  resetCircuit() {
    if (this.simulationThrottle) {
      clearTimeout(this.simulationThrottle);
      this.simulationThrottle = null;
    }

    this.currentFlowAnim.stop();
    this.circuitVisuals.resetAllVisuals(this.placedComponents);

    for (const placedComp of this.placedComponents) {
      const logicComp = placedComp.getData('logicComponent');
      if (logicComp) {
        if (logicComp.type === 'bulb' && typeof logicComp.reset === 'function') {
          logicComp.reset();
        }
      }
    }

    this.checkText.setText('');
    this.sim = undefined;
  }

  getComponentDetails(type) {
    const details = {
      'baterija': 'Napetost: 9 V\nVir električne energije',
      'upor': 'Upornost: 220 Ω\nOmejuje tok',
      'svetilka': 'Upornost: 100 Ω\nPretvarja v svetlobo',
      'stikalo': 'Stanje: ZAPRTO\nDovoljuje tok\nStanje: ODPRTO\nPrepreči tok',
      'žica': 'Upornost: 1 Ω\nPovezuje komponente',
      'ampermeter': 'Meri električni tok\nEnota: amperi (A)',
      'voltmeter': 'Meri napetost\nEnota: volti (V)'
    };
    return details[type] || 'Komponenta';
  }

  getComponentDisplayName(type) {
    const displayNames = {
      'baterija': 'baterija',
      'upor': 'upor',
      'svetilka': 'svetilka',
      'stikalo': 'stikalo',
      'žica': 'žica',
      'ampermeter': 'ampermeter',
      'voltmeter': 'voltmeter'
    };
    return displayNames[type] || type;
  }

  snapToGrid(x, y) {
    const gridSize = this.gridSize;
    const startX = 200;

    const snappedX = Math.round((x - startX) / gridSize) * gridSize + startX;
    const snappedY = Math.round(y / gridSize) * gridSize;

    return { x: snappedX, y: snappedY };
  }

  getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
  }

  updateLogicNodePositions(component) {
    const comp = component.getData('logicComponent');
    if (!comp) return;

    const halfW = 40;
    const halfH = 40;

    const localStart = comp.localStart || { x: -halfW, y: 0 };
    const localEnd = comp.localEnd || { x: halfW, y: 0 };

    const theta = Phaser.Math.DegToRad(component.angle || 0);

    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    const rotate = (p) => ({
      x: Math.round(p.x * cos - p.y * sin),
      y: Math.round(p.x * sin + p.y * cos)
    });

    const rStart = rotate(localStart);
    const rEnd = rotate(localEnd);

    const worldStart = { x: component.x + rStart.x, y: component.y + rStart.y };
    const worldEnd = { x: component.x + rEnd.x, y: component.y + rEnd.y };

    const snappedStart = this.snapToGrid(worldStart.x, worldStart.y);
    const snappedEnd = this.snapToGrid(worldEnd.x, worldEnd.y);

    if (comp.start) {
      comp.start.x = snappedStart.x;
      comp.start.y = snappedStart.y;
      if (!comp.start.connected) comp.start.connected = new Set();
      this.graph.addNode(comp.start);
    }
    if (comp.end) {
      comp.end.x = snappedEnd.x;
      comp.end.y = snappedEnd.y;
      if (!comp.end.connected) comp.end.connected = new Set();
      this.graph.addNode(comp.end);
    }

    const startDot = component.getData('startDot');
    const endDot = component.getData('endDot');
    if (startDot && comp.start) { startDot.x = comp.start.x; startDot.y = comp.start.y; }
    if (endDot && comp.end) { endDot.x = comp.end.x; endDot.y = comp.end.y; }

    const valueText = component.getData('valueText');
    if (valueText) {
      valueText.setPosition(component.x, component.y - 50);
    }

    const glow = component.getData('glowEffect');
    if (glow) {
      glow.setPosition(component.x, component.y);
    }
  }

  createComponent(x, y, type, color, isEnabled = true) {
    const component = this.add.container(x, y);

    let comp = null;
    let componentImage;
    let id;

    switch (type) {
      case 'baterija':
        id = "bat_" + this.getRandomInt(1000, 9999);
        comp = new Battery(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0),
          9
        );
        comp.type = 'battery';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'baterija')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'upor':
        id = "res_" + this.getRandomInt(1000, 9999);
        comp = new Resistor(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0),
          220
        );
        comp.type = 'resistor';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'upor')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'svetilka':
        id = "bulb_" + this.getRandomInt(1000, 9999);
        comp = new Bulb(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0),
          100
        );
        comp.type = 'bulb';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'svetilka')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'stikalo':
        id = "switch_" + this.getRandomInt(1000, 9999);
        comp = new Switch(
          id,
          new Node(id + "_start", -40, 0),
          new Node(id + "_end", 40, 0),
          false
        );
        comp.type = 'switch';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };

        componentImage = this.add.image(0, 0, 'stikalo-off')
          .setOrigin(0.5)
          .setDisplaySize(100, 100)
          .setName('switchImage');

        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'žica':
        id = "wire_" + this.getRandomInt(1000, 9999);
        comp = new Wire(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0)
        );
        comp.type = 'wire';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'žica')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'ampermeter':
        id = "ammeter_" + this.getRandomInt(1000, 9999);
        comp = new Ammeter(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0)
        );
        comp.type = 'ammeter';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'ampermeter')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;

      case 'voltmeter':
        id = "voltmeter_" + this.getRandomInt(1000, 9999);
        comp = new Voltmeter(
          id,
          new Node(id + '_start', -40, 0),
          new Node(id + '_end', 40, 0)
        );
        comp.type = 'voltmeter';
        comp.localStart = { x: -40, y: 0 };
        comp.localEnd = { x: 40, y: 0 };
        componentImage = this.add.image(0, 0, 'voltmeter')
          .setOrigin(0.5)
          .setDisplaySize(100, 100);
        component.add(componentImage);
        component.setData('logicComponent', comp);
        break;
    }

    component.on('pointerover', () => {
      if (component.getData('isInPanel')) {
        const details = this.getComponentDetails(type);
        this.infoText.setText(details);

        this.infoWindow.x = x + 120;
        this.infoWindow.y = y;
        this.infoWindow.setVisible(true);

        if (component.getData('infoTimeout')) {
          clearTimeout(component.getData('infoTimeout'));
        }
        const timeout = setTimeout(() => {
          this.infoWindow.setVisible(false);
        }, 2000);
        component.setData('infoTimeout', timeout);
      }
      if (isEnabled) {
        component.setScale(1.1);
      }
    });

    component.on('pointerout', () => {
      if (component.getData('isInPanel')) {
        this.infoWindow.setVisible(false);
      }
      if (isEnabled) {
        component.setScale(1);
      }
    });

    const label = this.add.text(0, 45, this.getComponentDisplayName(type), {
      fontSize: '13px',
      color: '#fff',
      backgroundColor: '#00000088',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif', 
      resolution: 2,
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
    component.add(label);
    component.setData('label', label);

    component.setSize(70, 70);

    // Only make component interactive if enabled
    if (isEnabled) {
      component.setInteractive({ draggable: true, useHandCursor: true });
      this.input.setDraggable(component);
    } else {
      // Visual feedback for disabled components
      component.setAlpha(0.3);
      const lockIcon = this.add.text(0, 0, '🔒', {
        fontSize: '24px'
      }).setOrigin(0.5);
      component.add(lockIcon);
    }

    component.setData('originalX', x);
    component.setData('originalY', y);
    component.setData('type', type);
    component.setData('color', color);
    component.setData('isInPanel', true);
    component.setData('rotation', 0);
    component.setData('isEnabled', isEnabled);
    if (comp) component.setData('logicComponent', comp);
    component.setData('isDragging', false);
    component.setData('componentId', id);

    component.on('dragstart', () => {
      if (!component.getData('isEnabled')) return;
      component.setData('isDragging', true);
      this.checkText.setText('');
    });

    component.on('drag', (pointer, dragX, dragY) => {
      if (!component.getData('isEnabled')) return;
      component.x = dragX;
      component.y = dragY;
    });

    component.on('dragend', () => {
      if (!component.getData('isEnabled')) return;
      component.setData('isDragging', false);
      const isInPanel = component.x < 200;

      if (isInPanel && !component.getData('isInPanel')) {
        this.removeComponentFromCircuit(component);
        component.destroy();
        this.scheduleSimulation();
      } else if (!isInPanel && component.getData('isInPanel')) {
        const snapped = this.snapToGrid(component.x, component.y);
        component.x = snapped.x;
        component.y = snapped.y;

        const label = component.getData('label');
        if (label) {
          label.setVisible(false);
        }

        const comp = component.getData('logicComponent');
        if (comp) {
          this.graph.addComponent(comp);

          if (comp.start) this.graph.addNode(comp.start);
          if (comp.end) this.graph.addNode(comp.end);
        }

        this.updateLogicNodePositions(component);
        component.setData('isRotated', false);
        component.setData('isInPanel', false);

        this.createComponent(
          component.getData('originalX'),
          component.getData('originalY'),
          component.getData('type'),
          component.getData('color'),
          component.getData('isEnabled')
        );

        this.placedComponents.push(component);
        this.scheduleSimulation();

      } else if (!component.getData('isInPanel')) {
        const snapped = this.snapToGrid(component.x, component.y);
        component.x = snapped.x;
        component.y = snapped.y;

        this.updateLogicNodePositions(component);
        this.scheduleSimulation();

      } else {
        component.x = component.getData('originalX');
        component.y = component.getData('originalY');
        component.angle = 0;
        component.setData('rotation', 0);
      }
    });

    component.on('pointerdown', () => {
      if (!component.getData('isInPanel')) {
        component.setData('clickTime', this.time.now);
      }
    });

    component.on('pointerup', () => {
      if (!component.getData('isInPanel')) {
        const clickTime = component.getData('clickTime');
        const clickDuration = this.time.now - clickTime;

        if (clickDuration < 200) {
          const logicComp = component.getData('logicComponent');

          if (logicComp && logicComp.type === 'switch') {
            logicComp.toggle();

            const img = component.getByName('switchImage')
              || component.list.find(child => child.type === 'Image');

            if (img) {
              img.setTexture(logicComp.is_on ? 'stikalo-on' : 'stikalo-off');
            }

            this.scheduleSimulation();
            return;
          }

          component.angle = (component.angle + 90) % 360;
          this.updateLogicNodePositions(component);
          this.scheduleSimulation();
        }
      }
    });

    return component;
  }

  removeComponentFromCircuit(component) {
    const logicComp = component.getData('logicComponent');
    if (logicComp) {
      const index = this.graph.components.indexOf(logicComp);
      if (index > -1) {
        this.graph.components.splice(index, 1);
      }

      if (logicComp.start) {
        this.graph.nodes.delete(logicComp.start.id);
      }
      if (logicComp.end) {
        this.graph.nodes.delete(logicComp.end.id);
      }
    }

    this.circuitVisuals.removeGlowEffect(component);
    this.circuitVisuals.hideComponentValue(component);

    const placedIndex = this.placedComponents.indexOf(component);
    if (placedIndex > -1) {
      this.placedComponents.splice(placedIndex, 1);
    }

    this.scheduleSimulation();
  }

  checkCircuit() {
    const blockbotChallenge = this.registry.get('circuitChallenge');
    const currentChallenge = blockbotChallenge || this.circuitChallenges[this.currentChallengeIndex];
    const placedTypes = this.placedComponents.map(comp => comp.getData('type'));
    this.checkText.setStyle({ color: '#cc0000' });

    // Preveri osnovne zahteve
    if (!currentChallenge.requiredComponents.every(req => placedTypes.includes(req))) {
      this.checkText.setText('Manjkajo komponente za krog.');
      return;
    }

    if (this.sim == undefined || this.sim == false) {
      this.checkText.setText('Električni krog ni sklenjen. Preveri, kako si ga sestavil');
      return;
    }

    // Posebna preverjanja za posamezne nivoje
    let levelSpecificCheck = true;
    let levelMessage = '';

    switch (this.currentChallengeIndex) {
      case 5: // Nivo 6 - Merjenje napetosti
        const voltmeter = this.placedComponents.find(c => c.getData('type') === 'voltmeter');
        if (voltmeter) {
          const logicComp = voltmeter.getData('logicComponent');
          if (logicComp && logicComp.measurement > 0 && logicComp.measurement < 9) {
            levelSpecificCheck = true;
          } else {
            levelSpecificCheck = false;
            levelMessage = 'Voltmeter ne meri pravilno! Poveži ga vzporedno s svetilko.';
          }
        }
        break;

      case 6: // Nivo 7 - Merjenje toka
        const ammeter = this.placedComponents.find(c => c.getData('type') === 'ampermeter');
        if (ammeter) {
          const logicComp = ammeter.getData('logicComponent');
          if (logicComp && logicComp.measurement > 0) {
            levelSpecificCheck = true;
          } else {
            levelSpecificCheck = false;
            levelMessage = 'Ampermeter ne meri toka! Poveži ga zaporedno v krog.';
          }
        }
        break;

      case 7: // Nivo 8 - Delitev napetosti
        const resistors = this.placedComponents.filter(c => c.getData('type') === 'upor');
        if (resistors.length >= 2) {
          // Preveri, ali so upori zaporedno
          levelSpecificCheck = true; // Poenostavljeno preverjanje
        }
        break;

      case 8: // Nivo 9 - Kratek stik
        // Preveri, ali svetilka ne sveti (kratek stik)
        const bulbs = this.placedComponents.filter(c => c.getData('type') === 'svetilka');
        const anyBulbOn = bulbs.some(bulb => {
          const logicComp = bulb.getData('logicComponent');
          return logicComp && logicComp.is_on;
        });

        if (anyBulbOn) {
          levelSpecificCheck = false;
          levelMessage = 'Svetilka še vedno sveti! Dodaj žico čez svetilko za kratek stik.';
        } else {
          levelSpecificCheck = true;
        }
        break;

      case 9: // Nivo 10 - Oba merilnika
        const hasVoltmeter = this.placedComponents.some(c => c.getData('type') === 'voltmeter');
        const hasAmmeter = this.placedComponents.some(c => c.getData('type') === 'ampermeter');

        if (!hasVoltmeter || !hasAmmeter) {
          levelSpecificCheck = false;
          levelMessage = 'Potrebuješ oba merilnika!';
        } else {
          const voltmeter = this.placedComponents.find(c => c.getData('type') === 'voltmeter');
          const ammeter = this.placedComponents.find(c => c.getData('type') === 'ampermeter');

          const voltLogic = voltmeter.getData('logicComponent');
          const ampLogic = ammeter.getData('logicComponent');

          if (voltLogic && ampLogic && voltLogic.measurement > 0 && ampLogic.measurement > 0) {
            levelSpecificCheck = true;

            // Izračunaj upornost svetilke
            const resistance = voltLogic.measurement / ampLogic.measurement;
            levelMessage = `Upornost svetilke: ${resistance.toFixed(1)}Ω`;
          } else {
            levelSpecificCheck = false;
            levelMessage = 'Oba merilnika morata meriti!';
          }
        }
        break;
    }

    if (!levelSpecificCheck) {
      this.checkText.setText(levelMessage);
      return;
    }

    this.checkText.setStyle({ color: '#00aa00' });
    this.checkText.setText('Čestitke! Krog je pravilen.');
    this.addPoints(10);

    const currentHighest = parseInt(localStorage.getItem('highestCircuitChallengeIndex') || '0');
    if (this.currentChallengeIndex >= currentHighest) {
      localStorage.setItem('highestCircuitChallengeIndex', (this.currentChallengeIndex + 1).toString());
    }

    if (currentChallenge.theory) {
      this.showTheory(currentChallenge.theory);
    } else {
      this.time.delayedCall(2000, () => this.nextChallenge());
    }1
  }

  showHint() {
    const blockbotChallenge = this.registry.get('circuitChallenge');
  
    let hints;
    if (blockbotChallenge && blockbotChallenge.hints) {
      hints = blockbotChallenge.hints;
    } else {
      const currentChallenge = this.circuitChallenges[this.currentChallengeIndex];
      hints = currentChallenge?.hints;
    }
    
    if (hints && hints.length > 0) {
      const randomHint = hints[Math.floor(Math.random() * hints.length)];
  
      const hintText = this.add.text(this.cameras.main.width / 2, 100, `Namig: ${randomHint}`, {
        fontSize: '18px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        resolution: 2,
        color: '#ffcc00',
        backgroundColor: '#000000aa',
        padding: { x: 15, y: 10 }
      }).setOrigin(0.5).setDepth(100);

      this.time.delayedCall(5000, () => {
        hintText.destroy();
      });
    }
  }

  nextChallenge() {
    this.currentChallengeIndex++;
    localStorage.setItem('currentCircuitChallengeIndex', this.currentChallengeIndex.toString());
    this.checkText.setText('');

    this.resetCircuit();

    this.placedComponents.forEach(comp => {
      this.circuitVisuals.removeGlowEffect(comp);
      this.circuitVisuals.hideComponentValue(comp);
      comp.destroy();
    });
    this.placedComponents = [];

    this.graph = new CircuitGraph();

    if (this.currentChallengeIndex < this.circuitChallenges.length) {
      this.promptText.setText(this.circuitChallenges[this.currentChallengeIndex].prompt);
    } else {
      this.promptText.setText('Vse naloge so uspešno opravljene! Čestitke!');
      localStorage.removeItem('currentCircuitChallengeIndex');
    }
  }

  addPoints(points) {
    const user = localStorage.getItem('username');
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userData = users.find(u => u.username === user);
    if (userData) {
      userData.score = (userData.score || 0) + points;
    }
    localStorage.setItem('users', JSON.stringify(users));
  }

  showTheory(theoryText) {
    const { width, height } = this.cameras.main;
    const blockbotChallenge = this.registry.get('circuitChallenge');
  
    let theoryToShow = theoryText;
    if (blockbotChallenge && blockbotChallenge.theory) {
      theoryToShow = blockbotChallenge.theory;
    }

    this.theoryBack = this.add.rectangle(width / 2, height / 2, width + 100, 150, 0x000000, 0.8)
      .setOrigin(0.5)
      .setDepth(10);

    this.theoryText = this.add.text(width / 2, height / 2, theoryToShow, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      fontStyle: 'bold',
      align: 'center',
      wordWrap: { width: width - 150 }
    })
      .setOrigin(0.5)
      .setDepth(11);

    this.continueButton = this.add.text(width / 2, height / 2 + 70, 'Nadaljuj', {
      fontSize: '18px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      resolution: 2,
      color: '#0066ff',
      backgroundColor: '#ffffff',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setDepth(11)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.continueButton.setStyle({ color: '#0044cc' }))
      .on('pointerout', () => this.continueButton.setStyle({ color: '#0066ff' }))
      .on('pointerdown', () => {
        this.hideTheory();
        this.nextChallenge();
      });
  }

  hideTheory() {
    if (this.theoryBack) {
      this.theoryBack.destroy();
      this.theoryBack = null;
    }
    if (this.theoryText) {
      this.theoryText.destroy();
      this.theoryText = null;
    }
    if (this.continueButton) {
      this.continueButton.destroy();
      this.continueButton = null;
    }
  }
}

const config = {
  type: Phaser.WEBGL,  
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#f8fafc',  
  
  pixelArt: false,
  antialias: true,
  roundPixels: false,
  
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    transparent: false,
    clearBeforeRender: true,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
    failIfMajorPerformanceCaveat: false,
    powerPreference: 'high-performance'
  },
  
  scene: [WorkspaceScene],
  
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};