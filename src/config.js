/**
 * config.js — Global configuration
 * ----------------------------------
 * Centralise every "magic number" and string constant here.
 * Import from any scene or entity so nothing is hard-coded.
 */

// ─── Display ────────────────────────────────────────────────────────────────
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// ─── Tilemap ─────────────────────────────────────────────────────────────────
export const TILE_SIZE = 32;

// ─── Player ──────────────────────────────────────────────────────────────────
export const PLAYER_SPEED = 160;
export const INTERACT_RADIUS = 64; // pixels — how close the player must be to interact

// ─── Scene keys ──────────────────────────────────────────────────────────────
// Keep every scene key in one place so typos cause loud errors, not silent bugs.
export const SCENES = {
  BOOT: "Boot",
  PRELOAD: "Preload",
  MENU: "Menu",
  GAME: "GameScene",
  DUNGEON: "DungeonScene",
  UI: "UI",
};

// ─── Events (game-level event bus) ───────────────────────────────────────────
// Scenes communicate through this.game.events to stay decoupled.
export const EVENTS = {
  DIALOG_OPEN: "dialog:open",
  DIALOG_CLOSE: "dialog:close",
  DIALOG_NEXT: "dialog:next",
};

// ─── Colours (used for placeholder graphics) ─────────────────────────────────
export const COLORS = {
  FLOOR: 0x8b7355, // sandy brown
  WALL: 0x4a4a4a, // dark stone
  PLAYER: 0x3399ff, // blue
  NPC: 0x33cc55, // green
  ENEMY: 0xee3333, // red
  PORTAL: 0xaa44ff, // purple
  DIALOG_BG: 0x000000,
  DIALOG_BORDER: 0xffffff,
};
