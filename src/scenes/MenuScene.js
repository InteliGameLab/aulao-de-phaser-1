/**
 * MenuScene.js
 * -------------
 * Title screen. Purely visual — no game logic here.
 * Press ENTER or click "Jogar" to start.
 */

import { SCENES } from '../config.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create() {
    const { width, height } = this.scale;
    const cx = width  / 2;
    const cy = height / 2;

    // ── Background gradient effect via a simple rectangle ────────────────────
    this.add.rectangle(cx, cy, width, height, 0x1a1a2e);

    // ── Title ─────────────────────────────────────────────────────────────────
    this.add.text(cx, cy - 140, 'PHASER', {
      fontSize: '72px',
      fontStyle: 'bold',
      color: '#3399ff',
      stroke: '#ffffff',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 70, 'QUEST', {
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'Um jogo para aprender Phaser 3', {
      fontSize: '16px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // ── Start button ──────────────────────────────────────────────────────────
    const btn = this.add.text(cx, cy + 60, '▶  JOGAR', {
      fontSize: '28px',
      color: '#ffffff',
      backgroundColor: '#3399ff',
      padding: { x: 24, y: 12 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerover',  () => btn.setStyle({ color: '#ffdd00' }));
    btn.on('pointerout',   () => btn.setStyle({ color: '#ffffff' }));
    btn.on('pointerdown',  () => this._startGame());

    // ── Keyboard shortcut ─────────────────────────────────────────────────────
    this.input.keyboard.once('keydown-ENTER', () => this._startGame());
    this.input.keyboard.once('keydown-SPACE', () => this._startGame());

    // ── Controls reminder ─────────────────────────────────────────────────────
    this.add.text(cx, cy + 150, 'WASD / ↑↓←→  Mover     E / Espaço  Interagir', {
      fontSize: '13px',
      color: '#888888',
    }).setOrigin(0.5);

    // ── Pulsing animation on the button ───────────────────────────────────────
    this.tweens.add({
      targets: btn,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // ─── private ──────────────────────────────────────────────────────────────

  _startGame() {
    // Fade out before switching scenes — a polished touch in one line.
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Launch UIScene in parallel so dialogs are always available.
      this.scene.launch(SCENES.UI);
      this.scene.start(SCENES.GAME);
    });
  }
}
