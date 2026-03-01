/**
 * Enemy.js
 * ---------
 * Simple patrol enemy for the Dungeon scene.
 *
 * Behaviour:
 *   - Moves horizontally back and forth within a patrol range.
 *   - Reverses direction when it reaches either boundary.
 *   - Player touching it only shows a warning (no health system for simplicity).
 *
 * Extends Phaser.Physics.Arcade.Sprite so the physics engine handles
 * movement and collisions with walls automatically.
 */

const ENEMY_SPEED = 70;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} range - patrol distance in tiles (default 4)
   */
  constructor(scene, x, y, range = 4) {
    super(scene, x, y, "enemy");

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(22, 22);
    this.setCollideWorldBounds(true);

    // Patrol boundaries in world pixels
    this._leftBound = x - range * 32;
    this._rightBound = x + range * 32;

    // Start moving right
    this.setVelocityX(ENEMY_SPEED);
  }

  // ─── update (called every frame by DungeonScene) ──────────────────────────

  update() {
    if (this.x >= this._rightBound) {
      this.setVelocityX(-ENEMY_SPEED);
      this.setFlipX(true);
    } else if (this.x <= this._leftBound) {
      this.setVelocityX(ENEMY_SPEED);
      this.setFlipX(false);
    }
  }
}
