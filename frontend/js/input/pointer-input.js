"use strict";

// Мышь и сенсорный ввод

function onCanvasContextMenu(event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();

      if (isBoardInputSuppressed()) return;
      if (event.sourceCapabilities?.firesTouchEvents) return;

      const cell = getCellAtCanvasPoint(event.clientX, event.clientY);
      if (!cell || shouldIgnoreCellActivation(cell) || state.longPressTriggered) return;

      toggleFlag(cell);
    }
function onCanvasPointerDown(event) {
      if (isBoardInputSuppressed()) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        return;
      }

      if (event.pointerType === "mouse" && event.button !== 0) return;

      const cell = getCellAtCanvasPoint(event.clientX, event.clientY);
      if (!cell) return;

      canvasPointerCell = cell;
      canvasPointerStart = { x: event.clientX, y: event.clientY };

      state.longPressTriggered = false;
      clearTimeout(state.longPressTimer);

      state.longPressTimer = setTimeout(() => {
        const currentCell = canvasPointerCell;
        if (!currentCell) return;

        state.longPressTriggered = true;
        const key = cellKey(currentCell.row, currentCell.col);
        state.ignoreActivation = { key, until: Date.now() + 220 };

        toggleFlag(currentCell);
      }, LONG_PRESS_MS);
    }
function onCanvasPointerMove(event) {
      if (!canvasPointerStart) return;

      const dx = Math.abs(event.clientX - canvasPointerStart.x);
      const dy = Math.abs(event.clientY - canvasPointerStart.y);

      if (dx > 10 || dy > 10) {
        clearLongPressTimer();
        canvasPointerCell = null;
      }
    }
function onCanvasPointerUp(event) {
      if (isBoardInputSuppressed()) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
        clearLongPressTimer();
        canvasPointerCell = null;
        canvasPointerStart = null;
        return;
      }

      const cell = getCellAtCanvasPoint(event.clientX, event.clientY);
      const pressedCell = canvasPointerCell;

      clearLongPressTimer();
      canvasPointerCell = null;
      canvasPointerStart = null;

      if (!cell || !pressedCell || cell !== pressedCell) {
        state.longPressTriggered = false;
        return;
      }

      if (shouldIgnoreCellActivation(cell) || state.longPressTriggered) {
        state.longPressTriggered = false;
        return;
      }

      if (state.flagMode) toggleFlag(cell);
      else openCell(cell);
    }
function onCanvasPointerCancel() {
      clearLongPressTimer();
      canvasPointerCell = null;
      canvasPointerStart = null;
    }
function clearLongPressTimer() {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
function shouldIgnoreCellActivation(cell) {
      const now = Date.now();
      const key = cellKey(cell.row, cell.col);

      if (state.ignoreActivation && state.ignoreActivation.key === key && now < state.ignoreActivation.until) {
        return true;
      }

      if (state.ignoreActivation && now >= state.ignoreActivation.until) {
        state.ignoreActivation = { key: "", until: 0 };
      }

      return false;
    }
