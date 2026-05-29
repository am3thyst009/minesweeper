"use strict";

// Экраны

function setupIcons() {
      document.getElementById("heroIcon").innerHTML = Icons.mine;
      el.pauseBtn.innerHTML = Icons.menu;
      el.flagModeBtn.innerHTML = Icons.flag;
      el.newGameBtn.innerHTML = Icons.restart;
      document.querySelectorAll('[data-screen="menuScreen"]').forEach((btn) => btn.innerHTML = Icons.back);
    }
function resetPageScroll() {
      const scrollingElement = document.scrollingElement || document.documentElement;
      if (scrollingElement) {
        scrollingElement.scrollTop = 0;
        scrollingElement.scrollLeft = 0;
      }
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }
function showScreen(screenId) {
      state.currentScreen = screenId;
      el.screens.forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
      renderContinueButton();
      if (screenId === "recordsScreen") renderRecords();
      if (screenId === "statsScreen") renderStats();
      resetPageScroll();
      AudioEngine.syncMusic();
    }
function renderContinueButton() { el.continueBtn.hidden = !canContinueSession(); }
function canContinueSession() { return state.activeSession && ["playing", "paused"].includes(state.gameStatus); }
function updateLevelButtons() { el.levelButtons.forEach((button) => button.classList.toggle("active", button.dataset.level === state.level)); }
function unlockAudio() { AudioEngine.ensureContext(); AudioEngine.syncMusic(); }
