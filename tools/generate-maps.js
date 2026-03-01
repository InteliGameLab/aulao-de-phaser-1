/**
 * Map Generator Tool
 * ------------------
 * Generates placeholder Tiled-compatible JSON maps for the game.
 * Run with: node tools/generate-maps.js
 *
 * When you have real Tiled maps, just replace the files in assets/maps/
 * with your exported Tiled JSON — the game code stays the same.
 */

const fs = require('fs');
const path = require('path');

const TILE_FLOOR = 1;
const TILE_WALL  = 2;
const COLS       = 25;
const ROWS       = 18;
const TILE_W     = 32;
const TILE_H     = 32;

// ─── helpers ─────────────────────────────────────────────────────────────────

function makeRow(len, fillValue = 0) {
  return Array(len).fill(fillValue);
}

function buildLayer(rows) {
  return rows.flat();
}

function obj(id, name, type, x, y, w, h, props = []) {
  return {
    id, name, type,
    x: x * TILE_W,
    y: y * TILE_H,
    width: w * TILE_W,
    height: h * TILE_H,
    rotation: 0,
    visible: true,
    properties: props,
  };
}

function prop(name, type, value) {
  return { name, type, value };
}

// ─── TOWN MAP ─────────────────────────────────────────────────────────────────
// 25×18 tile room with a small interior building (rows 5-9, cols 8-13)
// and three NPCs + one portal exit.

function buildTownWalls() {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = makeRow(COLS, 0);
    // outer border
    if (r === 0 || r === ROWS - 1) {
      row.fill(TILE_WALL);
    } else {
      row[0] = TILE_WALL;
      row[COLS - 1] = TILE_WALL;
    }

    // interior building: top wall (row 5, cols 8-13)
    if (r === 5) {
      for (let c = 8; c <= 13; c++) row[c] = TILE_WALL;
    }
    // interior building: side walls (rows 6-8, cols 8 and 13)
    if (r >= 6 && r <= 8) {
      row[8]  = TILE_WALL;
      row[13] = TILE_WALL;
    }
    // interior building: bottom wall with door gap (row 9, cols 8-9 and 12-13)
    if (r === 9) {
      row[8]  = TILE_WALL;
      row[9]  = TILE_WALL;
      row[12] = TILE_WALL;
      row[13] = TILE_WALL;
    }

    grid.push(row);
  }
  return grid;
}

function buildTownObjects() {
  return [
    obj(1,  'player_spawn',     'player_spawn', 12, 13, 1, 1),
    obj(2,  'Professor Phaser', 'npc',           3,  3, 1, 1, [
      prop('dialog', 'string',
        'Bem-vindo ao Phaser Quest!|Sou o Professor Phaser. Vou te ensinar sobre Scenes.|' +
        'Todo jogo Phaser começa com um objeto de configuração e new Phaser.Game(config).|' +
        'Cada Scene possui três métodos principais: preload(), create() e update().|' +
        'preload() carrega os assets. create() monta a cena. update() roda a cada frame.'),
    ]),
    obj(3,  'Professora Assets', 'npc',          20, 14, 1, 1, [
      prop('dialog', 'string',
        'Olá! Sou a Professora Assets.|Em Phaser, carregamos assets no método preload().|' +
        'Uma boa prática é guardar os caminhos em um arquivo assets.json!|' +
        'Assim você gerencia todos os recursos sem alterar o código.|' +
        'Use this.load.image(), this.load.spritesheet(), this.load.audio()...'),
    ]),
    obj(4,  'Professor Tiled',  'npc',          11,  7, 1, 1, [
      prop('dialog', 'string',
        'Psiu! Vem cá...|Este mapa foi criado com o Tiled Map Editor!|' +
        'Você pode criar camadas de tiles, objetos e propriedades personalizadas.|' +
        'Phaser carrega mapas Tiled com this.load.tilemapTiledJSON().|' +
        'Depois use map.createLayer() e setCollisionByExclusion([-1]) para colisões!'),
    ]),
    obj(5,  'dungeon_portal',   'portal',       12, 16, 1, 1, [
      prop('target', 'string', 'DungeonScene'),
    ]),
  ];
}

// ─── DUNGEON MAP ──────────────────────────────────────────────────────────────
// Same size as town. Four 2×2 pillar blocks and a return portal.

