"use strict";

/*
  Управление пультом и клавиатурой для TV-поверхностей.
*/
(function setupTvRemoteControl() {
  const CENTER_KEYS = new Set(["Enter", " ", "Spacebar", "NumpadEnter", "OK", "Select"]);
  const BACK_KEYS = new Set(["Escape", "Backspace", "BrowserBack", "GoBack"]);
  const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Up", "Down", "Left", "Right"]);
  const CENTER_KEY_CODES = new Set([13, 23, 66]);
  const BACK_KEY_CODES = new Set([8, 27, 461, 10009]);
  const LONG_OK_MS = 560;
  const REMOTE_IDLE_HIDE_MS = 6500;

  const remote = {
    active: false,
    mode: "board",
    row: 0,
    col: 0,
    centerDown: false,
    centerLongFired: false,
    centerTimer: 0,
    lastGameId: -1,
    hintShown: false,
    idleTimer: 0,
    focusEl: null
  };

  function isCenterKey(event) {
    return CENTER_KEYS.has(event.key) || CENTER_KEY_CODES.has(event.keyCode);
  }

  function isBackKey(event) {
    return BACK_KEYS.has(event.key) || BACK_KEY_CODES.has(event.keyCode);
  }

  function isArrowKey(event) {
    return ARROW_KEYS.has(event.key);
  }

  function stopRemoteEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
  }

  function boardReady() {
    return Boolean(
      window.state || typeof state !== "undefined"
    ) && Boolean(state.board?.length) && state.currentScreen === "gameScreen" && !state.currentModal;
  }

  function canUseBoardRemote() {
    return boardReady() && ["idle", "playing"].includes(state.gameStatus) && !isBoardInputSuppressed();
  }

  function clearRemoteIdleTimer() {
    clearTimeout(remote.idleTimer);
    remote.idleTimer = 0;
  }

  function resetRemoteFocus(options = {}) {
    remote.row = 0;
    remote.col = 0;
    remote.active = false;
    remote.mode = "board";
    remote.centerDown = false;
    remote.centerLongFired = false;
    clearTimeout(remote.centerTimer);
    remote.centerTimer = 0;
    clearRemoteIdleTimer();
    hideRemoteFocusElement();

    if (options.redraw && typeof drawBoard === "function" && state.currentScreen === "gameScreen") {
      drawBoard();
    }
  }

  function hideRemoteFocus(options = {}) {
    if (!remote.active && !remote.centerDown) return;
    remote.active = false;
    remote.mode = "board";
    remote.centerDown = false;
    remote.centerLongFired = false;
    clearTimeout(remote.centerTimer);
    remote.centerTimer = 0;
    clearRemoteIdleTimer();
    hideRemoteFocusElement();

    if (options.redraw && typeof drawBoard === "function" && state.currentScreen === "gameScreen") {
      drawBoard();
    }
  }

  function scheduleRemoteIdleHide() {
    clearRemoteIdleTimer();
    remote.idleTimer = window.setTimeout(() => {
      hideRemoteFocus({ redraw: true });
    }, REMOTE_IDLE_HIDE_MS);
  }

  function clampFocus() {
    if (!state.board?.length) return;
    const rows = state.board.length;
    const cols = state.board[0]?.length || 0;
    remote.row = Math.max(0, Math.min(rows - 1, remote.row));
    remote.col = Math.max(0, Math.min(cols - 1, remote.col));
  }

  function ensureRemoteFocus() {
    if (remote.lastGameId !== state.gameId) {
      remote.lastGameId = state.gameId;
      remote.row = 0;
      remote.col = 0;
    }
    clampFocus();
    remote.mode = "board";
    remote.active = true;
    scheduleRemoteIdleHide();
  }

  function getFocusedCell() {
    if (!state.board?.length) return null;
    clampFocus();
    return state.board[remote.row]?.[remote.col] || null;
  }

  function getAssistantInsetPx() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--smartapp-assistant-inset");
    const value = Number.parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
  }


  function readCssColor(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function scrollFocusedCellIntoView() {
    if (!boardCanvas || !el.boardWrap || !state.board?.length) return;

    const step = boardMetrics.cellSize + boardMetrics.gap;
    const cellLeft = boardMetrics.innerPad + remote.col * step;
    const cellTop = boardMetrics.innerPad + remote.row * step;
    const cellRight = cellLeft + boardMetrics.cellSize;
    const cellBottom = cellTop + boardMetrics.cellSize;

    // Horizontal scroll lives inside boardWrap on medium/hard boards.
    const wrap = el.boardWrap;
    if (wrap.scrollWidth > wrap.clientWidth) {
      const targetLeft = Math.max(0, cellLeft - (wrap.clientWidth - boardMetrics.cellSize) / 2);
      const maxLeft = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
      wrap.scrollLeft = Math.min(maxLeft, targetLeft);
    }

    // При вертикальном скролле выбранная клетка остаётся выше панели ассистента.
    const canvasRect = boardCanvas.getBoundingClientRect();
    const viewportTop = 12;
    const viewportBottom = window.innerHeight - getAssistantInsetPx() - 28;
    const absoluteCellTop = canvasRect.top + cellTop;
    const absoluteCellBottom = canvasRect.top + cellBottom;

    if (absoluteCellTop < viewportTop) {
      window.scrollBy({ top: absoluteCellTop - viewportTop - 8, behavior: "auto" });
    } else if (absoluteCellBottom > viewportBottom) {
      window.scrollBy({ top: absoluteCellBottom - viewportBottom + 8, behavior: "auto" });
    }
  }

  function showRemoteHintOnce() {
  // Пульт не добавляет собственные игровые уведомления.
  }

  function moveBoardFocus(key) {
    ensureRemoteFocus();
    if (key === "ArrowUp" || key === "Up") remote.row -= 1;
    if (key === "ArrowDown" || key === "Down") remote.row += 1;
    if (key === "ArrowLeft" || key === "Left") remote.col -= 1;
    if (key === "ArrowRight" || key === "Right") remote.col += 1;
    clampFocus();
    drawRemoteFocus();
    scrollFocusedCellIntoView();
    showRemoteHintOnce();
  }

  function activateFocusedCell() {
    if (!canUseBoardRemote()) return;
    ensureRemoteFocus();
    const cell = getFocusedCell();
    if (!cell) return;
    if (state.flagMode) toggleFlag(cell);
    else openCell(cell);
    requestAnimationFrame(drawRemoteFocus);
  }

  function toggleFocusedFlag() {
    if (!canUseBoardRemote()) return;
    ensureRemoteFocus();
    const cell = getFocusedCell();
    if (!cell) return;
    toggleFlag(cell);
    requestAnimationFrame(drawRemoteFocus);
  }


  function ensureRemoteFocusElement() {
    if (remote.focusEl && remote.focusEl.isConnected) return remote.focusEl;
    if (!el.board) return null;

    const focusEl = document.createElement("div");
    focusEl.className = "remote-focus-cell";
    focusEl.setAttribute("aria-hidden", "true");
    el.board.appendChild(focusEl);
    remote.focusEl = focusEl;
    return focusEl;
  }

  function hideRemoteFocusElement() {
    if (remote.focusEl) {
      remote.focusEl.hidden = true;
      remote.focusEl.classList.remove("flag-mode");
    }
  }

  function drawRemoteFocus() {
    if (!remote.active || !state.board?.length || state.currentScreen !== "gameScreen" || state.currentModal) {
      hideRemoteFocusElement();
      return;
    }

    const cell = getFocusedCell();
    const focusEl = ensureRemoteFocusElement();
    if (!cell || !focusEl || !boardMetrics) {
      hideRemoteFocusElement();
      return;
    }

    const { cellSize, gap, innerPad } = boardMetrics;
    const x = innerPad + cell.col * (cellSize + gap) + 2;
    const y = innerPad + cell.row * (cellSize + gap) + 2;
    const size = Math.max(8, cellSize - 4);
    const radius = Math.max(7, Math.round(cellSize * 0.24));

    focusEl.hidden = false;
    focusEl.classList.toggle("flag-mode", Boolean(state.flagMode));
    focusEl.style.width = `${size}px`;
    focusEl.style.height = `${size}px`;
    focusEl.style.borderRadius = `${radius}px`;
    focusEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  function getFocusableScope() {
    if (state.currentModal) return el.modalBackdrop;
    return document.querySelector(".screen.active") || document.body;
  }

  function getFocusableElements(scope = getFocusableScope()) {
    return Array.from(scope.querySelectorAll([
      "button:not([disabled]):not([hidden])",
      "[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "[tabindex]:not([tabindex='-1'])"
    ].join(","))).filter((node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    });
  }

  function getGameHudButtons() {
    if (state.currentScreen !== "gameScreen" || state.currentModal) return [];
    return Array.from(document.querySelectorAll("#gameScreen .topbar button")).filter((button) => {
      const rect = button.getBoundingClientRect();
      const style = getComputedStyle(button);
      return !button.disabled && !button.hidden && rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    });
  }

  function chooseHudButtonFromBoardColumn(buttons) {
    if (!buttons.length || !state.board?.length) return buttons[0] || null;
    const cols = state.board[0]?.length || 1;
    const ratio = cols <= 1 ? 0 : remote.col / (cols - 1);
    const index = Math.round(ratio * (buttons.length - 1));
    return buttons[Math.max(0, Math.min(buttons.length - 1, index))];
  }

  function enterHudFocus() {
    const buttons = getGameHudButtons();
    if (!buttons.length) return false;

    remote.mode = "hud";
    remote.active = false;
    clearRemoteIdleTimer();
    drawBoard();

    const target = chooseHudButtonFromBoardColumn(buttons);
    target?.focus({ preventScroll: true });
    target?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    return true;
  }

  function returnToBoardFocus() {
    if (!boardReady()) return false;
 
    const active = document.activeElement;
    if (active && active !== document.body && typeof active.blur === "function") {
      active.blur();
    }

    remote.mode = "board";
    ensureRemoteFocus();
    drawBoard();
    scrollFocusedCellIntoView();
    return true;
  }

  function moveHudFocus(direction) {
    const buttons = getGameHudButtons();
    if (!buttons.length) return false;

    const active = document.activeElement;
    let index = buttons.includes(active) ? buttons.indexOf(active) : 0;

    if (direction === "ArrowDown" || direction === "Down") {
      return returnToBoardFocus();
    }

    if (direction === "ArrowLeft" || direction === "Left") index -= 1;
    if (direction === "ArrowRight" || direction === "Right") index += 1;
    if (direction === "ArrowUp" || direction === "Up") index = index;

    const next = buttons[(index + buttons.length) % buttons.length];
    next.focus({ preventScroll: true });
    next.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    return true;
  }

  function activateHudFocus() {
    const buttons = getGameHudButtons();
    if (!buttons.length) return false;

    const active = document.activeElement;
    const target = buttons.includes(active) ? active : buttons[0];
    target.focus({ preventScroll: true });
    target.click();
    return true;
  }

  function focusFirstInScope() {
    const focusables = getFocusableElements();
    if (!focusables.length) return null;
    const active = document.activeElement;
    if (!active || !focusables.includes(active)) {
      focusables[0].focus({ preventScroll: true });
      return focusables[0];
    }
    return active;
  }

  function normalizeDirection(direction) {
    if (direction === "Up") return "ArrowUp";
    if (direction === "Down") return "ArrowDown";
    if (direction === "Left") return "ArrowLeft";
    if (direction === "Right") return "ArrowRight";
    return direction;
  }

  function rectCenter(rect) {
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }

  function buildFocusRows(focusables) {
    const items = focusables
      .map((node) => ({
        node,
        rect: node.getBoundingClientRect()
      }))
      .filter((item) => item.rect.width > 0 && item.rect.height > 0)
      .sort((a, b) => {
        const dy = a.rect.top - b.rect.top;
        if (Math.abs(dy) > 10) return dy;
        return a.rect.left - b.rect.left;
      });

    const rows = [];

    items.forEach((item) => {
      const center = rectCenter(item.rect);
      const threshold = Math.max(18, Math.min(44, item.rect.height * 0.65));

      let row = rows.find((candidateRow) => Math.abs(candidateRow.centerY - center.y) <= threshold);
      if (!row) {
        row = { centerY: center.y, items: [] };
        rows.push(row);
      }

      row.items.push(item);
      row.centerY = row.items.reduce((sum, rowItem) => sum + rectCenter(rowItem.rect).y, 0) / row.items.length;
      row.items.sort((a, b) => a.rect.left - b.rect.left);
    });

    rows.sort((a, b) => a.centerY - b.centerY);
    return rows;
  }

  function findCurrentFocusPosition(rows, active) {
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
      const itemIndex = rows[rowIndex].items.findIndex((item) => item.node === active);
      if (itemIndex >= 0) return { rowIndex, itemIndex };
    }
    return null;
  }

  function findNearestInRow(row, x) {
    if (!row?.items?.length) return null;
    return row.items.reduce((best, item) => {
      const distance = Math.abs(rectCenter(item.rect).x - x);
      if (!best || distance < best.distance) return { item, distance };
      return best;
    }, null)?.item || null;
  }

  function moveUiFocus(direction) {
    direction = normalizeDirection(direction);

    const focusables = getFocusableElements();
    if (!focusables.length) return;

    const active = focusFirstInScope();
    if (!active) return;

    const rows = buildFocusRows(focusables);
    const position = findCurrentFocusPosition(rows, active);
    if (!position) return;

    const currentRow = rows[position.rowIndex];
    const currentItem = currentRow.items[position.itemIndex];
    const currentCenter = rectCenter(currentItem.rect);
    let target = null;

    if (direction === "ArrowLeft") {
      target = currentRow.items[position.itemIndex - 1] || null;
    } else if (direction === "ArrowRight") {
      target = currentRow.items[position.itemIndex + 1] || null;
    } else if (direction === "ArrowUp") {
      for (let rowIndex = position.rowIndex - 1; rowIndex >= 0; rowIndex -= 1) {
        target = findNearestInRow(rows[rowIndex], currentCenter.x);
        if (target) break;
      }
    } else if (direction === "ArrowDown") {
      for (let rowIndex = position.rowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
        target = findNearestInRow(rows[rowIndex], currentCenter.x);
        if (target) break;
      }
    }

    if (!target) return;

    target.node.focus({ preventScroll: true });
    target.node.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }

  function activateUiFocus() {
    const active = focusFirstInScope();
    if (active && typeof active.click === "function") active.click();
  }

  function handleBack() {
    clearTimeout(remote.centerTimer);
    remote.centerDown = false;
    remote.centerLongFired = false;

    if (state.currentModal) {
      if (!el.modalCloseBtn.hidden) closeModalSmart();
      else if (state.gameStatus === "paused") openPauseModal();
      return;
    }

    if (state.currentScreen === "gameScreen") {
      pauseGame();
      return;
    }

    showScreen("menuScreen");
  }

  function handleCenterKeyDown(event) {
    if (event.repeat || remote.centerDown) return;
    remote.centerDown = true;
    remote.centerLongFired = false;

    if (!canUseBoardRemote()) return;

    ensureRemoteFocus();
    remote.centerTimer = window.setTimeout(() => {
      remote.centerLongFired = true;
      toggleFocusedFlag();
    }, LONG_OK_MS);
  }

  function handleCenterKeyUp(event) {
    if (!remote.centerDown) return;
    clearTimeout(remote.centerTimer);
    remote.centerTimer = 0;
    remote.centerDown = false;

    if (remote.centerLongFired) {
      remote.centerLongFired = false;
      return;
    }

    if (canUseBoardRemote()) activateFocusedCell();
  }

  function onKeyDown(event) {
    if (isBackKey(event)) {
      stopRemoteEvent(event);
      handleBack();
      return;
    }

    if (event.key?.toLowerCase?.() === "f" && boardReady()) {
      stopRemoteEvent(event);
      toggleFlagMode();
      drawRemoteFocus();
      return;
    }

    if (isArrowKey(event)) {
      stopRemoteEvent(event);

      if (state.currentScreen === "gameScreen" && !state.currentModal) {
        if (remote.mode === "hud") {
          moveHudFocus(event.key);
          return;
        }

        if ((event.key === "ArrowUp" || event.key === "Up") && remote.row === 0 && enterHudFocus()) {
          return;
        }

        moveBoardFocus(event.key);
      } else {
        moveUiFocus(event.key);
      }
      return;
    }

    if (isCenterKey(event)) {
      stopRemoteEvent(event);
      if (state.currentScreen === "gameScreen" && !state.currentModal) {
        if (remote.mode === "hud") activateHudFocus();
        else handleCenterKeyDown(event);
      } else {
        activateUiFocus();
      }
    }
  }

  function onKeyUp(event) {
    if (!isCenterKey(event)) return;
    if (state.currentScreen !== "gameScreen" || state.currentModal || remote.mode === "hud") return;
    stopRemoteEvent(event);
    handleCenterKeyUp(event);
  }

  const originalDrawBoard = drawBoard;
  drawBoard = function drawBoardWithRemoteFocus() {
    originalDrawBoard.apply(this, arguments);
    drawRemoteFocus();
  };

  const originalNewGame = newGame;
  newGame = function newGameWithRemoteReset() {
    const result = originalNewGame.apply(this, arguments);
    resetRemoteFocus();
    remote.lastGameId = state.gameId;
    return result;
  };

  const originalShowScreen = showScreen;
  showScreen = function showScreenWithTvFocus(screenId) {
    const result = originalShowScreen.apply(this, arguments);
    if (screenId !== "gameScreen") {
      resetRemoteFocus();
      window.setTimeout(() => focusFirstInScope(), 0);
    }
    return result;
  };

  function isPointerLikeEvent(event) {
    return ["pointerdown", "mousedown", "touchstart", "wheel"].includes(event.type);
  }

  function onPointerLikeInput(event) {
    if (!isPointerLikeEvent(event)) return;
    // Прямой ввод мышью или касанием отключает фокус пульта.
    hideRemoteFocus({ redraw: true });
  }

  document.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("keyup", onKeyUp, true);
  document.addEventListener("pointerdown", onPointerLikeInput, true);
  document.addEventListener("mousedown", onPointerLikeInput, true);
  document.addEventListener("touchstart", onPointerLikeInput, true);
  document.addEventListener("wheel", onPointerLikeInput, true);

  window.MinesweeperTvRemote = {
    focusCell(row = 0, col = 0) {
      remote.row = Number(row) || 0;
      remote.col = Number(col) || 0;
      ensureRemoteFocus();
      drawBoard();
      scrollFocusedCellIntoView();
    },
    clearFocus() {
      resetRemoteFocus({ redraw: true });
    }
  };
})();
