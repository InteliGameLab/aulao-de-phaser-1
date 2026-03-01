/**
 * Player.js
 * ----------
 * Represents the player character.
 *
 * Extends Phaser.Physics.Arcade.Sprite so the physics engine can manage
 * its body automatically (velocity, collisions, world bounds, etc.).
 *
 * Responsibilities:
 *   - Read keyboard input and apply velocity
 *   - Detect when the interact key is pressed near an NPC/portal
 *   - Emit 'player:interact' with the nearest interactive object
 */

import { PLAYER_SPEED, INTERACT_RADIUS } from "../config.js";

export class Player extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene  - The owning scene
   * @param {number}       x      - World x position
   * @param {number}       y      - World y position
   */
  constructor(scene, x, y) {
    super(scene, x, y, "player");

    // Add to scene display list and physics world
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Don't slide outside the map boundaries
    this.setCollideWorldBounds(true);

    // Slightly shrink the physics body so the player fits through doorways
    this.body.setSize(TILE_SIZE_BODY, TILE_SIZE_BODY);

    // Input cursors (arrow keys + WASD)
    this._cursors = scene.input.keyboard.createCursorKeys();
    this._wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Interact key
    this._interactKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.E,
    );

    // Flag to block movement while dialog is open
    this.blocked = false;

    // List of nearby interactable objects — populated by GameScene each frame
    this.nearbyObjects = [];
  }

  // ─── update (called every frame by GameScene) ─────────────────────────────

  update() {
    if (this.blocked) {
      this.setVelocity(0, 0);
      return;
    }

    this._handleMovement();
    this._handleInteraction();
  }

  // ─── private ──────────────────────────────────────────────────────────────

  _handleMovement() {
    const { up, down, left, right } = this._cursors;
    const w = this._wasd;
    let vx = 0;
    let vy = 0;

    if (left.isDown || w.left.isDown) vx = -PLAYER_SPEED;
    if (right.isDown || w.right.isDown) vx = PLAYER_SPEED;
    if (up.isDown || w.up.isDown) vy = -PLAYER_SPEED;
    if (down.isDown || w.down.isDown) vy = PLAYER_SPEED;

    // Normalise diagonal speed so moving diagonally isn't faster
    if (vx !== 0 && vy !== 0) {
      vx *= DIAGONAL_FACTOR;
      vy *= DIAGONAL_FACTOR;
    }

    this.setVelocity(vx, vy);
  }

  _handleInteraction() {
    // Phaser.Input.Keyboard.JustDown fires only on the first frame of the press
    if (!Phaser.Input.Keyboard.JustDown(this._interactKey)) return;

    // Find the closest interactable object within range
    let closest = null;
    let closestDist = Infinity;

    for (const obj of this.nearbyObjects) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, obj.x, obj.y);
      if (dist < INTERACT_RADIUS && dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }

    if (closest) {
      // The scene listens to this event and decides what to do
      this.emit("interact", closest);
    }
  }
}

// Module-level constants that depend on config but avoid a circular import
const TILE_SIZE_BODY = 22;
const DIAGONAL_FACTOR = Math.SQRT1_2; // 1/√2 ≈ 0.707
