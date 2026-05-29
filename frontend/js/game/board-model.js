"use strict";

// Модель игрового поля

function cellKey(row, col) { return `${row}:${col}`; }
function shuffle(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }
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
function updateAllCells() {
      drawBoard();
    }
