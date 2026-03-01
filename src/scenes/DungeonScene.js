/**
 * DungeonScene.js — Underground dungeon
 * ---------------------------------------
 * Second gameplay area. Demonstrates:
 *   - Using a different map key and tileset
 *   - Spawning enemies from the Objects layer
 *   - Enemy ↔ walls collision
 *   - Player ↔ enemy overlap (warning message)
 */

import { SCENES, EVENTS } from '../config.js';
import { BaseGameScene  } from './BaseGameScene.js';
import { Enemy          } from '../entities/Enemy.js';

export class DungeonScene extends BaseGameScene {
  constructor() {
    super({ key: SCENES.DUNGEON });
  }

  get mapKey()     { return 'dungeon';        }
  get tilesetKey() { return 'tileset-dungeon'; }
  get bgColor()    { return '#0d0d1a';         }  // near-black — underground

  create() {
    super.create();  // BaseGameScene sets up map, player, NPCs, portals

    this._enemyHitCooldown = false;

    // ── Enemy group — so we can collide them with walls as a batch ──────────
    this._enemyGroup = this.physics.add.group(this._enemies);

    // Enemies also collide with walls
    this.physics.add.collider(this._enemyGroup, this._wallsLayer);

    // Player ↔ enemy overlap → show a dialog warning
    this.physics.add.overlap(
      this._player,
      this._enemyGroup,
      () => this._onEnemyContact(),
    );

    // After the enemy-hit dialog closes, wait 1.5 s before allowing another hit.
    // This gives the player time to walk away from the enemy before the overlap
    // check triggers again — otherwise the loop never ends.
    this.game.events.on(EVENTS.DIALOG_CLOSE, this._onEnemyDialogClose, this);

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  // ─── enemy spawning (overrides the no-op in BaseGameScene) ───────────────

  _spawnEnemy(x, y, obj) {
    const range = this._getProp(obj, 'range') ?? 4;
    const enemy = new Enemy(this, x, y, range);
    this._enemies.push(enemy);
  }

  // ─── private ──────────────────────────────────────────────────────────────

  // Clean up the extra DIALOG_CLOSE listener when leaving this scene
  _onPortalEnter(portal) {
    this.game.events.off(EVENTS.DIALOG_CLOSE, this._onEnemyDialogClose, this);
    super._onPortalEnter(portal);
  }

  _onEnemyDialogClose() {
    if (this._enemyHitCooldown) {
      this.time.delayedCall(1500, () => { this._enemyHitCooldown = false; });
    }
  }

  _onEnemyContact() {
    // Guard 1: player already has a dialog open (blocked by NPC or previous hit)
    if (this._player.blocked) return;

    // Guard 2: cooldown — prevents re-triggering while the player is still
    // standing on the enemy after the dialog closes.
    if (this._enemyHitCooldown) return;

    this._enemyHitCooldown = true;  // cleared by the DIALOG_CLOSE listener above

    this.game.events.emit(EVENTS.DIALOG_OPEN, {
      speaker: 'Sistema',
      pages:   ['Cuidado! Um inimigo te acertou.', 'Em jogos reais você perderia vida aqui!'],
    });
  }
}
