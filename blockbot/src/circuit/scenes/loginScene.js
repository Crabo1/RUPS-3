import Phaser from 'phaser';

export default class LoginScene extends Phaser.Scene {
    constructor() {
        super('LoginScene');
    }

    create() {
        var users = JSON.parse(localStorage.getItem('users')) || [];

        // this.add.text(200, 100, 'Vnesi svoje uporabniško ime in geslo!', {
        //     fontFamily: 'Arial',
        //     fontSize: '20px',
        //     color: '#222'
        // });

        const { width, height } = this.scale;

        // --- 1️⃣ Ozadje laboratorija (enako kot v LabScene) ---
        // svetla stena
        this.add.rectangle(0, 0, width, height - 150, 0xe8e8e8).setOrigin(0);
        // tla
        this.add.rectangle(0, height - 150, width, 150, 0xd4c4a8).setOrigin(0);

        // miza
        const tableX = width / 2;
        const tableY = height / 2 + 50;
        const tableWidth = 500;
        const tableHeight = 250;

        // zgornja ploskev mize
        this.add.rectangle(tableX, tableY, tableWidth, 30, 0x8b4513).setOrigin(0.5);
        // površina mize z mrežo
        const surface = this.add.rectangle(tableX, tableY + 15, tableWidth - 30, tableHeight - 30, 0xa0826d).setOrigin(0.5, 0);
        const grid = this.add.graphics();
        grid.lineStyle(1, 0x8b7355, 0.3);
        const gridSize = 30;
        const gridStartX = tableX - (tableWidth - 30) / 2;
        const gridStartY = tableY + 15;
        const gridEndX = tableX + (tableWidth - 30) / 2;
        const gridEndY = tableY + 15 + (tableHeight - 30);

        for (let x = gridStartX; x <= gridEndX; x += gridSize) {
            grid.beginPath();
            grid.moveTo(x, gridStartY);
            grid.lineTo(x, gridEndY);
            grid.strokePath();
        }
        for (let y = gridStartY; y <= gridEndY; y += gridSize) {
            grid.beginPath();
            grid.moveTo(gridStartX, y);
            grid.lineTo(gridEndX, y);
            grid.strokePath();
        }

        // nogice mize
        const legWidth = 20;
        const legHeight = 150;
        this.add.rectangle(tableX - tableWidth / 2 + 40, tableY + tableHeight / 2 + 20, legWidth, legHeight, 0x654321);
        this.add.rectangle(tableX + tableWidth / 2 - 40, tableY + tableHeight / 2 + 20, legWidth, legHeight, 0x654321);

        // okvir
        const panelWidth = 500;
        const panelHeight = 340;
        const panelX = width / 2 - panelWidth / 2;
        const panelY = height / 2 - panelHeight / 2 - 30;

        const panel = this.add.graphics();
        panel.fillStyle(0xffffff, 0.92);
        panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);
        panel.lineStyle(3, 0xcccccc, 1);
        panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 25);

        // naslov
        this.add.text(width / 2, panelY + 40, 'PRIJAVA', {
            fontFamily: 'Arial',
            fontSize: '36px',
            fontStyle: 'bold',
            color: '#222'
        }).setOrigin(0.5);

        // input polji
        const inputWidth = 350;
        const inputHeight = 45;
        const corner = 10;

        const username = document.createElement('input');
        username.type = 'text';
        username.placeholder = 'Uporabniško ime';
        username.style.position = 'absolute';
        username.style.lineHeight = `${inputHeight}px`;
        username.style.width = `${inputWidth}px`;
        username.style.height = `${inputHeight}px`;
        username.style.left = `${width / 2 - inputWidth / 2}px`;
        username.style.top = `${panelY + 100}px`;
        username.style.borderRadius = '8px';
        username.style.padding = '5px';
        username.style.border = '1px solid #ccc';
        username.style.textAlign = 'center';
        username.style.fontSize = '18px';
        username.style.outline = 'none';
        username.style.backgroundColor = '#f9f9f9';
        document.body.appendChild(username);

        const password = document.createElement('input');
        password.type = 'password';
        password.placeholder = 'Geslo';
        password.style.position = 'absolute';
        password.style.lineHeight = `${inputHeight}px`;
        password.style.width = `${inputWidth}px`;
        password.style.height = `${inputHeight}px`;
        password.style.left = `${width / 2 - inputWidth / 2}px`;
        password.style.top = `${panelY + 160}px`;
        password.style.borderRadius = '8px';
        password.style.padding = '5px';
        password.style.border = '1px solid #ccc';
        password.style.textAlign = 'center';
        password.style.fontSize = '18px';
        password.style.outline = 'none';
        password.style.backgroundColor = '#f9f9f9';
        document.body.appendChild(password);

        // const profilePic = document.createElement('input');
        // profilePic.type = 'file';
        // profilePic.accept = 'image/*';
        // profilePic.style.position = 'absolute';
        // profilePic.style.width = '400px';
        // profilePic.style.left = '400px';
        // profilePic.style.top = '290px';
        // document.body.appendChild(profilePic);

        //console.log(profilePic);

        const buttonWidth = 180;  
        const buttonHeight = 45;  
        const cornerRadius = 10;  
        const buttonY = panelY + 270;
        const rectX = width / 2;

        const loginButtonBg = this.add.graphics();
        loginButtonBg.fillStyle(0x3399ff, 1);
        loginButtonBg.fillRoundedRect(
            rectX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );

        const loginButton = this.add.text(rectX, buttonY, '▶ Prijavi se', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                loginButtonBg.clear();
                loginButtonBg.fillStyle(0x0f5cad, 1);
                loginButtonBg.fillRoundedRect(
                    rectX - buttonWidth / 2,
                    buttonY - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    cornerRadius
                );
            })
            .on('pointerout', () => {
                loginButtonBg.clear();
                loginButtonBg.fillStyle(0x3399ff, 1);
                loginButtonBg.fillRoundedRect(
                    rectX - buttonWidth / 2,
                    buttonY - buttonHeight / 2,
                    buttonWidth,
                    buttonHeight,
                    cornerRadius
                );
            })
            .on('pointerdown', () => {
                const usernameTrim = username.value.trim();
                const passwordTrim = password.value.trim();
                const pfps = ['avatar1','avatar2','avatar3','avatar4','avatar5','avatar6','avatar7','avatar8','avatar9','avatar10','avatar11'];
                const pfpKey = pfps[Math.floor(Math.random() * pfps.length)];

                if (usernameTrim && passwordTrim) {
                    const existingUser = users.find(u => u.username == usernameTrim);
                    if (existingUser) {
                        if (existingUser.password !== passwordTrim) {
                            alert('Napačno geslo!');
                            return;
                        }
                    } else {
                        users.push({ username: usernameTrim, password: passwordTrim, score: 0, profilePic: pfpKey });
                        localStorage.setItem('users', JSON.stringify(users));
                    }

                    localStorage.setItem('username', usernameTrim);
                    localStorage.setItem('profilePic', pfpKey);

                    username.remove();
                    password.remove();

                    this.scene.start('LabScene');
                } else {
                    alert('Vnesi uporabniško ime in geslo!');
                }
            });

        // počisti inpute ob izhodu
        this.events.once('shutdown', () => {
            username.remove();
            password.remove();
        });

        const backButton = this.add.text(40, 30, '↩ Nazaj v meni', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#0066ff',
            // backgroundColor: '#e1e9ff',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0, 0) // levo zgoraj
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => backButton.setStyle({ color: '#0044cc' }))
            .on('pointerout', () => backButton.setStyle({ color: '#0066ff' }))
            .on('pointerdown', () => {
                username.remove();
                password.remove();
                this.scene.start('MenuScene');
            });

        //localStorage.clear();

        // this.input.keyboard.on('keydown-ESC', () => {
        //     this.scene.start('MenuScene');
        // });
    }
}
