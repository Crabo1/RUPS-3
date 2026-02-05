export interface CircuitChallenge {
  levelIndex: number;
  prompt: string;
  requiredComponents: string[];
  availableComponents: string[];
  theory?: string[];
  hints?: string[];
}

export const circuitChallenges: CircuitChallenge[] = [
  {
    levelIndex: 1,
    prompt: 'Poveži baterijo s svetilko, da bo prižgana',
    requiredComponents: ['baterija', 'svetilka'],
    availableComponents: ['baterija', 'svetilka', 'žica'],
    theory: [
      'Električni tok teče samo po sklenjeni poti od pozitivnega pola baterije do svetilke in nazaj k negativnemu polu. To je osnovni električni krog.'
    ],
    hints: [
      'Baterija je vir napetosti',
      'Svetilka porablja energijo',
      'Potrebuješ najmanj dve žici za zaprtje kroga'
    ]
  },
  {
    levelIndex: 2,
    prompt: 'Dodaj stikalo za vklop/izklop svetilke',
    requiredComponents: ['baterija', 'svetilka', 'stikalo'],
    availableComponents: ['baterija', 'svetilka', 'stikalo', 'žica'],
    theory: [
      'Stikalo omogoča nadzor nad tokom. Ko je stikalo zaprto, tok teče in svetilka sveti. Ko je odprto, tok ne more teči in svetilka ugasne.'
    ],
    hints: [
      'Stikalo mora biti v poti toka',
      'Klikni na stikalo, da ga preklopiš',
      'Preveri, ali je stikalo zaprto'
    ]
  },
  {
    levelIndex: 3,
    prompt: 'Uporabi upor, da bo svetilka manj svetila',
    requiredComponents: ['baterija', 'svetilka', 'upor'],
    availableComponents: ['baterija', 'svetilka', 'upor', 'žica'],
    theory: [
      'Upor omejuje električni tok. Po Ohmovem zakonu: I = U/R. Večji upor pomeni manjši tok, zato je svetilka manj svetla.'
    ],
    hints: [
      'Upor postavi v serijo s svetilko',
      'Svetilka mora še vedno svetiti',
      'Poskusi z različnimi pozicijami upora'
    ]
  },
  {
    levelIndex: 4,
    prompt: 'Poveži dve svetilki zaporedno',
    requiredComponents: ['baterija', 'svetilka', 'svetilka'], 
    availableComponents: ['baterija', 'svetilka', 'žica'],
    theory: [
      'Pri zaporedni vezavi teče isti tok skozi obe svetilki. Napetost baterije se porazdeli med svetilkama, zato sta obe manj svetli kot če bi bila sama.'
    ],
    hints: [
      'Tok mora teči skozi prvo IN nato skozi drugo svetilko',
      'Obe svetilki morata svetiti',
      'Potrebuješ več žic'
    ]
  },
  {
    levelIndex: 5,
    prompt: 'Poveži dve svetilki vzporedno',
    requiredComponents: ['baterija', 'svetilka', 'svetilka'], 
    availableComponents: ['baterija', 'svetilka', 'žica'],
    theory: [
      'Pri vzporedni vezavi ima vsaka svetilka celotno napetost baterije. Tok se deli med svetilkama, zato sta obe polno svetli.'
    ],
    hints: [
      'Obe svetilki morata biti neposredno povezani z baterijo',
      'Uporabi več žic',
      'Poskusi z različnimi potmi'
    ]
  },
  {
    levelIndex: 6,
    prompt: 'Izmeri napetost na svetilki, ko sveti',
    requiredComponents: ['baterija', 'svetilka', 'voltmeter'],
    availableComponents: ['baterija', 'svetilka', 'voltmeter', 'žica'],
    theory: [
      'Voltmetri se priključujejo VZPOREDNO z elementom, katerega napetost želimo izmeriti. Voltmetri imajo zelo visok upor, da ne vplivajo na krog.'
    ],
    hints: [
      'Voltmeter poveži vzporedno s svetilko',
      'Rdeča priključek na pozitivno stran',
      'Črna priključek na negativno stran'
    ]
  },
  {
    levelIndex: 7,
    prompt: 'Izmeri tok skozi svetilko',
    requiredComponents: ['baterija', 'svetilka', 'ampermeter'],
    availableComponents: ['baterija', 'svetilka', 'ampermeter', 'žica'],
    theory: [
      'Ampermetri se priključujejo ZAPOREDNO v krog, da merijo tok. Imajo zelo nizek upor, da ne vplivajo na tok v krogu.'
    ],
    hints: [
      'Ampermeter mora biti v poti toka',
      'Tok mora teči skozi ampermeter',
      'Pazi na smer povezave'
    ]
  },
  {
    levelIndex: 8,
    prompt: 'Sestavi krog z vsemi komponentami: baterija, upor, svetilka in voltmeter',
    requiredComponents: ['baterija', 'svetilka', 'upor', 'voltmeter'],
    availableComponents: ['baterija', 'svetilka', 'upor', 'voltmeter', 'žica'],
    theory: [
      'V kompleksnem krogu lahko kombiniramo različne elemente. Upor omejuje tok, voltmeter meri napetost, svetilka sveti. Vse skupaj deluje v harmoniji električne vezave.'
    ],
    hints: [
      'Postavi vse elemente v krog',
      'Voltmeter vzporedno z elementom, ki ga želiš meriti',
      'Upor in svetilka v serijo'
    ]
  }
];

// Helper function to get challenge for a level
export const getChallengeForLevel = (levelIndex: number): CircuitChallenge | undefined => {
  return circuitChallenges.find(c => c.levelIndex === levelIndex);
};

// Helper to map inventory items to Slovenian component names used in circuit
export const mapInventoryToCircuitComponents = (inventory: string[]): string[] => {
  const mapping: Record<string, string> = {
    'battery': 'baterija',
    'bulb': 'svetilka',
    'switch': 'stikalo',
    'resistor': 'upor',
    'voltmeter': 'voltmeter',
    'ammeter': 'ampermeter'
  };
  
  return inventory.map(item => mapping[item] || item);
};