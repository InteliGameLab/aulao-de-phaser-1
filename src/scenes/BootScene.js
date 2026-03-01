/**
 * BootScene.js
 * -------------
 * First scene to run. Its only job:
 *   1. Show a solid background (so the screen is never blank).
 *   2. Load the asset manifest (assets.json) — a tiny JSON file.
 *   3. Hand off to PreloadScene.
 *
 * Keeping Boot small means the very first frame appears quickly.
 */

import { SCENES } from '../config.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload() {
    // Load ONLY the asset manifest. Everything else is PreloadScene's job.
    this.load.json('assets', 'assets/assets.json');
  }

  create() {
    this.scene.start(SCENES.PRELOAD);
  }
}
