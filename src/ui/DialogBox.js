/**
 * DialogBox.js
 * -------------
 * Renders a paginated dialog box at the bottom of the screen.
 *
 * It is owned by UIScene and communicates with game scenes via the
 * global game event bus (this.scene.game.events).
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │ NPC Name                                │
 *   │ Dialog text goes here, multi-line...    │
 *   │                              ▼ PRÓXIMO  │
 *   └─────────────────────────────────────────┘
 */

import { GAME_WIDTH, GAME_HEIGHT, COLORS, EVENTS } from '../config.js';

const BOX_HEIGHT  = 130;
const BOX_MARGIN  = 16;
const BOX_Y       = GAME_HEIGHT - BOX_HEIGHT - BOX_MARGIN;
const TEXT_MARGIN = 16;

export class DialogBox {
  /**
   * @param {Phaser.Scene} scene - The UIScene that owns this box
   */
  constructor(scene) {
    this._scene  = scene;
    this._pages  = [];
    this._index  = 0;
    this._active     = false;
    this._canAdvance = false;

    this._buildGraphics();
    this.hide();
  }

  // ─── public API ───────────────────────────────────────────────────────────

  /**
   * Open the dialog with the given data.
   * @param {{ speaker: string, pages: string[] }} data
   */
  open(data) {
    this._pages  = data.pages;
    this._index     = 0;
    this._active    = true;
    this._canAdvance = false;  // block input on the same frame the dialog opens

    this._speakerText.setText(data.speaker);
    this._showPage(0);
    this._container.setVisible(true);

    // Parallel scenes process input AFTER the scene that opened the dialog runs
    // its update(). Without this delay the same keypress that opens the dialog
    // would immediately fire advance() and skip page 1 (or close a 1-page dialog).
    this._scene.time.delayedCall(100, () => { this._canAdvance = true; });
  }

  /** Advance to the next page, or close if on the last page. */
  next() {
    if (!this._active || !this._canAdvance) return;

    this._index++;
    if (this._index < this._pages.length) {
      this._showPage(this._index);
    } else {
      this.hide();
    }
  }

  hide() {
    this._active     = false;
    this._canAdvance = false;
    this._container.setVisible(false);

    // Notify game scenes that the dialog closed so player can move again
    this._scene.game.events.emit(EVENTS.DIALOG_CLOSE);
  }

  get isActive() {
    return this._active;
  }

  // ─── private ──────────────────────────────────────────────────────────────

  _buildGraphics() {
    const boxX = BOX_MARGIN;
    const boxW = GAME_WIDTH - BOX_MARGIN * 2;

    // Group everything in a Container so we can show/hide in one call
    this._container = this._scene.add.container(0, 0).setDepth(100);

    // Background panel
    const bg = this._scene.add.rectangle(
      boxX + boxW / 2, BOX_Y + BOX_HEIGHT / 2,
      boxW, BOX_HEIGHT,
      COLORS.DIALOG_BG, 0.88,
    );

    // Border
    const border = this._scene.add.rectangle(
      boxX + boxW / 2, BOX_Y + BOX_HEIGHT / 2,
      boxW, BOX_HEIGHT,
    )
      .setStrokeStyle(2, COLORS.DIALOG_BORDER, 1)
      .setFillStyle(0x000000, 0);

    // Speaker name
    this._speakerText = this._scene.add.text(
      boxX + TEXT_MARGIN,
      BOX_Y + TEXT_MARGIN,
      '',
      { fontSize: '14px', color: '#ffdd00', fontStyle: 'bold' },
    );

    // Dialog body text — wordWrap keeps it inside the box
    this._bodyText = this._scene.add.text(
      boxX + TEXT_MARGIN,
      BOX_Y + TEXT_MARGIN + 24,
      '',
      {
        fontSize: '14px',
        color: '#ffffff',
        wordWrap: { width: boxW - TEXT_MARGIN * 2 },
        lineSpacing: 4,
      },
    );

    // "▼ PRÓXIMO / FECHAR" hint at the bottom-right
    this._hintText = this._scene.add.text(
      boxX + boxW - TEXT_MARGIN,
      BOX_Y + BOX_HEIGHT - TEXT_MARGIN,
      '',
      { fontSize: '12px', color: '#aaaaaa' },
    ).setOrigin(1, 1);

    this._container.add([bg, border, this._speakerText, this._bodyText, this._hintText]);

    // Tween — slight bounce when text appears
    this._scene.tweens.add({
      targets:  this._container,
      alpha:    { from: 0, to: 1 },
      duration: 200,
      paused:   true,
      onStart:  () => this._container.setVisible(true),
    });
  }

  _showPage(index) {
    this._bodyText.setText(this._pages[index]);

    const isLast = index === this._pages.length - 1;
    this._hintText.setText(isLast ? 'E / ESPAÇO  Fechar' : 'E / ESPAÇO  Próximo ▼');
  }
}
