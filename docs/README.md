# Phaser Quest — Guia Completo de Live Coding

> Um jogo 2D top-down criado para **ensinar Phaser 3** a alunos do primeiro período de faculdade.  
> Todos os conceitos são demonstrados por código real e executável — sem frameworks extras, sem bundlers.

---

## Sumário

1. [Visão geral do projeto](#1-visão-geral-do-projeto)
2. [Como rodar localmente](#2-como-rodar-localmente)
3. [Estrutura de arquivos](#3-estrutura-de-arquivos)
4. [Conceitos ensinados — ordem sugerida para live coding](#4-conceitos-ensinados--ordem-sugerida-para-live-coding)
5. [config.js — Configurações globais](#5-configjs--configurações-globais)
6. [main.js — Ponto de entrada](#6-mainjs--ponto-de-entrada)
7. [Ciclo de vida de uma Scene](#7-ciclo-de-vida-de-uma-scene)
8. [BootScene e PreloadScene — carregando assets](#8-bootscene-e-preloadscene--carregando-assets)
9. [assets.json — manifesto de assets](#9-assetsjson--manifesto-de-assets)
10. [Phaser.Physics.Arcade.Sprite — entidades com física](#10-phaserphysicsarcadesprite--entidades-com-física)
11. [Player — entrada do teclado e interação](#11-player--entrada-do-teclado-e-interação)
12. [NPC e dialogs](#12-npc-e-dialogs)
13. [Enemy — patrulha simples](#13-enemy--patrulha-simples)
14. [Tiled Map Editor — mapas no Phaser](#14-tiled-map-editor--mapas-no-phaser)
15. [BaseGameScene — herança para evitar repetição](#15-basegamescene--herança-para-evitar-repetição)
16. [Transições de cena com fade](#16-transições-de-cena-com-fade)
17. [UIScene — cena paralela para HUD e diálogos](#17-uiscene--cena-paralela-para-hud-e-diálogos)
18. [Comunicação entre scenes — event bus](#18-comunicação-entre-scenes--event-bus)
19. [Substituindo os placeholders por assets reais](#19-substituindo-os-placeholders-por-assets-reais)
20. [Publicando no GitHub Pages](#20-publicando-no-github-pages)
21. [Roteiro de live coding (passo a passo)](#21-roteiro-de-live-coding-passo-a-passo)

---

## 1. Visão geral do projeto

**Phaser Quest** é um RPG top-down minimalista com dois mapas: uma _cidade_ e uma _dungeon_.

| Funcionalidade                           | Como é demonstrada                                               |
| ---------------------------------------- | ---------------------------------------------------------------- |
| Configurações globais                    | `src/config.js` — uma única fonte da verdade                     |
| Carregamento de assets via JSON          | `assets/assets.json` + `PreloadScene`                            |
| Separação de arquivos por funcionalidade | `scenes/`, `entities/`, `ui/`, `utils/`                          |
| Entidades como classes                   | `Player`, `NPC`, `Enemy` estendem `Phaser.Physics.Arcade.Sprite` |
| Herança para reaproveitamento            | `BaseGameScene` ← `GameScene` / `DungeonScene`                   |
| Mapas Tiled com colisão                  | Camada _Walls_ + `setCollisionByExclusion([-1])`                 |
| Spawns via camada de objetos do Tiled    | `map.getObjectLayer('Objects').objects`                          |
| Transição de cenas                       | `cameras.main.fadeOut` + `scene.start()`                         |
| Scene paralela (HUD/dialog)              | `scene.launch(SCENES.UI)`                                        |
| Comunicação entre scenes                 | `this.game.events.emit/on`                                       |
| Física arcade                            | Colisores (`add.collider`) e overlaps (`add.overlap`)            |

---

## 2. Como rodar localmente

### Pré-requisitos

- [Node.js](https://nodejs.org) (para gerar os mapas e servir arquivos)
- VS Code com a extensão **Live Server** (recomendado)

### Passos

```bash
# 1. Clone ou copie o projeto
cd aulao-de-phaser-1

# 2. (Re)gere os mapas placeholder se necessário
node tools/generate-maps.js

# 3. Sirva os arquivos com qualquer servidor HTTP local
#    Opção A — VS Code: clique direito em index.html → "Open with Live Server"
#    Opção B — Node.js:
npx serve .
#    Opção C — Python:
python -m http.server 8080
```

> **Por que precisa de um servidor?**  
> Módulos ES (`type="module"`) e `fetch()` são bloqueados pelo navegador quando  
> abertos via `file://`. Um servidor HTTP resolve isso.

---

## 3. Estrutura de arquivos

```
aulao-de-phaser-1/
│
├── index.html                 ← Único HTML; carrega Phaser via CDN
│
├── assets/
│   ├── assets.json            ← Manifesto de assets (LEIA AQUI)
│   ├── maps/
│   │   ├── town.json          ← Mapa Tiled da cidade
│   │   └── dungeon.json       ← Mapa Tiled da dungeon
│   ├── tilesets/              ← tileset.png (forneça o seu)
│   ├── sprites/               ← spritesheets do player e NPCs
│   └── audio/                 ← músicas e efeitos sonoros
│
├── src/
│   ├── main.js                ← new Phaser.Game(config)
│   ├── config.js              ← TODAS as constantes do jogo
│   │
│   ├── scenes/
│   │   ├── BootScene.js       ← Carrega assets.json
│   │   ├── PreloadScene.js    ← Carrega todos os assets + placeholders
│   │   ├── MenuScene.js       ← Tela de título
│   │   ├── BaseGameScene.js   ← Lógica compartilhada entre cenas de jogo
│   │   ├── GameScene.js       ← Cidade (herda BaseGameScene)
│   │   ├── DungeonScene.js    ← Dungeon (herda BaseGameScene + adiciona inimigos)
│   │   └── UIScene.js         ← HUD e dialogs (cena paralela)
│   │
│   ├── entities/
│   │   ├── Player.js          ← Entrada, movimento, interação
│   │   ├── NPC.js             ← Personagem com diálogo
│   │   └── Enemy.js           ← Inimigo com patrulha
│   │
│   └── ui/
│       └── DialogBox.js       ← Caixa de diálogo paginada
│
├── tools/
│   └── generate-maps.js       ← Script Node.js que gera os JSON do Tiled
│
└── docs/
    └── README.md              ← Este arquivo
```

---

## 4. Conceitos ensinados — ordem sugerida para live coding

```
1. Phaser.Game + config            → main.js
2. Scenes e ciclo de vida          → BootScene, PreloadScene
3. Configurações globais           → config.js
4. Manifesto de assets (JSON)      → assets.json + PreloadScene
5. Texturas placeholder            → PreloadScene._generatePlaceholderTextures()
6. Tela de menu                    → MenuScene
7. Classes de entidade             → Player.js
8. Física Arcade                   → Player + GameScene
9. Tiled: tilemaps e colisão       → BaseGameScene._buildMap()
10. Tiled: camada de objetos       → BaseGameScene._spawnFromObjectLayer()
11. NPCs e diálogos                → NPC.js + UIScene
12. Herança de Scene               → BaseGameScene → GameScene/DungeonScene
13. Inimigos e patrulha            → Enemy.js + DungeonScene
14. Transição com fade             → BaseGameScene._onPortalEnter()
15. Cena paralela (UIScene)        → scene.launch() em MenuScene
16. Event bus entre scenes         → game.events.emit/on
```

---

## 5. config.js — Configurações globais

**Princípio:** nunca coloque "números mágicos" espalhados pelo código.  
Centralizar tudo em `config.js` facilita ajustes e evita bugs difíceis de achar.

```js
// src/config.js
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const TILE_SIZE = 32;
export const PLAYER_SPEED = 160;

export const SCENES = {
  BOOT: "Boot",
  PRELOAD: "Preload",
  MENU: "Menu",
  GAME: "GameScene",
  DUNGEON: "DungeonScene",
  UI: "UI",
};
```

> **Dica de live coding:** mostre o que acontece quando a velocidade do player  
> está hard-coded em 5 arquivos diferentes vs. centralizada em `config.js`.

---

## 6. main.js — Ponto de entrada

```js
// src/main.js
import { BootScene } from "./scenes/BootScene.js";
// ... outros imports

const config = {
  type: Phaser.AUTO, // WebGL se disponível, senão Canvas
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scene: [BootScene, PreloadScene, MenuScene, GameScene, DungeonScene, UIScene],
};

new Phaser.Game(config);
```

**Pontos a destacar:**

| Propriedade         | O que ensina                                         |
| ------------------- | ---------------------------------------------------- |
| `type: Phaser.AUTO` | Phaser detecta automaticamente o melhor renderer     |
| `physics.arcade`    | Física simples AABB — ideal para top-down 2D         |
| `scene: [...]`      | A primeira scene da lista é iniciada automaticamente |

---

## 7. Ciclo de vida de uma Scene

```
Phaser.Scene
    │
    ├── init(data)      → chamado ao iniciar; recebe dados de scene.start(key, data)
    ├── preload()       → carregamento de assets (load.*)
    ├── create()        → montagem inicial (sprites, groups, colliders...)
    └── update(t, dt)   → loop de jogo (~60x por segundo)
```

Cada método tem uma responsabilidade clara — misturá-los cria código confuso.

---

## 8. BootScene e PreloadScene — carregando assets

### Por que duas scenes?

| Scene            | Responsabilidade                                                    |
| ---------------- | ------------------------------------------------------------------- |
| **BootScene**    | Carrega APENAS o manifesto `assets.json` (arquivo minúsculo)        |
| **PreloadScene** | Lê o manifesto e carrega TODOS os assets; mostra barra de progresso |

Separar assim garante que a tela nunca fique em branco e que o código de loading seja reutilizável.

### Barra de progresso simples

```js
// src/scenes/PreloadScene.js
preload() {
  const bar = this.add.rectangle(400, 300, 0, 20, 0x3399ff).setOrigin(0, 0.5);

  this.load.on('progress', (value) => {
    bar.width = 320 * value;  // 0% → 0px, 100% → 320px
  });

  // Carrega os assets do manifesto...
}
```

---

## 9. assets.json — manifesto de assets

```json
{
  "images": [],
  "spritesheets": [],
  "tilemaps": [
    { "key": "town", "path": "assets/maps/town.json" },
    { "key": "dungeon", "path": "assets/maps/dungeon.json" }
  ],
  "tilesets": [{ "key": "tileset", "path": "assets/tilesets/tileset.png" }],
  "audio": []
}
```

**Por que JSON em vez de código?**

- Designers e artistas podem editar sem tocar em código JavaScript.
- Fácil de versionar e comparar mudanças com `git diff`.
- `PreloadScene` lê o manifesto e carrega tudo dinamicamente:

```js
manifest.tilesets.forEach(({ key, path }) => {
  this.load.image(key, path);
});
```

---

## 10. Phaser.Physics.Arcade.Sprite — entidades com física

```
                    Phaser.GameObjects.GameObject
                              │
                    Phaser.GameObjects.Sprite
                              │
                Phaser.Physics.Arcade.Sprite   ←── Player, Enemy
```

```js
export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "player"); // chave da textura

    scene.add.existing(this); // adiciona ao display list da scene
    scene.physics.add.existing(this); // cria um physics body para ele

    this.setCollideWorldBounds(true); // não sai do mapa
  }
}
```

**Hierarquia de classes** é uma boa prática porque:

- Cada entidade encapsula sua própria lógica
- A scene não precisa saber _como_ o player se move — só chama `player.update()`
- Fácil de trocar implementações sem quebrar nada

---

## 11. Player — entrada do teclado e interação

```js
// Criação dos controles
this._cursors = scene.input.keyboard.createCursorKeys();  // ↑↓←→
this._wasd    = scene.input.keyboard.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D' });

// Movimento no update()
update() {
  let vx = 0, vy = 0;
  if (this._cursors.left.isDown  || this._wasd.left.isDown)  vx = -PLAYER_SPEED;
  if (this._cursors.right.isDown || this._wasd.right.isDown) vx =  PLAYER_SPEED;
  // ...
  this.setVelocity(vx, vy);
}
```

**Diagonal mais lenta (normalização):**

```js
if (vx !== 0 && vy !== 0) {
  vx *= Math.SQRT1_2; // ≈ 0.707
  vy *= Math.SQRT1_2;
}
```

**Tecla de interação com `JustDown`:**

```js
// JustDown → true apenas no PRIMEIRO frame em que a tecla é pressionada
if (Phaser.Input.Keyboard.JustDown(this._interactKey)) {
  this.emit("interact", closestObject);
}
```

---

## 12. NPC e dialogs

### Dados de diálogo no Tiled

No **Tiled Map Editor**, crie um objeto na camada _Objects_ com:

| Campo                         | Valor                          |
| ----------------------------- | ------------------------------ |
| **Type**                      | `npc`                          |
| **Name**                      | `Professor Phaser`             |
| Propriedade `dialog` (string) | `Página 1\|Página 2\|Página 3` |

O separador `|` divide a string em páginas:

```js
// src/entities/NPC.js
this.dialogPages = dialogRaw.split("|").map((s) => s.trim());
```

### Fluxo de diálogo

```
Player pressiona E
    │
    ▼
Player.emit('interact', npc)
    │
    ▼
GameScene._onPlayerInteract(npc)
    │
    ▼
game.events.emit('dialog:open', { speaker, pages })
    │
    ▼
UIScene ouve o evento → DialogBox.open(data)
    │
    ▼
Player.blocked = true  (não pode se mover)
    │
    ▼
E / Espaço avança páginas → na última: DialogBox.hide()
    │
    ▼
game.events.emit('dialog:close')
    │
    ▼
Player.blocked = false
```

---

## 13. Enemy — patrulha simples

```js
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, range = 4) {
    super(scene, x, y, "enemy");
    // ...
    this._leftBound = x - range * TILE_SIZE;
    this._rightBound = x + range * TILE_SIZE;
    this.setVelocityX(ENEMY_SPEED);
  }

  update() {
    if (this.x >= this._rightBound) this.setVelocityX(-ENEMY_SPEED);
    if (this.x <= this._leftBound) this.setVelocityX(ENEMY_SPEED);
  }
}
```

**No Tiled**, o objeto inimigo tem a propriedade `range` (int) que define quantos  
tiles ele patrulha para cada lado. Isso evita hard-code de posições no código.

---

## 14. Tiled Map Editor — mapas no Phaser

### Configuração do Tiled

1. **Novo mapa:** `Arquivo → Novo mapa`
   - Orientação: Ortogonal
   - Tamanho do tile: 32×32
   - Tamanho do mapa: quantos tiles quiser

2. **Tileset:** `Mapa → Novo Tileset → imagem tileset.png`

3. **Camadas necessárias:**

   | Nome      | Tipo         | Para quê                                  |
   | --------- | ------------ | ----------------------------------------- |
   | `Ground`  | Tile Layer   | Piso — sem colisão                        |
   | `Walls`   | Tile Layer   | Paredes — colisão automática              |
   | `Objects` | Object Layer | Spawns de player, NPCs, portais, inimigos |

4. **Exportar:** `Arquivo → Exportar como → JSON (*.json)`  
   Salve em `assets/maps/nome-do-mapa.json`.

### Carregar no Phaser

```js
// PreloadScene.preload()
this.load.tilemapTiledJSON("town", "assets/maps/town.json");
this.load.image("tileset", "assets/tilesets/tileset.png");

// GameScene.create()
const map = this.make.tilemap({ key: "town" });
const tileset = map.addTilesetImage("tileset", "tileset"); // (nomeTiled, chavePhaer)

const ground = map.createLayer("Ground", tileset, 0, 0);
const walls = map.createLayer("Walls", tileset, 0, 0);

// Qualquer tile não-vazio na camada Walls é sólido
walls.setCollisionByExclusion([-1]);

// Conectar o player à colisão
this.physics.add.collider(this.player, walls);
```

### Ler objetos do Tiled

```js
const objectLayer = map.getObjectLayer("Objects");

objectLayer.objects.forEach((obj) => {
  if (obj.type === "npc") {
    const dialogRaw = obj.properties.find((p) => p.name === "dialog").value;
    new NPC(this, obj.x, obj.y, obj.name, dialogRaw);
  }
});
```

> **Posição Y no Tiled:** a coordenada Y de um objeto Tiled aponta para a borda  
> _inferior_ do tile. Somamos `- TILE_SIZE / 2` para centrar o sprite.

---

## 15. BaseGameScene — herança para evitar repetição

`GameScene` e `DungeonScene` têm o mesmo fluxo de criação:  
mapa → player → NPCs → portais → colisores → câmera.

Em vez de copiar esse código, ambas herdam de `BaseGameScene`:

```
BaseGameScene (lógica compartilhada)
    ├── GameScene    (cidade;  get mapKey() { return 'town' })
    └── DungeonScene (dungeon; get mapKey() { return 'dungeon' }
                               + sobrescreve _spawnEnemy())
```

```js
// Subclasse só precisa declarar o que muda
export class GameScene extends BaseGameScene {
  get mapKey() {
    return "town";
  }
  get tilesetKey() {
    return "tileset";
  }
  get bgColor() {
    return "#2d5a1b";
  }

  create() {
    super.create();
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }
}
```

---

## 16. Transições de cena com fade

```js
// Entrou em um portal → fade para preto → muda de scene
_onPortalEnter(portal) {
  if (this._transitioning) return;
  this._transitioning = true;

  this.cameras.main.fadeOut(500, 0, 0, 0);

  this.cameras.main.once('camerafadeoutcomplete', () => {
    this.scene.start(portal.targetScene);  // inicia a próxima scene
  });
}
```

A nova scene faz o fade de entrada:

```js
create() {
  super.create();
  this.cameras.main.fadeIn(500, 0, 0, 0);
}
```

---

## 17. UIScene — cena paralela para HUD e diálogos

```
MenuScene._startGame()
    │
    ├── this.scene.launch(SCENES.UI)   ← inicia UIScene sem parar a MenuScene
    └── this.scene.start(SCENES.GAME)  ← troca para GameScene
```

`scene.launch()` vs `scene.start()`:

| Método              | O que faz                                    |
| ------------------- | -------------------------------------------- |
| `scene.start(key)`  | Para a scene atual e inicia outra            |
| `scene.launch(key)` | Inicia outra scene EM PARALELO (ambas rodam) |

A UIScene fica viva durante toda a sessão de jogo — gerencia a `DialogBox`  
e responde a eventos do bus global.

---

## 18. Comunicação entre scenes — event bus

Scenes não devem ter referências diretas umas às outras. Usamos o  
**bus de eventos do jogo** (`this.game.events`) para comunicação desacoplada:

```js
// GameScene emite quando o player inicia um diálogo
this.game.events.emit("dialog:open", { speaker: "NPC", pages: ["..."] });

// UIScene escuta
this.game.events.on(
  "dialog:open",
  (data) => {
    this._dialog.open(data);
  },
  this,
);
```

**Vantagem:** GameScene não precisa saber que UIScene existe.  
Se você remover o HUD, o jogo continua funcionando.

---

## 19. Substituindo os placeholders por assets reais

O jogo vem com gráficos gerados por código (retângulos coloridos).  
Quando você tiver os assets reais, siga estes passos:

### Passo 1 — Adicione os arquivos

Coloque seus assets nas pastas:

```
assets/
  tilesets/tileset.png
  sprites/player.png
  sprites/npc.png
  sprites/enemy.png
  audio/bgm.ogg
```

### Passo 2 — Atualize o manifesto

```json
// assets/assets.json
{
  "spritesheets": [
    {
      "key": "player",
      "path": "assets/sprites/player.png",
      "frameWidth": 32,
      "frameHeight": 32
    },
    {
      "key": "npc",
      "path": "assets/sprites/npc.png",
      "frameWidth": 32,
      "frameHeight": 32
    },
    {
      "key": "enemy",
      "path": "assets/sprites/enemy.png",
      "frameWidth": 32,
      "frameHeight": 32
    }
  ],
  "tilesets": [{ "key": "tileset", "path": "assets/tilesets/tileset.png" }],
  "audio": [{ "key": "bgm", "path": "assets/audio/bgm.ogg" }]
}
```

### Passo 3 — Defina animações

No `PreloadScene.create()`, adicione:

```js
this.anims.create({
  key: "player-walk-down",
  frames: this.anims.generateFrameNumbers("player", { start: 0, end: 3 }),
  frameRate: 8,
  repeat: -1,
});
```

### Passo 4 — Use as animações no Player

```js
// src/entities/Player.js — no método _handleMovement()
if (vy < 0) this.play("player-walk-up", true);
if (vy > 0) this.play("player-walk-down", true);
if (vx < 0) this.play("player-walk-left", true);
if (vx > 0) this.play("player-walk-right", true);
if (vx === 0 && vy === 0) this.stop();
```

### Passo 5 — (Opcional) Remova a geração de placeholders

Em `PreloadScene._generatePlaceholderTextures()`, remova os blocos  
que geram texturas para as chaves que você agora carrega do disco.

---

## 20. Publicando no GitHub Pages

1. Inicialize um repositório Git:

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Crie um repositório no GitHub e faça push:

   ```bash
   git remote add origin https://github.com/SEU-USUARIO/aulao-de-phaser-1.git
   git push -u origin main
   ```

3. Ative o GitHub Pages:  
   `Settings → Pages → Source: Deploy from a branch → Branch: main / (root)`

4. Acesse em: `https://SEU-USUARIO.github.io/aulao-de-phaser-1/`

> Não é necessário nenhum processo de build — o projeto funciona diretamente  
> como arquivos estáticos porque usa Phaser via CDN e módulos ES nativos.

---

## 21. Roteiro de live coding (passo a passo)

Este roteiro está ordenado do mais simples ao mais complexo.  
Cada etapa deve ter um resultado visível antes de avançar.

---

### Etapa 1 — Estrutura e "Hello Phaser" (~10 min)

```
Criar:  index.html  (CDN do Phaser + <script type="module">)
        src/main.js (new Phaser.Game com scene vazia)
        src/config.js
```

**Resultado esperado:** janela preta com a cor de fundo do jogo.

---

### Etapa 2 — BootScene e PreloadScene (~15 min)

```
Criar:  src/scenes/BootScene.js
        src/scenes/PreloadScene.js
        assets/assets.json (vazio por enquanto)
```

Demonstre a barra de progresso e a geração de textures placeholder.

**Resultado esperado:** barra de loading que chega a 100%.

---

### Etapa 3 — MenuScene (~10 min)

```
Criar:  src/scenes/MenuScene.js
```

Mostre: textos, botão interativo, tweens, `cameras.main.fadeOut`.

**Resultado esperado:** tela de título com botão que responde ao mouse/teclado.

---

### Etapa 4 — Player e GameScene básica (~20 min)

```
Criar:  src/entities/Player.js
        src/scenes/BaseGameScene.js  (só _buildMap por enquanto)
        src/scenes/GameScene.js
```

Mostre: `Phaser.Physics.Arcade.Sprite`, `setVelocity`, `setCollideWorldBounds`,  
`createCursorKeys`, mapa Tiled carregado.

**Resultado esperado:** player azul se movendo pelo mapa sem atravessar paredes.

---

### Etapa 5 — NPCs e camada de objetos (~15 min)

```
Criar:  src/entities/NPC.js
Editar: src/scenes/BaseGameScene.js  (_spawnFromObjectLayer)
```

Mostre: `map.getObjectLayer`, leitura de propriedades customizadas do Tiled,  
indicador "!" com tween.

**Resultado esperado:** NPCs verdes no mapa com indicador piscando.

---

### Etapa 6 — Dialog system (~20 min)

```
Criar:  src/ui/DialogBox.js
        src/scenes/UIScene.js
Editar: src/scenes/MenuScene.js  (scene.launch(UI))
        src/scenes/BaseGameScene.js  (event bus + player.blocked)
```

Mostre: `scene.launch`, `game.events.emit/on`, `Container`, `JustDown`.

**Resultado esperado:** diálogo aparece ao pressionar E perto de um NPC.

---

### Etapa 7 — Transição de cena e DungeonScene (~20 min)

```
Criar:  src/scenes/DungeonScene.js
        src/entities/Enemy.js
Editar: tools/generate-maps.js  (portal no mapa)
```

Mostre: `cameras.main.fadeOut`, portal overlap, herança de scene, inimigos.

**Resultado esperado:** pressionar E no portal faz fade e abre o dungeon com inimigos patrulhando.

---

### Etapa 8 — Assets reais (quando fornecidos)

Siga a seção [19 — Substituindo os placeholders](#19-substituindo-os-placeholders-por-assets-reais).

---

_Bom live coding! 🎮_
