/**
 * BaseGameScene.js
 * -----------------
 * Shared logic between GameScene and DungeonScene:
 *   - Load a Tiled map and create its layers
 *   - Spawn NPCs, enemies, and portals from the Objects layer
 *   - Set up the camera and world bounds
 *   - Handle the dialog open/close cycle with the player
 *
 * Both concrete scenes just call super methods and provide the map key +
 * tileset key — keeping duplicate code to zero.
 */

import { SCENES, EVENTS, TILE_SIZE, INTERACT_RADIUS } from '../config.js';
import { Player } from '../entities/Player.js';
import { NPC    } from '../entities/NPC.js';

export class BaseGameScene extends Phaser.Scene {

  // ─── template methods (override in subclasses) ────────────────────────────

  /** Key used with this.make.tilemap({ key }) */
  get mapKey()     { return ''; }
  /** Phaser texture cache key passed to map.addTilesetImage() */
  get tilesetKey() { return 'tileset'; }
  /** Background colour for this scene */
  get bgColor()    { return '#2d5a1b'; }

  // ─── lifecycle ────────────────────────────────────────────────────────────

  create() {
    this.cameras.main.setBackgroundColor(this.bgColor);

    // ── 1. Build tilemap ───────────────────────────────────────────────────
    const { map, groundLayer, wallsLayer } = this._buildMap();
    this._wallsLayer = wallsLayer;

    // ── 2. Set world bounds to match the map ───────────────────────────────
    const mapW = map.widthInPixels;
    const mapH = map.heightInPixels;
    this.physics.world.setBounds(0, 0, mapW, mapH);

    // ── 3. Spawn entities from the Objects layer ───────────────────────────
    const objectLayer = map.getObjectLayer('Objects');
    this._npcs    = [];
    this._portals = [];
    this._enemies = [];

    if (objectLayer) {
      this._spawnFromObjectLayer(objectLayer.objects);
    }

    // ── 4. Set up camera ──────────────────────────────────────────────────
    this.cameras.main
      .setBounds(0, 0, mapW, mapH)
      .startFollow(this._player, true, 0.1, 0.1);

    // ── 5. Collisions ─────────────────────────────────────────────────────
    // Player ↔ walls
    this.physics.add.collider(this._player, wallsLayer);

    // Player overlaps portal → scene transition
    this.physics.add.overlap(
      this._player,
      this._portals,
      (player, portal) => this._onPortalEnter(portal),
    );

    // ── 6. Subscribe to dialog events from UIScene ────────────────────────
    this.game.events.on(EVENTS.DIALOG_OPEN,  this._onDialogOpen,  this);
    this.game.events.on(EVENTS.DIALOG_CLOSE, this._onDialogClose, this);
  }

  update() {
    this._player.update();
    this._enemies.forEach(e => e.update());

    // Update interact indicator on every NPC
    const allInteractables = [...this._npcs, ...this._portals];
    this._player.nearbyObjects = allInteractables;

    this._npcs.forEach(npc => {
      const dist = Phaser.Math.Distance.Between(
        this._player.x, this._player.y, npc.x, npc.y,
      );
      npc.setIndicatorVisible(dist < INTERACT_RADIUS);
    });
  }

  // ─── private: map building ────────────────────────────────────────────────

  _buildMap() {
    // ── Load the Tiled JSON ──────────────────────────────────────────────
    // this.make.tilemap({ key }) reads the JSON loaded by PreloadScene.
    const map = this.make.tilemap({ key: this.mapKey });

    // addTilesetImage(tilesetNameInTiled, phaserCacheKey)
    // The first arg must match the "name" field inside the Tiled JSON.
    const tileset = map.addTilesetImage('tileset', this.tilesetKey);

    // Create renderable layers. The layer name must match the Tiled layer name.
    const groundLayer = map.createLayer('Ground', tileset, 0, 0);
    const wallsLayer  = map.createLayer('Walls',  tileset, 0, 0);

    // Every non-empty tile in the Walls layer will block movement.
    wallsLayer.setCollisionByExclusion([-1]);

    return { map, groundLayer, wallsLayer };
  }

  // ─── private: object spawning ─────────────────────────────────────────────

  _spawnFromObjectLayer(objects) {
    objects.forEach(obj => {
      // In Tiled, object positions are at the bottom-left corner of the tile.
      // We add half a tile to centre the sprite on the tile.
      const cx = obj.x + TILE_SIZE / 2;
      const cy = obj.y - TILE_SIZE / 2;  // Tiled y is bottom of tile

      switch (obj.type) {
        case 'player_spawn':
          this._spawnPlayer(cx, cy);
          break;

        case 'npc':
          this._spawnNPC(cx, cy, obj);
          break;

        case 'portal':
          this._spawnPortal(cx, cy, obj);
          break;

        case 'enemy':
          this._spawnEnemy(cx, cy, obj);
          break;
      }
    });

    // Fallback: if the map had no player_spawn object, place in map centre
    if (!this._player) {
      const mapCx = Math.floor(this.physics.world.bounds.width  / 2);
      const mapCy = Math.floor(this.physics.world.bounds.height / 2);
      this._spawnPlayer(mapCx, mapCy);
    }
  }

  _spawnPlayer(x, y) {
    this._player = new Player(this, x, y);
    // GameScene listens to the player's own 'interact' event
    this._player.on('interact', (target) => this._onPlayerInteract(target));
  }

  _spawnNPC(x, y, obj) {
    const name      = obj.name || 'NPC';
    const dialogRaw = this._getProp(obj, 'dialog') || 'Olá, aventureiro!';
    const npc       = new NPC(this, x, y, name, dialogRaw);
    this._npcs.push(npc);
  }

  _spawnPortal(x, y, obj) {
    const target = this._getProp(obj, 'target') || SCENES.GAME;

    // Portals are static physics sprites — overlap detection handles transition
    const portal = this.physics.add.staticSprite(x, y, 'portal');
    portal.targetScene = target;
    portal.name        = obj.name || 'portal';

    // Pulsing scale tween to make portals visually obvious
    this.tweens.add({
      targets:  portal,
      scaleX:   1.15,
      scaleY:   1.15,
      duration: 700,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });

    this._portals.push(portal);
  }

  /** Subclasses override this if they have enemies (DungeonScene). */
  // eslint-disable-next-line no-unused-vars
  _spawnEnemy(_x, _y, _obj) { /* no-op in base */ }

  // ─── private: interaction ─────────────────────────────────────────────────

  _onPlayerInteract(target) {
    // Target could be an NPC or a portal
    if (target instanceof NPC) {
      const data = target.getDialogData();
      // Notify UIScene via the global event bus
      this.game.events.emit(EVENTS.DIALOG_OPEN, data);
    }
  }

  _onDialogOpen() {
    this._player.blocked = true;
  }

  _onDialogClose() {
    this._player.blocked = false;
  }

  _onPortalEnter(portal) {
    if (this._transitioning) return;
    this._transitioning = true;

    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Remove dialog event listeners before leaving
      this.game.events.off(EVENTS.DIALOG_OPEN,  this._onDialogOpen,  this);
      this.game.events.off(EVENTS.DIALOG_CLOSE, this._onDialogClose, this);

      this.scene.start(portal.targetScene);
    });
  }

  // ─── utility ──────────────────────────────────────────────────────────────

  /** Read a custom property from a Tiled object by name. */
  _getProp(obj, name) {
    if (!obj.properties) return null;
    const prop = obj.properties.find(p => p.name === name);
    return prop ? prop.value : null;
  }
}