function buildDungeonWalls() {
  const PILLARS = [
    { r: 4, c: 4 }, { r: 4, c: 5 }, { r: 5, c: 4 }, { r: 5, c: 5 },   // top-left
    { r: 4, c: 19 },{ r: 4, c: 20},{ r: 5, c: 19 },{ r: 5, c: 20 },   // top-right
    { r: 12, c: 4 },{ r: 12, c: 5 },{ r: 13, c: 4 },{ r: 13, c: 5 },  // bot-left
    { r: 12, c: 19},{ r: 12, c: 20},{ r: 13, c: 19},{ r: 13, c: 20},  // bot-right
  ];
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const row = makeRow(COLS, 0);
    if (r === 0 || r === ROWS - 1) {
      row.fill(TILE_WALL);
    } else {
      row[0] = TILE_WALL;
      row[COLS - 1] = TILE_WALL;
    }
    PILLARS.filter(p => p.r === r).forEach(p => { row[p.c] = TILE_WALL; });
    grid.push(row);
  }
  return grid;
}

function buildDungeonObjects() {
  return [
    obj(1, 'player_spawn',       'player_spawn', 12,  2, 1, 1),
    obj(2, 'enemy_patrol',       'enemy',         6,  8, 1, 1, [
      prop('range', 'int', 4),
    ]),
    obj(3, 'enemy_patrol',       'enemy',        18,  8, 1, 1, [
      prop('range', 'int', 4),
    ]),
    obj(4, 'Professor Dungeon',  'npc',           3, 13, 1, 1, [
      prop('dialog', 'string',
        'Sobreviveu até aqui! Impressionante.|Veja esses inimigos — são instâncias da classe Enemy!|' +
        'Em Phaser, usamos classes para representar entidades do jogo.|' +
        'Cada entidade estende Phaser.Physics.Arcade.Sprite.|' +
        'Com orientação a objetos, o código fica reutilizável e organizado.'),
    ]),
    obj(5, 'Professor Classes',  'npc',          21, 13, 1, 1, [
      prop('dialog', 'string',
        'Olá! Sou o Professor Classes.|Em Phaser, você pode criar grupos de físicas para gerenciar entidades.|' +
        'Use this.physics.add.group() para grupos dinâmicos.|' +
        'Colisores e overlaps conectam grupos entre si.|' +
        'this.physics.add.collider(player, walls) — simples assim!'),
    ]),
    obj(6, 'town_portal',        'portal',       12, 15, 1, 1, [
      prop('target', 'string', 'GameScene'),
    ]),
  ];
}

// ─── map builder ─────────────────────────────────────────────────────────────

function buildMap(wallsGrid, objects) {
  const groundData = buildLayer(Array.from({ length: ROWS }, () => makeRow(COLS, TILE_FLOOR)));
  const wallsData  = buildLayer(wallsGrid);

  return {
    compressionlevel: -1,
    height: ROWS,
    width:  COLS,
    infinite: false,
    nextlayerid: 4,
    nextobjectid: objects.length + 1,
    orientation: 'orthogonal',
    renderorder: 'right-down',
    tiledversion: '1.10.2',
    tileheight: TILE_H,
    tilewidth:  TILE_W,
    type: 'map',
    version: '1.10',
    layers: [
      {
        id: 1, name: 'Ground', type: 'tilelayer',
        data: groundData,
        width: COLS, height: ROWS,
        x: 0, y: 0,
        opacity: 1, visible: true,
      },
      {
        id: 2, name: 'Walls', type: 'tilelayer',
        data: wallsData,
        width: COLS, height: ROWS,
        x: 0, y: 0,
        opacity: 1, visible: true,
      },
      {
        id: 3, name: 'Objects', type: 'objectgroup',
        draworder: 'topdown',
        objects,
        x: 0, y: 0,
        opacity: 1, visible: true,
      },
    ],
    tilesets: [
      {
        columns: 2,
        firstgid: 1,
        image: '../tilesets/tileset.png',
        imageheight: TILE_H,
        imagewidth: TILE_W * 2,
        margin: 0,
        name: 'tileset',
        spacing: 0,
        tilecount: 2,
        tileheight: TILE_H,
        tilewidth:  TILE_W,
      },
    ],
  };
}

// ─── write files ──────────────────────────────────────────────────────────────

const OUT = path.join(__dirname, '..', 'assets', 'maps');

const townMap    = buildMap(buildTownWalls(),    buildTownObjects());
const dungeonMap = buildMap(buildDungeonWalls(), buildDungeonObjects());

fs.writeFileSync(path.join(OUT, 'town.json'),    JSON.stringify(townMap,    null, 2));
fs.writeFileSync(path.join(OUT, 'dungeon.json'), JSON.stringify(dungeonMap, null, 2));

console.log('✅  assets/maps/town.json');
console.log('✅  assets/maps/dungeon.json');
