"use strict";

function syncBoardLayout() {
      if (!state.board.length) return;
      applyBoardLayout(LEVELS[state.level]);
    }

    window.handleSaluteCommand = handleSaluteCommand;
    window.addEventListener("resize", syncBoardLayout);
    window.addEventListener("orientationchange", () => setTimeout(syncBoardLayout, 120));

    el.playBtn.addEventListener("click", startSelectedLevel);
    el.continueBtn.addEventListener("click", continueGame);
    el.pauseBtn.addEventListener("click", pauseGame);
    el.flagModeBtn.addEventListener("click", toggleFlagMode);
    el.newGameBtn.addEventListener("click", requestNewGame);
    el.menuSettingsBtn.addEventListener("click", () => openSettingsModal(false));
    el.menuRulesBtn.addEventListener("click", () => openRulesModal(false));
    el.menuHelpBtn.addEventListener("click", () => openHelpModal(false));
    el.clearRecordsBtn.addEventListener("click", clearRecords);
    el.clearStatsBtn.addEventListener("click", clearStats);

    el.levelButtons.forEach((button) => {
      button.addEventListener("click", () => {
        if (canContinueSession()) {
          openConfirmModal({ title: "Сменить уровень?", subtitle: "Текущая партия будет завершена.", confirmText: "Сменить", danger: true, onConfirm: () => { state.level = button.dataset.level; state.activeSession = false; state.gameStatus = "idle"; stopTimer(); updateLevelButtons(); updateBestTime(); renderContinueButton(); closeModal(); showToast(`Выбран уровень: ${LEVELS[state.level].label}.`); } });
          return;
        }
        state.level = button.dataset.level;
        updateLevelButtons();
        updateBestTime();
        showToast(`Выбран уровень: ${LEVELS[state.level].label}.`);
      });
    });

    document.querySelectorAll("[data-screen]").forEach((button) => button.addEventListener("click", () => showScreen(button.dataset.screen)));
    el.modalBackdrop.addEventListener("click", (event) => {
      if (event.target === el.modalBackdrop && el.modalCloseBtn.hidden === false) {
        closeModalSmart();
      }
    });
    el.modalCloseBtn.addEventListener("click", closeModalSmart);
    el.modalBody.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-action]");
      if (actionButton) handleModalAction(actionButton.dataset.action);
      const settingButton = event.target.closest("[data-setting]");
      if (settingButton) toggleSetting(settingButton.dataset.setting);
    });


    function handleAutoPauseLifecycle(event) {
      if (event.type === "pagehide" || document.hidden) {
        autoPauseGame();
      }
    }

    document.addEventListener("visibilitychange", handleAutoPauseLifecycle);
    window.addEventListener("pagehide", handleAutoPauseLifecycle);


    el.autoPauseOverlay?.addEventListener("pointerdown", (event) => {
      resumeFromAutoPause(event);
    }, { capture: true });

    el.autoPauseOverlay?.addEventListener("click", (event) => {
      if (isBoardInputSuppressed()) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();
      }
    }, { capture: true });

    document.addEventListener("pointerdown", (event) => {
      if (
        state.currentScreen === "gameScreen" &&
        state.gameStatus === "paused" &&
        state.inlinePauseResumeTap &&
        !state.currentModal
      ) {
        resumeFromAutoPause(event);
      }
    }, { capture: true });

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
        if (!el.modalCloseBtn.hidden) closeModalSmart();
        return;
      }
      if (state.currentScreen === "gameScreen") pauseGame();
      else showScreen("menuScreen");
    });

    setupIcons();
    newGame("easy");
    state.activeSession = false;
    renderContinueButton();
    SaluteBridge.init();

