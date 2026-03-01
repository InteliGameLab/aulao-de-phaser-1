/**
 * main.js — Entry point
 * ----------------------
 * Creates the Phaser.Game instance.
 * All game-wide settings live here; scene-specific logic stays in each scene.
 */

import { GAME_WIDTH, GAME_HEIGHT, SCENES } from './config.js';

import { BootScene    } from './scenes/BootScene.js';
import { PreloadScene } from './scenes/PreloadScene.js';
import { MenuScene    } from './scenes/MenuScene.js';
import { GameScene    } from './scenes/GameScene.js';
import { DungeonScene } from './scenes/DungeonScene.js';
import { UIScene      } from './scenes/UIScene.js';

const config = {
  type: Phaser.AUTO,          // AUTO → use WebGL if available, otherwise Canvas

  width:  GAME_WIDTH,
  height: GAME_HEIGHT,

  backgroundColor: '#1a1a2e',

  // Arcade physics — simple AABB, perfect for 2D top-down games
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,           // set to true to see hitboxes during development
    },
  },

  // Scene order matters: Boot always goes first.
  // Phaser starts the first scene automatically.
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    DungeonScene,
    UIScene,
  ],
};

// The game object is exported so any module can access game.events (global bus).
export const game = new Phaser.Game(config);
