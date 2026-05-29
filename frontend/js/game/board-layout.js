"use strict";

// Расчёт геометрии поля

let boardCanvas = null;
let boardCtx = null;
let boardMetrics = { cellSize: 44, gap: 4, innerPad: 0, width: 0, height: 0, dpr: 1 };
let canvasPointerCell = null;
let canvasPointerStart = null;
let boardFastDraw = false;
function isMobilePerfMode() {
      return window.matchMedia?.("(max-width: 760px), (pointer: coarse)")?.matches
        || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
function getBoardGeometry(level) {
      const isEasyBoard = level.cols <= 8;
      const viewport = window.innerWidth || document.documentElement.clientWidth || 390;
      const gap = viewport < 430 ? 4 : 5;
      let cellSize;

      if (viewport < 700) {
        if (isEasyBoard) {
          const wrapWidth = el.boardWrap?.clientWidth || viewport;
          const wrapStyles = el.boardWrap ? getComputedStyle(el.boardWrap) : null;
          const paddingX = wrapStyles
            ? parseFloat(wrapStyles.paddingLeft) + parseFloat(wrapStyles.paddingRight)
            : 0;

          // Лёгкое поле должно полностью помещаться на телефонах.
          const availableWidth = Math.max(220, Math.floor(wrapWidth - paddingX - 2));
          const fittedByWidth = Math.floor((availableWidth - (level.cols - 1) * gap) / level.cols);

          cellSize = Math.max(32, Math.min(56, fittedByWidth));
        } else {
          cellSize = viewport < 380 ? 42 : 44;
        }
      } else if (viewport < 1024) {
        cellSize = isEasyBoard ? 58 : 46;
      } else {
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
        const isLargeTvLikeScreen = viewport >= 1600 && viewportHeight >= 850;
        const isFullHdTvLikeScreen = viewport >= 1800 && viewportHeight >= 950;

        if (isFullHdTvLikeScreen) {
          cellSize = isEasyBoard ? 76 : 56;
        } else if (isLargeTvLikeScreen) {
          cellSize = isEasyBoard ? 72 : 54;
        } else {
          cellSize = isEasyBoard ? 64 : 48;
        }
      }

      const innerPad = isEasyBoard ? 0 : gap;
      const width = level.cols * cellSize + (level.cols - 1) * gap + innerPad * 2;
      const height = level.rows * cellSize + (level.rows - 1) * gap + innerPad * 2;
      const rawDpr = window.devicePixelRatio || 1;
      const viewportHeightForDpr = window.innerHeight || document.documentElement.clientHeight || 720;
      const isLargeScreenHeavyBoard = !isEasyBoard && viewport >= 1600 && viewportHeightForDpr >= 850;
      const dpr = isLargeScreenHeavyBoard ? Math.min(rawDpr, 1.25) : Math.min(rawDpr, 2);

      return { cellSize, gap, innerPad, width, height, dpr, isEasyBoard };
    }
function ensureBoardCanvas() {
      if (boardCanvas) return boardCanvas;

      boardCanvas = document.createElement("canvas");
      boardCanvas.className = "board-canvas";
      boardCanvas.setAttribute("role", "img");
      boardCanvas.setAttribute("aria-label", "Игровое поле");
      boardCanvas.tabIndex = 0;
      boardCtx = boardCanvas.getContext("2d", { alpha: false });

      boardCanvas.addEventListener("contextmenu", onCanvasContextMenu);
      boardCanvas.addEventListener("pointerdown", onCanvasPointerDown);
      boardCanvas.addEventListener("pointermove", onCanvasPointerMove);
      boardCanvas.addEventListener("pointerup", onCanvasPointerUp);
      boardCanvas.addEventListener("pointercancel", onCanvasPointerCancel);
      boardCanvas.addEventListener("pointerleave", onCanvasPointerCancel);

      return boardCanvas;
    }
function resizeCanvasBoard() {
      if (!boardCanvas || !state.board.length) return;

      const level = LEVELS[state.level];
      boardMetrics = getBoardGeometry(level);

      el.board.style.width = `${boardMetrics.width}px`;
      el.board.style.height = `${boardMetrics.height}px`;
      el.board.style.setProperty("--board-cols", level.cols);
      el.board.classList.toggle("easy-board", boardMetrics.isEasyBoard);
      el.board.classList.toggle("scroll-board", !boardMetrics.isEasyBoard);

      boardCanvas.style.width = `${boardMetrics.width}px`;
      boardCanvas.style.height = `${boardMetrics.height}px`;
      boardCanvas.width = Math.max(1, Math.round(boardMetrics.width * boardMetrics.dpr));
      boardCanvas.height = Math.max(1, Math.round(boardMetrics.height * boardMetrics.dpr));

      boardCtx = boardCanvas.getContext("2d", { alpha: false });
      boardCtx.setTransform(boardMetrics.dpr, 0, 0, boardMetrics.dpr, 0, 0);
      drawBoard();
    }
function getCellAtCanvasPoint(clientX, clientY) {
      if (!boardCanvas || !state.board.length) return null;

      const rect = boardCanvas.getBoundingClientRect();
      const x = clientX - rect.left - boardMetrics.innerPad;
      const y = clientY - rect.top - boardMetrics.innerPad;
      if (x < 0 || y < 0) return null;

      const step = boardMetrics.cellSize + boardMetrics.gap;
      const col = Math.floor(x / step);
      const row = Math.floor(y / step);

      if (row < 0 || col < 0 || row >= state.board.length || col >= state.board[0].length) return null;

      const localX = x - col * step;
      const localY = y - row * step;
      if (localX > boardMetrics.cellSize || localY > boardMetrics.cellSize) return null;

      return state.board[row][col];
    }
function applyBoardLayout(level) {
      boardMetrics = getBoardGeometry(level);

      el.board.style.setProperty("--board-cols", level.cols);
      el.board.classList.toggle("easy-board", boardMetrics.isEasyBoard);
      el.board.classList.toggle("scroll-board", !boardMetrics.isEasyBoard);
      el.boardWrap.classList.toggle("easy-board-wrap", boardMetrics.isEasyBoard);
      el.boardWrap.classList.toggle("scroll-board-wrap", !boardMetrics.isEasyBoard);
      if (boardMetrics.isEasyBoard) el.boardWrap.scrollLeft = 0;
      el.board.style.width = `${boardMetrics.width}px`;
      el.board.style.height = `${boardMetrics.height}px`;
      resizeCanvasBoard();
    }
