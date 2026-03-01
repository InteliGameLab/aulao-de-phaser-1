/**
 * NPC.js
 * -------
 * A non-player character that can be talked to.
 *
 * NPCs are static (no physics body needed) — they just sit in the world
 * and react when the player is close and presses the interact key.
 *
 * Dialog is stored as an array of strings, one string per dialog "page".
 * The separator '|' in Tiled property strings is split into pages here.
 */

export class NPC extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number}  x
   * @param {number}  y
   * @param {string}  name      - NPC display name
   * @param {string}  dialogRaw - Dialog string, pages separated by '|'
   */
  constructor(scene, x, y, name, dialogRaw) {
    super(scene, x, y, 'npc');

    scene.add.existing(this);

    this.npcName  = name;
    this.dialogPages = dialogRaw.split('|').map(s => s.trim()).filter(Boolean);

    // "!" indicator shown above the NPC when the player is nearby
    this._indicator = scene.add.image(x, y - 30, 'indicator')
      .setVisible(false)
      .setDepth(10);

    // Floating bounce tween on the indicator
    scene.tweens.add({
      targets:  this._indicator,
      y:        y - 38,
      duration: 500,
      yoyo:     true,
      repeat:   -1,
      ease:     'Sine.easeInOut',
    });
  }

  // ─── public API ───────────────────────────────────────────────────────────

  /** Show or hide the "!" bubble. Called by the scene based on player distance. */
  setIndicatorVisible(visible) {
    this._indicator.setVisible(visible);
  }

  /** Returns the dialog data for the UIScene. */
  getDialogData() {
    return { speaker: this.npcName, pages: this.dialogPages };
  }

  destroy(fromScene) {
    this._indicator.destroy();
    super.destroy(fromScene);
  }
}
