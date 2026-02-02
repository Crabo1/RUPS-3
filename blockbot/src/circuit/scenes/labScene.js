import Phaser from 'phaser';

export default class LabScene extends Phaser.Scene {
  constructor() {
    super('LabScene');
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // ozadje laboratorija
    this.add.rectangle(0, 0, width, height, 0xf0f0f0).setOrigin(0);
    
    // stena
    this.add.rectangle(0, 0, width, height - 150, 0xe8e8e8).setOrigin(0);
    
    // tla
    this.add.rectangle(0, height - 150, width, 150, 0xd4c4a8).setOrigin(0);
    
    // miza
    const tableX = width / 2;
    const tableY = height / 2 + 50;
    const tableWidth = 500;
    const tableHeight = 250;
    
    // miza (del, ki se klikne)
    const tableTop = this.add.rectangle(tableX, tableY, tableWidth, 30, 0x8b4513).setOrigin(0.5);
    
    // delovna površina mize
    const tableSurface = this.add.rectangle(tableX, tableY + 15, tableWidth - 30, tableHeight - 30, 0xa0826d).setOrigin(0.5, 0);
    
    // mreža
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x8b7355, 0.3);
    const gridSize = 30;
    const gridStartX = tableX - (tableWidth - 30) / 2;
    const gridStartY = tableY + 15;
    const gridEndX = tableX + (tableWidth - 30) / 2;
    const gridEndY = tableY + 15 + (tableHeight - 30);
    
    for (let x = gridStartX; x <= gridEndX; x += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(x, gridStartY);
      gridGraphics.lineTo(x, gridEndY);
      gridGraphics.strokePath();
    }
    for (let y = gridStartY; y <= gridEndY; y += gridSize) {
      gridGraphics.beginPath();
      gridGraphics.moveTo(gridStartX, y);
      gridGraphics.lineTo(gridEndX, y);
      gridGraphics.strokePath();
    }
    
    // nogice mize
    const legWidth = 20;
    const legHeight = 150;
    this.add.rectangle(tableX - tableWidth/2 + 40, tableY + tableHeight/2 + 20, legWidth, legHeight, 0x654321);
    this.add.rectangle(tableX + tableWidth/2 - 40, tableY + tableHeight/2 + 20, legWidth, legHeight, 0x654321);
    
    // interaktivnost mize
    const interactiveZone = this.add.zone(tableX, tableY + tableHeight/2, tableWidth, tableHeight)
      .setInteractive({ useHandCursor: true });
    
    const instruction = this.add.text(tableX, tableY - 80, 'Klikni na mizo in začni graditi svoj električni krog!', {
      fontSize: '24px',
      color: '#333',
      fontStyle: 'bold',
      backgroundColor: '#ffffff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);
    
    // animacija besedila
    this.tweens.add({
      targets: instruction,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
    
    // zoom na mizo
    interactiveZone.on('pointerdown', () => {
      this.cameras.main.fade(300, 0, 0, 0);
      this.time.delayedCall(300, () => {
        this.scene.start('WorkspaceScene');
      });
    });
    
    interactiveZone.on('pointerover', () => {
      tableSurface.setFillStyle(0xb09070);
    });
    
    interactiveZone.on('pointerout', () => {
      tableSurface.setFillStyle(0xa0826d);
    });

    const logoutButton = this.add.text(40, 30, '↩ Nazaj', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#0066ff',
        padding: { x: 20, y: 10 }
    })
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => logoutButton.setStyle({ color: '#0044cc' }))
        .on('pointerout', () => logoutButton.setStyle({ color: '#0066ff' }))
        .on('pointerdown', () => {
            localStorage.removeItem('username');
            this.scene.start('MenuScene');
        });

    const buttonWidth = 180;
    const buttonHeight = 45;
    const cornerRadius = 10;
    const rightMargin = 60;
    const topMargin = 40;
  }
}
