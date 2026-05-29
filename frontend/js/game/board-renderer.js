"use strict";

// Отрисовка поля

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
      const { cellSize, gap, innerPad } = boardMetrics;
      const baseX = innerPad + cell.col * (cellSize + gap);
      const baseY = innerPad + cell.row * (cellSize + gap);

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
function renderBoard() {
      const level = LEVELS[state.level];
      el.board.innerHTML = "";
      el.board.classList.add("canvas-board");

      const canvas = ensureBoardCanvas();
      el.board.appendChild(canvas);

      applyBoardLayout(level);
      drawBoard();

      requestAnimationFrame(() => {
        if (!state.board.length || state.currentScreen !== "gameScreen") return;
        applyBoardLayout(LEVELS[state.level]);
        drawBoard();
      });
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
