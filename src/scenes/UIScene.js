/**
 * UIScene.js
 * -----------
 * A parallel scene that runs on top of every gameplay scene.
 *
 * "Parallel" means it is launched with this.scene.launch() instead of
 * this.scene.start(), so it never stops while the game is running.
 *
 * Responsibilities:
 *   - Render and manage the DialogBox
 *   - Listen to global events (game.events) from gameplay scenes
 *   - Forward "next page" input to the DialogBox
 */

import { SCENES, EVENTS } from '../config.js';
import { DialogBox       } from '../ui/DialogBox.js';

export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.UI });
  }

  create() {
    this._dialog = new DialogBox(this);

    // ── Listen for events emitted by gameplay scenes ───────────────────────
    this.game.events.on(EVENTS.DIALOG_OPEN, (data) => {
      this._dialog.open(data);
    }, this);

    // ── Advance / close dialog ─────────────────────────────────────────────
    // Accept both E key and Space while a dialog is open.
    const advance = () => {
      if (this._dialog.isActive) this._dialog.next();
    };

    this.input.keyboard.on('keydown-E',     advance);
    this.input.keyboard.on('keydown-SPACE', advance);

    // Also allow mouse/tap
    this.input.on('pointerdown', advance);
  }
}
