import { EventBus } from '../core/EventBus.js';
import { isDebug } from '../utils/url.js';

const CLICK_MOVE_THRESHOLD_MOUSE = 6;
const CLICK_MOVE_THRESHOLD_TOUCH = 12;
const CLICK_MAX_MS = 250;

function toNDC(clientX, clientY) {
  return {
    x:  (clientX / window.innerWidth)  * 2 - 1,
    y: -(clientY / window.innerHeight) * 2 + 1,
  };
}

export class InputRouter {
  constructor(canvas) {
    this._canvas      = canvas;
    this._pointer     = null;
    this._activePointers = 0;
    this._keysDown    = new Set();

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp   = this._onPointerUp.bind(this);
    this._onWheel       = this._onWheel.bind(this);
    this._onKeyDown     = this._onKeyDown.bind(this);
    this._onKeyUp       = this._onKeyUp.bind(this);
    this._onResize      = this._onResize.bind(this);
  }

  init() {
    this._canvas.addEventListener('pointerdown', this._onPointerDown);
    this._canvas.addEventListener('pointermove', this._onPointerMove);
    this._canvas.addEventListener('pointerup',   this._onPointerUp);
    this._canvas.addEventListener('wheel',       this._onWheel, { passive: false });
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup',   this._onKeyUp);
    window.addEventListener('resize',  this._onResize);
  }

  dispose() {
    this._canvas.removeEventListener('pointerdown', this._onPointerDown);
    this._canvas.removeEventListener('pointermove', this._onPointerMove);
    this._canvas.removeEventListener('pointerup',   this._onPointerUp);
    this._canvas.removeEventListener('wheel',       this._onWheel);
    window.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('keyup',   this._onKeyUp);
    window.removeEventListener('resize',  this._onResize);
  }

  isKeyDown(code) { return this._keysDown.has(code); }

  // ── Private ──────────────────────────────────────────────────────────────

  _onPointerDown(e) {
    this._activePointers++;
    if (this._activePointers > 1) return;  // multi-touch → orbit only
    this._pointer = {
      id:       e.pointerId,
      x:        e.clientX,
      y:        e.clientY,
      t:        performance.now(),
      dragging: false,
      touch:    e.pointerType === 'touch',
    };
    if (isDebug) console.log('[InputRouter] pointerdown', this._pointer);
  }

  _onPointerMove(e) {
    if (!this._pointer || e.pointerId !== this._pointer.id) return;
    const threshold = this._pointer.touch
      ? CLICK_MOVE_THRESHOLD_TOUCH
      : CLICK_MOVE_THRESHOLD_MOUSE;
    const dx = e.clientX - this._pointer.x;
    const dy = e.clientY - this._pointer.y;
    if (!this._pointer.dragging && Math.hypot(dx, dy) > threshold) {
      this._pointer.dragging = true;
      EventBus.emit('input:drag', { dx, dy, ndc: toNDC(e.clientX, e.clientY) });
      if (isDebug) console.log('[InputRouter] drag start');
    }
  }

  _onPointerUp(e) {
    this._activePointers = Math.max(0, this._activePointers - 1);
    if (!this._pointer || e.pointerId !== this._pointer.id) return;
    const elapsed = performance.now() - this._pointer.t;
    if (!this._pointer.dragging && elapsed < CLICK_MAX_MS) {
      const ndc = toNDC(e.clientX, e.clientY);
      const payload = {
        ndc,
        modifiers: { shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey },
      };
      EventBus.emit('input:click', payload);
      if (isDebug) console.log('[InputRouter] click', payload);
    }
    this._pointer = null;
  }

  _onWheel(e) {
    let dy = e.deltaY;
    if (e.deltaMode === 1) dy *= 33.3;       // lines → pixels
    if (e.deltaMode === 2) dy *= window.innerHeight;  // pages → pixels
    dy /= 100;
    const ndc = toNDC(e.clientX, e.clientY);
    EventBus.emit('input:wheel', { dy, ndc });
    if (isDebug) console.log('[InputRouter] wheel', { dy, ndc });
  }

  _onKeyDown(e) {
    const active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    this._keysDown.add(e.code);
    EventBus.emit('input:key', { code: e.code, action: 'down', modifiers: { shift: e.shiftKey } });
    if (isDebug) console.log('[InputRouter] keydown', e.code);
  }

  _onKeyUp(e) {
    this._keysDown.delete(e.code);
    EventBus.emit('input:key', { code: e.code, action: 'up', modifiers: { shift: e.shiftKey } });
  }

  _onResize() {
    EventBus.emit('input:resize', { w: window.innerWidth, h: window.innerHeight });
  }
}
