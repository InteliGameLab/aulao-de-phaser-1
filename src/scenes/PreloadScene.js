/**
 * PreloadScene.js
 * ----------------
 * Reads the asset manifest loaded by BootScene and loads every asset.
 * Also generates all placeholder textures so the game works immediately,
 * even before real art assets are provided.
 *
 * Good practice: keep asset loading in ONE place. Never call this.load.*
 * from GameScene or other gameplay scenes.
 */

import { SCENES, TILE_SIZE, COLORS } from '../config.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.PRELOAD });
  }

  // ─── preload ──────────────────────────────────────────────────────────────
  preload() {
    this._buildLoadingBar();

    // Read the manifest that BootScene already loaded into the JSON cache.
    const manifest = this.cache.json.get('assets');

    // Dynamically register every asset from the manifest.
    // When you add a new asset, edit assets.json — no code change needed here.
    manifest.images.forEach(({ key, path }) => {
      this.load.image(key, path);
    });

    manifest.spritesheets.forEach(({ key, path, frameWidth, frameHeight }) => {
      this.load.spritesheet(key, path, { frameWidth, frameHeight });
    });

    manifest.tilemaps.forEach(({ key, path }) => {
      this.load.tilemapTiledJSON(key, path);
    });

    manifest.tilesets.forEach(({ key, path }) => {
      this.load.image(key, path);
    });

    manifest.audio.forEach(({ key, path }) => {
      this.load.audio(key, path);
    });
  }

  // ─── create ───────────────────────────────────────────────────────────────
  create() {
    // Generate placeholder textures for every game entity.
    // These are used automatically when a real asset was not loaded.
    this._generatePlaceholderTextures();

    this.scene.start(SCENES.MENU);
  }

  // ─── private helpers ──────────────────────────────────────────────────────

  _buildLoadingBar() {
    const cx = this.cameras.main.centerX;
    const cy = this.cameras.main.centerY;

    this.add.text(cx, cy - 50, 'Carregando...', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Background track
    const barBg = this.add.rectangle(cx, cy, 320, 20, 0x333333);

    // Filled portion — updated via loader events
    const bar = this.add.rectangle(cx - 160, cy, 0, 20, 0x3399ff).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      bar.width = 320 * value;
    });
  }

  /**
   * Generates simple coloured rectangles for every game entity.
   * If a real spritesheet/image was already loaded with the same key,
   * we skip generation — real assets take priority.
   */
  _generatePlaceholderTextures() {
    const g = this.make.graphics({ add: false });

    // ── Tileset ─────────────────────────────────────────────────────────────
    // Two tiles side by side in one image: [floor | wall]
    if (!this.textures.exists('tileset')) {
      g.clear();
      // Floor tile (index 0, GID 1)
      g.fillStyle(COLORS.FLOOR);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.lineStyle(1, 0x000000, 0.15);
      g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Wall tile (index 1, GID 2)
      g.fillStyle(COLORS.WALL);
      g.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
      g.lineStyle(1, 0x000000, 0.3);
      g.strokeRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);

      g.generateTexture('tileset', TILE_SIZE * 2, TILE_SIZE);
    }

    // ── Dungeon tileset ──────────────────────────────────────────────────────
    if (!this.textures.exists('tileset-dungeon')) {
      g.clear();
      // Floor (darker, stone-like)
      g.fillStyle(0x2d2d4e);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.lineStyle(1, 0x111111, 0.4);
      g.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);

      // Wall (very dark)
      g.fillStyle(0x1a1a2e);
      g.fillRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);
      g.lineStyle(2, 0x444466, 0.6);
      g.strokeRect(TILE_SIZE, 0, TILE_SIZE, TILE_SIZE);

      g.generateTexture('tileset-dungeon', TILE_SIZE * 2, TILE_SIZE);
    }

    // ── Player ───────────────────────────────────────────────────────────────
    if (!this.textures.exists('player')) {
      g.clear();
      g.fillStyle(COLORS.PLAYER);
      g.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
      // Small triangle pointing up — shows facing direction
      g.fillStyle(0xffffff);
      g.fillTriangle(
        TILE_SIZE / 2, 4,
        TILE_SIZE / 2 - 6, 14,
        TILE_SIZE / 2 + 6, 14,
      );
      g.generateTexture('player', TILE_SIZE, TILE_SIZE);
    }

    // ── NPC ──────────────────────────────────────────────────────────────────
    if (!this.textures.exists('npc')) {
      g.clear();
      g.fillStyle(COLORS.NPC);
      g.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
      // Small dot in the centre
      g.fillStyle(0xffffff);
      g.fillCircle(TILE_SIZE / 2, TILE_SIZE / 2, 4);
      g.generateTexture('npc', TILE_SIZE, TILE_SIZE);
    }

    // ── Enemy ────────────────────────────────────────────────────────────────
    if (!this.textures.exists('enemy')) {
      g.clear();
      g.fillStyle(COLORS.ENEMY);
      g.fillRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
      // X mark
      g.lineStyle(3, 0xffffff);
      g.lineBetween(8, 8, TILE_SIZE - 8, TILE_SIZE - 8);
      g.lineBetween(TILE_SIZE - 8, 8, 8, TILE_SIZE - 8);
      g.generateTexture('enemy', TILE_SIZE, TILE_SIZE);
    }

    // ── Portal ───────────────────────────────────────────────────────────────
    if (!this.textures.exists('portal')) {
      g.clear();
      g.fillStyle(COLORS.PORTAL, 0.85);
      g.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
      g.lineStyle(2, 0xffffff, 0.9);
      g.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);
      g.generateTexture('portal', TILE_SIZE, TILE_SIZE);
    }

    // ── Interact indicator "!" ────────────────────────────────────────────────
    if (!this.textures.exists('indicator')) {
      g.clear();
      g.fillStyle(0xffdd00);
      g.fillCircle(10, 10, 10);
      g.generateTexture('indicator', 20, 20);
    }

    g.destroy();
  }
}
