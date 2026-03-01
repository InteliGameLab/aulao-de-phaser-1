/**
 * GameScene.js — Town / overworld
 * --------------------------------
 * Concrete gameplay scene that extends BaseGameScene.
 *
 * This scene uses the 'town' Tiled map, which contains:
 *   • Ground layer  – floor tiles (no collision)
 *   • Walls layer   – wall tiles (all collide)
 *   • Objects layer – player spawn, 3 NPCs, 1 portal to dungeon
 */

import { SCENES } from '../config.js';
import { BaseGameScene } from './BaseGameScene.js';

export class GameScene extends BaseGameScene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  // Tell BaseGameScene which map and tileset keys to use
  get mapKey()     { return 'town';     }
  get tilesetKey() { return 'tileset';  }
  get bgColor()    { return '#2d5a1b';  }  // dark green — outdoors

  create() {
    super.create();

    // Fade in after transition
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
