"use strict";

function setupIcons() {
      document.getElementById("heroIcon").innerHTML = Icons.mine;
      el.pauseBtn.innerHTML = Icons.menu;
      el.flagModeBtn.innerHTML = Icons.flag;
      el.newGameBtn.innerHTML = Icons.restart;
      document.querySelectorAll('[data-screen="menuScreen"]').forEach((btn) => btn.innerHTML = Icons.back);
    }

    let boardCanvas = null;
    let boardCtx = null;
    let boardMetrics = { cellSize: 44, gap: 4, width: 0, height: 0, dpr: 1 };
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
          const paddingY = wrapStyles
            ? parseFloat(wrapStyles.paddingTop) + parseFloat(wrapStyles.paddingBottom)
            : 0;

          const availableWidth = Math.max(240, wrapWidth - paddingX);

          const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 720;
          const wrapTop = el.boardWrap?.getBoundingClientRect?.().top || 0;
          const bottomGuard = viewport < 430 ? 44 : 28;
          const availableHeight = Math.max(260, viewportHeight - wrapTop - paddingY - bottomGuard);

          const sizeByWidth = Math.floor((availableWidth - (level.cols - 1) * gap) / level.cols);
          const sizeByHeight = Math.floor((availableHeight - (level.rows - 1) * gap) / level.rows);

          cellSize = Math.min(sizeByWidth, sizeByHeight);
          cellSize = Math.max(38, Math.min(56, cellSize));
        } else {
          cellSize = viewport < 380 ? 42 : 44;
        }
      } else if (viewport < 1024) {
        cellSize = isEasyBoard ? 58 : 46;
      } else {
        cellSize = isEasyBoard ? 64 : 48;
      }

      const width = level.cols * cellSize + (level.cols - 1) * gap;
      const height = level.rows * cellSize + (level.rows - 1) * gap;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      return { cellSize, gap, width, height, dpr, isEasyBoard };
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
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const step = boardMetrics.cellSize + boardMetrics.gap;
      const col = Math.floor(x / step);
      const row = Math.floor(y / step);

      if (row < 0 || col < 0 || row >= state.board.length || col >= state.board[0].length) return null;

      const localX = x - col * step;
      const localY = y - row * step;
      if (localX > boardMetrics.cellSize || localY > boardMetrics.cellSize) return null;

      return state.board[row][col];
    }

    function roundRect(ctx, x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }

    function drawBoard() {
      if (!boardCtx || !boardCanvas || !state.board.length) return;

      const ctx = boardCtx;
      const { width, height } = boardMetrics;
      boardFastDraw = isMobilePerfMode();

      ctx.save();
      ctx.setTransform(boardMetrics.dpr, 0, 0, boardMetrics.dpr, 0, 0);
      ctx.fillStyle = getTheme().boardBg;
      ctx.fillRect(0, 0, width, height);

      for (const row of state.board) {
        for (const cell of row) drawCellCanvas(cell);
      }
      ctx.restore();
    }

    function drawCellCanvas(cell) {
      const ctx = boardCtx;
      const { cellSize, gap } = boardMetrics;
      const baseX = cell.col * (cellSize + gap);
      const baseY = cell.row * (cellSize + gap);

      const drawSize = cellSize;
      const x = baseX + (cellSize - drawSize) / 2;
      const y = baseY + (cellSize - drawSize) / 2;
      const r = Math.max(6, Math.round(drawSize * 0.22));

      const theme = getTheme();
      let bgTop = theme.cellClosedTop;
      let bgBottom = theme.cellClosedBot;
      let stroke = theme.cellClosedStroke;
      let text = "";

      if (cell.isOpen) {
        bgTop = theme.cellOpenTop;
        bgBottom = theme.cellOpenBot;
        stroke = "rgba(255,255,255,0.075)";

        if (cell.isMine) {
          bgTop = cell.exploded ? "#ff6378" : "#20242d";
          bgBottom = cell.exploded ? "#a80d22" : "#07090e";
          stroke = cell.exploded ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.5)";
        } else if (cell.wrongFlag) {
          bgTop = "#63304b";
          bgBottom = "#321324";
          text = "×";
        } else if (cell.neighborMines > 0) {
          text = String(cell.neighborMines);
        }
      } else if (cell.isFlagged) {
        bgTop = theme.cellFlagTop;
        bgBottom = theme.cellFlagBot;
        stroke = "rgba(255,79,104,0.32)";
      }

      if (boardFastDraw) {
        ctx.fillStyle = bgBottom;
      } else {
        const gradient = ctx.createLinearGradient(0, y, 0, y + drawSize);
        gradient.addColorStop(0, bgTop);
        gradient.addColorStop(1, bgBottom);
        ctx.fillStyle = gradient;
      }

      roundRect(ctx, x, y, drawSize, drawSize, r);
      ctx.fill();

      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (!cell.isOpen && !cell.isFlagged) {
        ctx.fillStyle = boardFastDraw ? "rgba(255,255,255,0.075)" : "rgba(255,255,255,0.17)";
        roundRect(ctx, x + 2, y + 2, drawSize - 4, Math.max(2, drawSize * 0.20), r);
        ctx.fill();

        if (!boardFastDraw) {
          ctx.fillStyle = "rgba(0,0,0,0.12)";
          roundRect(ctx, x + 2, y + drawSize - Math.max(4, drawSize * 0.13), drawSize - 4, Math.max(2, drawSize * 0.10), r);
          ctx.fill();
        }
      }

      if (cell.isFlagged && !cell.isOpen) {
        drawFlagCanvas(ctx, x, y, drawSize);
        return;
      }

      if (cell.isOpen && cell.isMine) {
        drawMineCanvas(ctx, x, y, drawSize, cell.exploded);
        return;
      }

      if (text) {
        ctx.font = `900 ${Math.round(drawSize * 0.48)}px system-ui, -apple-system, Segoe UI, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = cell.wrongFlag ? "#ffb3d9" : getNumberColor(cell.neighborMines);
        ctx.fillText(text, x + drawSize / 2, y + drawSize / 2 + 1);
      }
    }

    function getNumberColor(n) {
      return {
        1: "#70b7ff",
        2: "#72e08b",
        3: "#ff7b7b",
        4: "#b79cff",
        5: "#ffb86b",
        6: "#7ce7e1",
        7: "#f6f9ff",
        8: "#a7b3c9"
      }[n] || "#f6f9ff";
    }

    function drawFlagCanvas(ctx, x, y, size) {
      const poleX = x + size * 0.34;
      const topY = y + size * 0.23;
      const bottomY = y + size * 0.76;

      ctx.strokeStyle = "#ffd1d8";
      ctx.lineWidth = Math.max(2, size * 0.08);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(poleX, topY);
      ctx.lineTo(poleX, bottomY);
      ctx.stroke();

      ctx.fillStyle = "#ff4f68";
      ctx.beginPath();
      ctx.moveTo(poleX + size * 0.05, topY);
      ctx.lineTo(x + size * 0.72, y + size * 0.30);
      ctx.lineTo(poleX + size * 0.05, y + size * 0.46);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(poleX - size * 0.17, bottomY, size * 0.44, Math.max(2, size * 0.08));
    }

    function drawMineCanvas(ctx, x, y, size, exploded = false) {
      const cx = x + size / 2;
      const cy = y + size / 2;
      const radius = size * 0.27;

      if (exploded) {
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.beginPath();
        ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = exploded ? "#fff" : "#111";
      ctx.lineWidth = Math.max(2, size * 0.055);
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * radius * 0.85, cy + Math.sin(a) * radius * 0.85);
        ctx.lineTo(cx + Math.cos(a) * radius * 1.45, cy + Math.sin(a) * radius * 1.45);
        ctx.stroke();
      }

      ctx.fillStyle = exploded ? "#ffffff" : "#05060a";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = exploded ? "rgba(255,79,104,0.75)" : "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.arc(cx - radius * 0.35, cy - radius * 0.42, radius * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }

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

function showScreen(screenId) {
      state.currentScreen = screenId;
      el.screens.forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
      renderContinueButton();
      if (screenId === "recordsScreen") renderRecords();
      if (screenId === "statsScreen") renderStats();
      AudioEngine.syncMusic();
    }

    function renderContinueButton() { el.continueBtn.hidden = !canContinueSession(); }
    function canContinueSession() { return state.activeSession && ["playing", "paused"].includes(state.gameStatus); }

    function startSelectedLevel() {
      if (canContinueSession()) {
        openConfirmModal({ title: "Начать новую игру?", subtitle: "Текущая партия будет завершена.", confirmText: "Новая игра", danger: true, onConfirm: () => startFreshGame(state.level) });
        return;
      }
      startFreshGame(state.level);
    }

    function startFreshGame(levelName) {
      stopTimer();
      closeModal();
      showScreen("gameScreen");
      newGame(levelName);
      state.suppressBoardInputUntil = Date.now() + 350;
    }

    function continueGame() {
      if (!canContinueSession()) return;
      showScreen("gameScreen");
      closeModal();
      resumeGame();
    }

    function newGame(levelName = state.level) {
      state.lifecycleMusicPaused = false;
      state.gameId++;
      state.level = levelName;
      const level = LEVELS[state.level];
      stopTimer();

      state.board = createEmptyBoard(level.rows, level.cols);
      state.seconds = 0;
      state.flags = 0;
      state.opened = 0;
      state.gameStatus = "idle";
      state.activeSession = true;
      AudioEngine.syncMusic();
      state.flagMode = false;
      state.longPressTriggered = false;
      state.suppressBoardInputUntil = 0;
      el.timer.textContent = "0";
      el.status.textContent = "Откройте поле и не заденьте мину. Удерживайте клетку, чтобы поставить флаг.";
      el.status.className = "status";
      el.gameTitle.textContent = `${level.label} уровень`;
      el.boardWrap.scrollLeft = 0;
      el.boardWrap.classList.remove("paused");

      updateLevelButtons();
      updateFlagModeUI();
      updateCounters();
      updateBestTime();
      renderBoard();
      renderContinueButton();
    }

    function createEmptyBoard(rows, cols) {
      const board = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => ({
          row,
          col,
          isMine: false,
          isOpen: false,
          isFlagged: false,
          neighborMines: 0,
          exploded: false,
          wrongFlag: false,
          neighbors: null,
          neighborsWithSelf: null
        }))
      );

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const neighbors = [];
          const neighborsWithSelf = [];

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;

              const neighbor = board[nr][nc];
              neighborsWithSelf.push(neighbor);
              if (dr !== 0 || dc !== 0) neighbors.push(neighbor);
            }
          }

          board[row][col].neighbors = neighbors;
          board[row][col].neighborsWithSelf = neighborsWithSelf;
        }
      }

      return board;
    }

    function forEachCell(callback) {
      for (const row of state.board) {
        for (const cell of row) callback(cell);
      }
    }

    function getAllCells() {
      const cells = [];
      forEachCell((cell) => cells.push(cell));
      return cells;
    }

    function placeMines(firstSafeCell) {
      const level = LEVELS[state.level];
      const quality = getFirstOpeningQuality(state.level);
      const maxAttempts = 260;

      let bestMineKeys = null;
      let bestScore = Infinity;

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        clearMineData();

        const forbidden = getForbiddenFirstClickCells(firstSafeCell);
        let available = getAllCells()
          .filter((cell) => !forbidden.has(cellKey(cell.row, cell.col)));

        /*
          На маленьких/нестандартных полях безопасная зона вокруг первого
          клика может занять слишком много места. Тогда гарантируем хотя бы
          безопасность самой первой клетки.
        */
        if (available.length < level.mines && firstSafeCell) {
          available = getAllCells().filter((cell) => cell !== firstSafeCell);
        }

        shuffle(available);

        for (let i = 0; i < level.mines; i++) {
          available[i].isMine = true;
        }

        calculateNumbers();

        const openingAnalysis = firstSafeCell ? analyzeFirstOpening(firstSafeCell) : getEmptyOpeningAnalysis();
        const openingSize = openingAnalysis.size;
        const mineKeys = getAllCells()
          .filter((cell) => cell.isMine)
          .map((cell) => cellKey(cell.row, cell.col));

        const score = scoreFirstOpening(openingAnalysis, quality);

        if (score < bestScore) {
          bestScore = score;
          bestMineKeys = mineKeys;
        }

        /*
          Принимаем не любую большую область, а умеренную:
          хороший первый ход должен открыть пространство для анализа,
          но не половину поля.
        */
        if (
          openingSize >= quality.min &&
          openingSize <= quality.max &&
          openingAnalysis.shapeScore >= quality.shapeMin
        ) {
          return;
        }
      }

      applyMineKeys(bestMineKeys || []);
      calculateNumbers();
    }

    function getFirstOpeningQuality(levelName) {
      return {
        easy: { min: 12, target: 20, max: 28, shapeMin: 12 },
        medium: { min: 18, target: 34, max: 46, shapeMin: 20 },
        hard: { min: 24, target: 46, max: 60, shapeMin: 26 }
      }[levelName] || { min: 12, target: 20, max: 28, shapeMin: 12 };
    }

    function scoreFirstOpening(openingAnalysis, quality) {
      const openingSize = openingAnalysis.size;
      let score = Math.abs(openingSize - quality.target);

      if (openingSize < quality.min) {
        score += (quality.min - openingSize) * 6;
      }

      if (openingSize > quality.max) {
        score += (openingSize - quality.max) * 4;
      }

      if (openingAnalysis.shapeScore < quality.shapeMin) {
        score += (quality.shapeMin - openingAnalysis.shapeScore) * 2.5;
      }

      // Небольшой штраф за слишком компактное квадратное пятно:
      // оно чаще оставляет игрока в ситуации угадайки сразу после первого хода.
      score += openingAnalysis.compactPenalty;

      return score;
    }

    function getForbiddenFirstClickCells(firstSafeCell) {
      const forbidden = new Set();
      if (!firstSafeCell) return forbidden;

      getNeighbors(firstSafeCell.row, firstSafeCell.col, true).forEach((cell) => {
        forbidden.add(cellKey(cell.row, cell.col));
      });

      return forbidden;
    }

    function clearMineData() {
      forEachCell((cell) => {
        cell.isMine = false;
        cell.neighborMines = 0;
        cell.exploded = false;
        cell.wrongFlag = false;
      });
    }

    function applyMineKeys(mineKeys) {
      const mines = new Set(mineKeys);
      forEachCell((cell) => {
        cell.isMine = mines.has(cellKey(cell.row, cell.col));
      });
    }
function getEmptyOpeningAnalysis() {
      return {
        size: 0,
        zeroCount: 0,
        numberCount: 0,
        edgeCount: 0,
        width: 0,
        height: 0,
        shapeScore: 0,
        compactPenalty: 0
      };
    }

    function analyzeFirstOpening(startCell) {
      if (!startCell || startCell.isMine) return getEmptyOpeningAnalysis();

      const visited = new Map();
      const stack = [startCell];

      while (stack.length > 0) {
        const cell = stack.pop();
        const key = cellKey(cell.row, cell.col);

        if (visited.has(key) || cell.isMine) continue;
        visited.set(key, cell);

        if (cell.neighborMines !== 0) continue;

        getNeighbors(cell.row, cell.col).forEach((neighbor) => {
          const neighborKey = cellKey(neighbor.row, neighbor.col);
          if (!visited.has(neighborKey) && !neighbor.isMine) {
            stack.push(neighbor);
          }
        });
      }

      if (visited.size === 0) return getEmptyOpeningAnalysis();

      let zeroCount = 0;
      let numberCount = 0;
      let edgeCount = 0;
      let minRow = Infinity;
      let maxRow = -Infinity;
      let minCol = Infinity;
      let maxCol = -Infinity;

      visited.forEach((cell) => {
        if (cell.neighborMines === 0) zeroCount++;
        else numberCount++;

        minRow = Math.min(minRow, cell.row);
        maxRow = Math.max(maxRow, cell.row);
        minCol = Math.min(minCol, cell.col);
        maxCol = Math.max(maxCol, cell.col);

        const orthogonalNeighbors = [
          [cell.row - 1, cell.col],
          [cell.row + 1, cell.col],
          [cell.row, cell.col - 1],
          [cell.row, cell.col + 1]
        ];

        const connectedSides = orthogonalNeighbors.filter(([row, col]) => visited.has(cellKey(row, col))).length;
        if (connectedSides <= 2) edgeCount++;
      });

      const width = maxCol - minCol + 1;
      const height = maxRow - minRow + 1;
      const boundingArea = Math.max(1, width * height);
      const fillRatio = visited.size / boundingArea;
      const spreadScore = Math.sqrt(boundingArea);
      const edgeScore = edgeCount / Math.max(1, visited.size);

      /*
        Оцениваем не только размер первого открытия, но и его форму.
        Хороший старт для сапёра — это не ровный компактный квадрат, а область
        с выступами, краями и числами вокруг пустой зоны: после неё меньше
        ощущения “угадайки” и больше точек для анализа.
      */
      const shapeScore =
        numberCount * 0.75 +
        zeroCount * 0.22 +
        spreadScore * 0.85 +
        edgeCount * 0.28 +
        edgeScore * 6 -
        Math.max(0, fillRatio - 0.72) * 10;

      const compactPenalty = fillRatio > 0.78 ? (fillRatio - 0.78) * 18 : 0;

      return {
        size: visited.size,
        zeroCount,
        numberCount,
        edgeCount,
        width,
        height,
        shapeScore,
        compactPenalty
      };
    }

    function calculateNumbers() {
      forEachCell((cell) => {
        cell.neighborMines = cell.isMine ? 0 : getNeighbors(cell.row, cell.col).filter((neighbor) => neighbor.isMine).length;
      });
    }

    function getNeighbors(row, col, includeSelf = false) {
      const cell = state.board[row]?.[col];
      if (cell) return includeSelf ? cell.neighborsWithSelf : cell.neighbors;

      const level = LEVELS[state.level];
      const result = [];
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!includeSelf && dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (nr < 0 || nc < 0 || nr >= level.rows || nc >= level.cols) continue;
          result.push(state.board[nr][nc]);
        }
      }
      return result;
    }

    function applyBoardLayout(level) {
      boardMetrics = getBoardGeometry(level);

      el.board.style.setProperty("--board-cols", level.cols);
      el.board.classList.toggle("easy-board", boardMetrics.isEasyBoard);
      el.board.classList.toggle("scroll-board", !boardMetrics.isEasyBoard);
      el.board.style.width = `${boardMetrics.width}px`;
      el.board.style.height = `${boardMetrics.height}px`;
      resizeCanvasBoard();
    }

    function renderBoard() {
      const level = LEVELS[state.level];
      el.board.innerHTML = "";
      el.board.classList.add("canvas-board");

      const canvas = ensureBoardCanvas();
      el.board.appendChild(canvas);

      applyBoardLayout(level);
      drawBoard();

      // Повторный layout нужен после перехода на игровой экран:
      // WebView не всегда сразу отдаёт финальную ширину контейнера.
      requestAnimationFrame(() => {
        if (!state.board.length || state.currentScreen !== "gameScreen") return;
        applyBoardLayout(LEVELS[state.level]);
        drawBoard();
      });
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

    function updateAllCells() {
      drawBoard();
    }

    function prefersReducedMotion() {
      return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    }

    function pulseWinBoard() {
      if (prefersReducedMotion()) return;

      el.boardWrap.classList.remove("board-win-pulse");
      void el.boardWrap.offsetWidth;
      el.boardWrap.classList.add("board-win-pulse");
      setTimeout(() => el.boardWrap.classList.remove("board-win-pulse"), 560);
    }

    function openCell(cell) {
      if (!canInteractWithBoard() || cell.isFlagged) return;

      if (state.gameStatus === "idle") startGameSession(cell);

      /*
        Двойной тап по открытому числу открывает соседние клетки,
        если количество флагов вокруг совпадает с числом.
      */
      if (cell.isOpen && cell.neighborMines > 0) {
        handleNumberTap(cell);
        return;
      }

      if (cell.isOpen) return;

      if (cell.isMine) {
        loseGame(cell);
        return;
      }

      AudioEngine.click();
      floodOpenWave(cell, checkWin);
    }

    function handleNumberTap(numberCell) {
      const now = Date.now();
      const key = cellKey(numberCell.row, numberCell.col);
      const isDoubleTap = state.lastNumberTap.key === key && now - state.lastNumberTap.time < 420;

      state.lastNumberTap = { key, time: now };

      if (!isDoubleTap) {
        return;
      }

      chordOpen(numberCell);
    }

    function chordOpen(numberCell) {
      const neighbors = getNeighbors(numberCell.row, numberCell.col);
      const flagged = neighbors.filter((neighbor) => neighbor.isFlagged).length;

      if (flagged !== numberCell.neighborMines) {
        showToast("Сначала отметьте все мины вокруг числа.");
        return;
      }

      for (const neighbor of neighbors) {
        if (neighbor.isFlagged || neighbor.isOpen) continue;
        if (neighbor.isMine) {
          loseGame(neighbor);
          return;
        }
      }

      AudioEngine.click();
      const safeNeighbors = neighbors.filter((neighbor) => !neighbor.isFlagged && !neighbor.isOpen && !neighbor.isMine);
      floodOpenMultipleWave(safeNeighbors, checkWin);
    }

    function canInteractWithBoard() { return ["idle", "playing"].includes(state.gameStatus) && state.currentScreen === "gameScreen" && !state.currentModal; }

    function startGameSession(firstSafeCell) {
      state.lifecycleMusicPaused = false;
      state.gameStatus = "playing";
      state.activeSession = true;
      placeMines(firstSafeCell);
      startTimer();
      AudioEngine.syncMusic();
    }

    // Раскрывает пустые области небольшими пачками, чтобы не перегружать WebView.
    function floodOpenWave(startCell, onDone) {
      floodOpenMultipleWave([startCell], onDone);
    }

    function floodOpenMultipleWave(startCells, onDone) {
      /*
        Все варианты раскрытия используют один механизм:
        обычный ход, первое раскрытие и chord-open работают одинаково.
      */
      const queue = [...startCells];
      const queued = new Set(queue.map((cell) => cellKey(cell.row, cell.col)));
      const cellsToOpen = [];
      let index = 0;

      while (index < queue.length) {
        const cell = queue[index++];

        if (cell.isOpen || cell.isFlagged || cell.isMine) continue;
        cellsToOpen.push(cell);

        if (cell.neighborMines === 0) {
          for (const neighbor of getNeighbors(cell.row, cell.col)) {
            const key = cellKey(neighbor.row, neighbor.col);
            if (!queued.has(key) && !neighbor.isOpen && !neighbor.isFlagged && !neighbor.isMine) {
              queued.add(key);
              queue.push(neighbor);
            }
          }
        }
      }

      if (!cellsToOpen.length) {
        onDone?.();
        return;
      }

      const isMobile = isMobilePerfMode();
      const isBulkReveal = cellsToOpen.length > 14;
      const batchSize = isMobile ? (isBulkReveal ? 12 : 7) : (isBulkReveal ? 16 : 8);
      const batchDelay = isBulkReveal ? (isMobile ? 22 : 18) : 16;
      let renderedIndex = 0;

      function renderBatch() {
        const endIndex = Math.min(renderedIndex + batchSize, cellsToOpen.length);

        for (; renderedIndex < endIndex; renderedIndex++) {
          const cell = cellsToOpen[renderedIndex];
          if (cell.isOpen || cell.isFlagged || cell.isMine) continue;

          cell.isOpen = true;
          state.opened++;
        }

        drawBoard();
        AudioEngine.reveal(renderedIndex);

        if (renderedIndex >= cellsToOpen.length) {
          onDone?.();
          return;
        }

        setTimeout(renderBatch, batchDelay);
      }

      renderBatch();
    }

    function toggleFlag(cell) {
      if (!canInteractWithBoard() || cell.isOpen) return;
      // Флаг до первого открытия не запускает таймер и не генерирует мины.
      const level = LEVELS[state.level];
      const wantsToPlaceFlag = !cell.isFlagged;
      if (wantsToPlaceFlag && state.flags >= level.mines) {
        showToast("Все флаги уже использованы. Сначала снимите лишний маркер.");
        vibrate(18);
        return;
      }
      cell.isFlagged = !cell.isFlagged;
      state.flags += cell.isFlagged ? 1 : -1;
      AudioEngine.flag(cell.isFlagged);
      vibrate(cell.isFlagged ? 25 : 16);
      updateCounters();
      updateAllCells();
      checkWin();
    }

    function toggleFlagMode() {
      state.flagMode = !state.flagMode;
      updateFlagModeUI();
      el.status.textContent = state.flagMode ? "Режим флага включён: тап ставит или снимает маркер." : "Откройте поле и не заденьте мину. Удерживайте клетку, чтобы поставить флаг.";
      showToast(state.flagMode ? "Режим флага включён." : "Режим флага выключен.");
    }

    function updateFlagModeUI() {
      el.flagModeBtn.classList.toggle("active", state.flagMode);
      el.flagModeBtn.setAttribute("aria-pressed", String(state.flagMode));
    }

    function checkWin() {
      if (!["idle", "playing"].includes(state.gameStatus)) return;
      const level = LEVELS[state.level];
      const safeCells = level.rows * level.cols - level.mines;
      const allSafeOpened = state.opened === safeCells;
      if (allSafeOpened) winGame();
    }

    function winGame() {
      state.gameStatus = "won";
      state.lifecycleMusicPaused = false;
      state.suppressBoardInputUntil = Date.now() + 700;
      state.activeSession = false;
      stopTimer();
      AudioEngine.syncMusic();
      forEachCell((cell) => { if (cell.isMine) cell.isFlagged = true; });
      state.flags = LEVELS[state.level].mines;
      updateCounters();
      updateAllCells();
      saveWinStats();
      const wasRecord = saveBestTimeIfNeeded();
      updateBestTime();
      AudioEngine.win();
      vibrate([35, 40, 35]);
      pulseWinBoard();
      celebrateVictory();
      showConfetti();
      el.status.textContent = wasRecord ? `Победа! Новый рекорд: ${state.seconds} сек.` : `Победа! Время: ${state.seconds} сек.`;
      el.status.className = "status win";
      renderContinueButton();
      openResultModal("win", wasRecord);
    }

    function loseGame(explodedCell) {
      const lostGameId = state.gameId;
      // Короткая визуальная реакция на взрыв.
      document.body.animate([
        { backgroundColor: "#070b13" },
        { backgroundColor: "#2a0005" },
        { backgroundColor: "#070b13" }
      ], { duration: 300 });
      state.gameStatus = "lost";
      state.lifecycleMusicPaused = false;
      state.activeSession = false;
      stopTimer();
      AudioEngine.syncMusic();

      explodedCell.exploded = true;
      explodedCell.isOpen = true;

      forEachCell((cell) => {
        if (cell.isFlagged && !cell.isMine) {
          cell.isOpen = true;
          cell.wrongFlag = true;
        }
      });

      updateAllCells();
      saveLossStats();
      AudioEngine.lose();
      vibrate([60, 35, 90]);
      el.status.textContent = "Взрыв. Мина была слишком близко.";
      el.status.className = "status lose";
      renderContinueButton();

      revealMinesWave(explodedCell, () => {
        if (state.gameId !== lostGameId || state.gameStatus !== "lost") return;
        openResultModal("lose", false);
      });
    }

    function revealMinesWave(originCell, onDone) {
      const mines = getAllCells()
        .filter((cell) => cell.isMine && cell !== originCell)
        .sort((a, b) => distanceFrom(a, originCell) - distanceFrom(b, originCell));

      if (mines.length === 0) {
        onDone?.();
        return;
      }

      const isMobile = isMobilePerfMode();
      const batchSize = isMobile ? 4 : 2;
      const batchDelay = isMobile ? 52 : 36;
      let index = 0;

      function revealBatch() {
        const endIndex = Math.min(index + batchSize, mines.length);

        for (; index < endIndex; index++) {
          if (state.gameStatus !== "lost") return;

          mines[index].isOpen = true;
        }

        drawBoard();

        if (index >= mines.length) {
          setTimeout(() => onDone?.(), 650);
          return;
        }

        setTimeout(revealBatch, batchDelay);
      }

      setTimeout(revealBatch, 120);
    }

    function distanceFrom(cell, originCell) {
      return Math.hypot(cell.row - originCell.row, cell.col - originCell.col);
    }

    function isBoardInputSuppressed() {
      return Date.now() < state.suppressBoardInputUntil;
    }

    function autoPauseGame() {
      state.lifecycleMusicPaused = true;

      if (state.currentScreen === "gameScreen" && state.gameStatus === "playing") {
        state.gameStatus = "paused";
        stopTimer();
        el.boardWrap.classList.add("paused");
        updateAllCells();
        if (!state.currentModal) openPauseModal();
      }

      AudioEngine.syncMusic();
    }

    function pauseGame() {
      state.lifecycleMusicPaused = false;
      if (state.gameStatus !== "playing") { openPauseModal(); return; }
      state.gameStatus = "paused";
      stopTimer();
      AudioEngine.syncMusic();
      el.boardWrap.classList.add("paused");
      updateAllCells();
      openPauseModal();
    }

    function resumeGame() {
      if (state.gameStatus !== "paused") {
        closeModal();
        return;
      }

      closeModal();
      state.lifecycleMusicPaused = false;
      state.gameStatus = "playing";
      startTimer();
      AudioEngine.syncMusic();
      el.boardWrap.classList.remove("paused");
      updateAllCells();
    }

    function leaveGameToMenu() {
      state.lifecycleMusicPaused = false;
      if (state.gameStatus === "playing") { state.gameStatus = "paused"; stopTimer(); }
      AudioEngine.syncMusic();
      el.boardWrap.classList.add("paused");
      updateAllCells();
      closeModal();
      showScreen("menuScreen");

    }

    function requestNewGame() {
      if (["idle", "playing", "paused"].includes(state.gameStatus)) {
        openConfirmModal({
          title: "Начать заново?",
          subtitle: "Текущая партия будет завершена.",
          confirmText: "Начать заново",
          danger: true,
          returnToPause: state.gameStatus === "paused",
          onConfirm: () => startFreshGame(state.level)
        });
      } else {
        startFreshGame(state.level);
      }
    }

    function startTimer() {
      stopTimer();
      state.timerId = setInterval(() => { state.seconds++; el.timer.textContent = String(state.seconds); }, 1000);
    }
    function stopTimer() { if (state.timerId) clearInterval(state.timerId); state.timerId = null; }
    function updateCounters() { el.minesLeft.textContent = String(LEVELS[state.level].mines - state.flags); }
    function bestKey(levelName) { return STORAGE_KEYS.bestPrefix + levelName; }
    function getBestTime(levelName) { const value = Number(AppStorage.getItem(bestKey(levelName)) || 0); return value > 0 ? value : null; }
    function updateBestTime() { const best = getBestTime(state.level); el.bestTime.textContent = best ? `${best}с` : "—"; }
    function saveBestTimeIfNeeded() { const best = getBestTime(state.level); if (!best || state.seconds < best) { AppStorage.setItem(bestKey(state.level), String(state.seconds)); return true; } return false; }
    function incrementPlayedStats() { state.stats.played++; state.stats.byLevel[state.level].played++; }
    function saveWinStats() { incrementPlayedStats(); state.stats.wins++; state.stats.byLevel[state.level].wins++; saveStats(); }
    function saveLossStats() { incrementPlayedStats(); state.stats.losses++; state.stats.byLevel[state.level].losses++; saveStats(); }

    function renderRecords() {
      el.recordsList.innerHTML = "";
      Object.entries(LEVELS).forEach(([key, level]) => {
        const row = document.createElement("div");
        row.className = "list-row";
        const best = getBestTime(key);
        row.innerHTML = `<strong>${level.label}</strong><span>${best ? best + " сек" : "—"}</span>`;
        el.recordsList.appendChild(row);
      });
    }

    function renderStats() {
      const total = state.stats.played || 0;
      const winRate = total ? Math.round((state.stats.wins / total) * 100) : 0;
      const rows = [["Всего игр", state.stats.played], ["Победы", state.stats.wins], ["Поражения", state.stats.losses], ["Процент побед", `${winRate}%`]];
      el.statsList.innerHTML = "";
      rows.forEach(([label, value]) => {
        const row = document.createElement("div");
        row.className = "list-row";
        row.innerHTML = `<strong>${label}</strong><span>${value}</span>`;
        el.statsList.appendChild(row);
      });
      Object.entries(LEVELS).forEach(([key, level]) => {
        const data = state.stats.byLevel[key];
        const row = document.createElement("div");
        row.className = "list-row";
        row.innerHTML = `<strong>${level.label}</strong><span>${data.wins}/${data.played}</span>`;
        el.statsList.appendChild(row);
      });
    }

    function clearRecords() {
      openConfirmModal({ title: "Сбросить рекорды?", subtitle: "Лучшее время по всем уровням будет удалено.", confirmText: "Сбросить", danger: true, onConfirm: () => { Object.keys(LEVELS).forEach((levelName) => AppStorage.removeItem(bestKey(levelName))); updateBestTime(); renderRecords(); closeModal(); showToast("Рекорды сброшены."); } });
    }

    function clearStats() {
      openConfirmModal({ title: "Сбросить статистику?", subtitle: "Количество игр, побед и поражений будет удалено.", confirmText: "Сбросить", danger: true, onConfirm: () => { AppStorage.removeItem(STORAGE_KEYS.stats); state.stats = loadStats(); renderStats(); closeModal(); showToast("Статистика сброшена."); } });
    }

    function openModal({ title, subtitle = "", body = "", closeable = true }) {
      state.currentModal = title;
      state.modalActionLockUntil = Date.now() + 450;
      el.modalTitle.textContent = title;
      el.modalSubtitle.textContent = subtitle;
      el.modalSubtitle.hidden = !subtitle;
      el.modalBody.innerHTML = body;
      el.modalCloseBtn.hidden = !closeable;
      el.modalBackdrop.classList.add("show");
      el.modalBackdrop.setAttribute("aria-hidden", "false");
    }

    function closeModal() {
      state.currentModal = null;
      state.confirmReturnToPause = false;
      state.pendingConfirm = null;
      state.modalActionLockUntil = 0;
      el.modalBackdrop.classList.remove("show");
      el.modalBackdrop.setAttribute("aria-hidden", "true");
      el.modalBody.innerHTML = "";
    }

    function closeModalSmart() {
      /*
        Крестик закрывает модалку из паузы и возвращает игрока к партии.
        Кнопка «Назад» возвращает в меню паузы.
      */
      if (state.pauseBeforeModal && state.gameStatus === "paused") {
        state.pauseBeforeModal = false;
        resumeGame();
        return;
      }

      closeModal();
    }

    function openPauseModal() {
      state.pauseBeforeModal = false;
      state.confirmReturnToPause = false;
      openModal({ title: "Пауза", subtitle: "Партия остановлена. Можно продолжить, открыть настройки или выйти в меню.", closeable: false, body: `<div class="modal-actions"><button class="btn btn-primary" type="button" data-action="resume">Продолжить</button><button class="btn btn-secondary" type="button" data-action="restart">Новая игра</button><button class="btn btn-secondary" type="button" data-action="settings">Настройки</button><button class="btn btn-secondary" type="button" data-action="rules">Правила</button><button class="btn btn-ghost" type="button" data-action="menu">В главное меню</button></div>` });
    }

    function openSettingsModal(returnToPause = false) {
      state.pauseBeforeModal = returnToPause;
      openModal({ title: "Настройки", body: `<div class="stack">${settingRow("sound", "Звуки", "Игровые эффекты.")}${settingRow("music", "Музыка", "Фоновое сопровождение.")}${settingRow("vibration", "Вибрация", "Короткая отдача.")}${themeRow()}<button class="btn btn-secondary" type="button" data-action="back-from-settings">Назад</button></div>` });
      renderModalSettingsToggles();
    }

    function settingRow(name, title, subtitle) {
      return `<div class="settings-row"><div><strong>${title}</strong><small>${subtitle}</small></div><button class="toggle ${state.settings[name] ? "on" : ""}" type="button" data-setting="${name}" aria-label="${title}"></button></div>`;
    }
    function renderModalSettingsToggles() { el.modalBody.querySelectorAll("[data-setting]").forEach((button) => button.classList.toggle("on", state.settings[button.dataset.setting])); }

    function openRulesModal(returnToPause = false) {
      state.pauseBeforeModal = returnToPause;
      openModal({ title: "Правила", subtitle: "Откройте поле и не заденьте мину.", body: `<div class="text"><ul><li>Тап по клетке открывает её.</li><li>Если под клеткой мина — игра заканчивается.</li><li>Число показывает, сколько мин находится в соседних клетках.</li><li>Пустая клетка раскрывает соседние пустые области автоматически.</li><li>Удержание или режим флага ставит и снимает маркер.</li><li>Двойной тап по открытому числу открывает соседние клетки, если вокруг него уже стоит нужное число флагов.</li><li>Победа — когда открыты все безопасные клетки.</li></ul></div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-action="back-from-info">Назад</button></div>` });
    }

    function openHelpModal(returnToPause = false) {
      state.pauseBeforeModal = returnToPause;
      const commandPills = SALUTE_COMMANDS_SPEC
        .map((item) => `<span class="pill">${item.phrases[0]}</span>`)
        .join("");

      openModal({ title: "Голосовое управление", body: `<div class="pill-row">${commandPills}</div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-action="back-from-info">Назад</button></div>` });
    }

    function openConfirmModal({ title, subtitle, confirmText, onConfirm, danger = false, returnToPause = false }) {
      state.confirmReturnToPause = returnToPause;
      openModal({ title, subtitle, body: `<div class="modal-actions"><button class="btn btn-secondary" type="button" data-action="cancel-confirm">Отмена</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" type="button" data-action="confirm">${confirmText}</button></div>` });
      state.pendingConfirm = onConfirm;
    }

    function openResultModal(type, wasRecord) {
      const isWin = type === "win";
      const level = LEVELS[state.level];
      const best = getBestTime(state.level);
      const title = isWin ? "Победа!" : "Поражение";
      const subtitle = isWin
        ? (wasRecord ? "Новый рекорд на этом уровне." : "Поле обезврежено.")
        : "Взрыв. Мина была слишком близко.";

      openModal({
        title,
        subtitle,
        closeable: !isWin,
        body: `<div class="result-badge ${isWin ? "" : "lose"}">${isWin ? Icons.trophy : Icons.burst}</div><div class="result-summary"><div class="stat"><div class="stat-label">Уровень</div><div class="stat-value">${level.label}</div></div><div class="stat"><div class="stat-label">Время</div><div class="stat-value">${state.seconds} сек</div></div><div class="stat"><div class="stat-label">Рекорд</div><div class="stat-value">${best ? best + " сек" : "—"}</div></div><div class="stat"><div class="stat-label">Исход</div><div class="stat-value">${isWin ? "Победа" : "Взрыв"}</div></div></div><div class="modal-actions"><button class="btn btn-primary" type="button" data-action="play-again">${isWin ? "Играть ещё" : "Попробовать снова"}</button><button class="btn btn-secondary" type="button" data-action="choose-level">Сменить уровень</button><button class="btn btn-ghost" type="button" data-action="menu-result">В меню</button></div>`
      });
    }

    function handleModalAction(action) {
      if (Date.now() < (state.modalActionLockUntil || 0)) return;
      if (action === "resume") resumeGame();
      if (action === "restart") requestNewGame();
      if (action === "settings") openSettingsModal(true);
      if (action === "rules") openRulesModal(true);
      if (action === "menu") leaveGameToMenu();
      if (action === "back-from-settings" || action === "back-from-info") {
        if (state.pauseBeforeModal && state.gameStatus === "paused") {
          openPauseModal();
        } else {
          closeModal();
        }
      }
      if (action === "cancel-confirm") {
        if (state.confirmReturnToPause && state.gameStatus === "paused") {
          openPauseModal();
        } else {
          closeModal();
        }
      }
      if (action === "confirm" && typeof state.pendingConfirm === "function") { const fn = state.pendingConfirm; state.pendingConfirm = null; fn(); }
      if (action === "play-again") startFreshGame(state.level);
      if (action === "choose-level") { closeModal(); showScreen("menuScreen"); }
      if (action === "menu-result") { closeModal(); showScreen("menuScreen"); }
    }

    function toggleSetting(name) {
      state.settings[name] = !state.settings[name];
      saveSettings();
      renderModalSettingsToggles();
      AudioEngine.syncMusic();
      showToast(settingLabel(name) + (state.settings[name] ? " включены." : " выключены."));
    }

    function settingLabel(name) { return { sound: "Звуки", music: "Музыка", vibration: "Вибрация" }[name] || "Настройка"; }
    function updateLevelButtons() { el.levelButtons.forEach((button) => button.classList.toggle("active", button.dataset.level === state.level)); }
    function unlockAudio() { AudioEngine.ensureContext(); AudioEngine.syncMusic(); }
    function vibrate(pattern) { if (state.settings.vibration && navigator.vibrate) navigator.vibrate(pattern); }

    function showToast(message) {
      el.toast.textContent = message;
      el.toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
    }

    function celebrateVictory() {
      if (prefersReducedMotion()) return;
      pulseWinBoard();
    }

    function showConfetti() {
      el.confettiLayer.innerHTML = "";
      const colors = ["#35e66b", "#88ffb0", "#21a038", "#ffd166", "#ffffff"];
      for (let i = 0; i < 72; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";
        const color = colors[i % colors.length];
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = color;
        piece.style.color = color;
        piece.style.width = 5 + Math.random() * 7 + "px";
        piece.style.height = 8 + Math.random() * 12 + "px";
        piece.style.borderRadius = Math.random() > 0.55 ? "999px" : "3px";
        piece.style.animationDelay = Math.random() * 360 + "ms";
        piece.style.animationDuration = 980 + Math.random() * 620 + "ms";
        piece.style.transform = `rotate(${Math.random() * 220}deg)`;
        el.confettiLayer.appendChild(piece);
      }
      setTimeout(() => { el.confettiLayer.innerHTML = ""; }, 1900);
    }

    
    function getTheme() {
      return THEMES[state?.settings?.theme] || THEMES.arcade;
    }

    function applyThemeCss() {
      document.documentElement.setAttribute("data-theme", state?.settings?.theme || "arcade");
    }

    function setTheme(name) {
      if (!THEMES[name]) return;
      state.settings.theme = name;
      saveSettings();
      applyThemeCss();
      drawBoard();
      el.modalBody.querySelectorAll("[data-theme-btn]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.themeBtn === name);
      });
      showToast(`Тема «${THEMES[name].label}» применена.`);
    }

    function themeRow() {
      const current = state?.settings?.theme || "arcade";
      const buttons = Object.entries(THEMES).map(([key, t]) =>
        `<button class="theme-btn${current === key ? " active" : ""}" data-theme-btn="${key}" type="button" title="${t.label}">
          <span class="theme-swatch" style="background:linear-gradient(135deg,${t.cellClosedTop},${t.cellClosedBot})"></span>
          ${t.label}
        </button>`
      ).join("");
      return `<div class="settings-row theme-row"><div><strong>Тема</strong></div><div class="theme-picker">${buttons}</div></div>`;
    }

    function cellKey(row, col) { return `${row}:${col}`; }
    function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
