"use strict";

// Управление партией

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
function floodOpenWave(startCell, onDone) {
      floodOpenMultipleWave([startCell], onDone);
    }
function floodOpenMultipleWave(startCells, onDone) {

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
function toggleFlag(cell) {
      if (!canInteractWithBoard() || cell.isOpen) return;
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
function vibrate(pattern) { if (state.settings.vibration && navigator.vibrate) navigator.vibrate(pattern); }
