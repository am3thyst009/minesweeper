"use strict";

let pendingBoardLayoutFrame = 0;
let audioUnlocked = false;

function flushQueuedSaluteCommands() {
  const queue = window.__MINESWEEPER_COMMAND_QUEUE__ || [];
  while (queue.length) {
    handleSaluteCommand(queue.shift());
  }
}

function syncBoardLayout() {
  if (!state.board.length || state.currentScreen !== "gameScreen") return;

  if (pendingBoardLayoutFrame) {
    cancelAnimationFrame(pendingBoardLayoutFrame);
  }

  pendingBoardLayoutFrame = requestAnimationFrame(() => {
    pendingBoardLayoutFrame = 0;
    applyBoardLayout(LEVELS[state.level]);
    drawBoard();
  });
}

function unlockAudioOnFirstInteraction() {
  if (audioUnlocked) return;

  audioUnlocked = true;
  unlockAudio();

  document.removeEventListener("pointerdown", unlockAudioOnFirstInteraction, true);
  document.removeEventListener("click", unlockAudioOnFirstInteraction, true);
  document.removeEventListener("keydown", unlockAudioOnFirstInteraction, true);
}

function bindAudioUnlockEvents() {
  document.addEventListener("pointerdown", unlockAudioOnFirstInteraction, { capture: true });
  document.addEventListener("click", unlockAudioOnFirstInteraction, { capture: true });
  document.addEventListener("keydown", unlockAudioOnFirstInteraction, { capture: true });
}

function bindMenuControls() {
  el.playBtn.addEventListener("click", startSelectedLevel);
  el.continueBtn.addEventListener("click", continueGame);
  el.menuSettingsBtn.addEventListener("click", () => openSettingsModal(false));
  el.menuRulesBtn.addEventListener("click", () => openRulesModal(false));
  el.menuHelpBtn.addEventListener("click", () => openHelpModal(false));

  el.levelButtons.forEach((button) => {
    button.addEventListener("click", () => selectLevelFromMenu(button.dataset.level));
  });

  document.querySelectorAll("[data-screen]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.screen));
  });
}

function selectLevelFromMenu(levelName) {
  if (canContinueSession()) {
    openConfirmModal({
      title: "Сменить уровень?",
      subtitle: "Текущая партия будет завершена.",
      confirmText: "Сменить",
      danger: true,
      onConfirm: () => {
        state.level = levelName;
        state.activeSession = false;
        state.gameStatus = "idle";
        stopTimer();
        updateLevelButtons();
        updateBestTime();
        renderContinueButton();
        closeModal();
        showToast(`Выбран уровень: ${LEVELS[state.level].label}.`);
      }
    });
    return;
  }

  state.level = levelName;
  updateLevelButtons();
  updateBestTime();
  showToast(`Выбран уровень: ${LEVELS[state.level].label}.`);
}

function bindGameControls() {
  el.pauseBtn.addEventListener("click", pauseGame);
  el.flagModeBtn.addEventListener("click", toggleFlagMode);
  el.newGameBtn.addEventListener("click", requestNewGame);
  el.clearRecordsBtn.addEventListener("click", clearRecords);
  el.clearStatsBtn.addEventListener("click", clearStats);
}

function bindModalControls() {
  el.modalBackdrop.addEventListener("click", (event) => {
    if (event.target === el.modalBackdrop && !el.modalCloseBtn.hidden) {
      closeModalSmart();
    }
  });

  el.modalCloseBtn.addEventListener("click", closeModalSmart);

  el.modalBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (actionButton) {
      handleModalAction(actionButton.dataset.action);
    }

    const settingButton = event.target.closest("[data-setting]");
    if (settingButton) {
      toggleSetting(settingButton.dataset.setting);
    }

    const themeButton = event.target.closest("[data-theme-btn]");
    if (themeButton) {
      setTheme(themeButton.dataset.themeBtn);
    }
  });
}

function handleAutoPauseLifecycle(event) {
  if (event.type === "pagehide" || document.hidden) {
    autoPauseGame();
    return;
  }

  state.lifecycleMusicPaused = false;
  AudioEngine.syncMusic();
}

function bindLifecycleEvents() {
  document.addEventListener("visibilitychange", handleAutoPauseLifecycle);
  window.addEventListener("pagehide", handleAutoPauseLifecycle);
}

function bindGlobalGuards() {
  document.addEventListener("click", (event) => {
    if (isBoardInputSuppressed()) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    }
  }, { capture: true });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (state.currentModal) {
      if (!el.modalCloseBtn.hidden) {
        closeModalSmart();
      }
      return;
    }

    if (state.currentScreen === "gameScreen") {
      pauseGame();
    } else {
      showScreen("menuScreen");
    }
  });
}

function bindLayoutEvents() {
  window.addEventListener("resize", syncBoardLayout, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(syncBoardLayout, 120), { passive: true });
}

function bindEvents() {
  bindAudioUnlockEvents();
  bindMenuControls();
  bindGameControls();
  bindModalControls();
  bindLifecycleEvents();
  bindGlobalGuards();
  bindLayoutEvents();
}

function bootstrapApp() {
  window.handleSaluteCommand = handleSaluteCommand;

  bindEvents();

  setupIcons();
  if (!state.settings.theme) {
    state.settings.theme = "arcade";
  }

  applyThemeCss();
  newGame("easy");
  state.activeSession = false;
  renderContinueButton();

  SaluteBridge.init();
  window.__MINESWEEPER_READY__ = true;
  flushQueuedSaluteCommands();
}

bootstrapApp();
