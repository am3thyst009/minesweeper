"use strict";

function loadSettings() {
      const defaults = { sound: true, music: false, vibration: true };
      return { ...defaults, ...AppStorage.getJSON(STORAGE_KEYS.settings, {}) };
    }

    function saveSettings() { AppStorage.setJSON(STORAGE_KEYS.settings, state.settings); }

    function loadStats() {
      const defaults = { played: 0, wins: 0, losses: 0, byLevel: { easy: { played: 0, wins: 0, losses: 0 }, medium: { played: 0, wins: 0, losses: 0 }, hard: { played: 0, wins: 0, losses: 0 } } };
      try {
        const saved = AppStorage.getJSON(STORAGE_KEYS.stats, {});
        return { ...defaults, ...saved, byLevel: { easy: { ...defaults.byLevel.easy, ...(saved.byLevel?.easy || {}) }, medium: { ...defaults.byLevel.medium, ...(saved.byLevel?.medium || {}) }, hard: { ...defaults.byLevel.hard, ...(saved.byLevel?.hard || {}) } } };
      } catch { return defaults; }
    }

    function saveStats() { AppStorage.setJSON(STORAGE_KEYS.stats, state.stats); }

const el = {
      screens: Array.from(document.querySelectorAll(".screen")),
      board: document.getElementById("board"),
      boardWrap: document.getElementById("boardWrap"),
      timer: document.getElementById("timer"),
      minesLeft: document.getElementById("minesLeft"),
      bestTime: document.getElementById("bestTime"),
      status: document.getElementById("status"),
      gameTitle: document.getElementById("gameTitle"),
      toast: document.getElementById("toast"),
      confettiLayer: document.getElementById("confettiLayer"),
      recordsList: document.getElementById("recordsList"),
      statsList: document.getElementById("statsList"),
      continueBtn: document.getElementById("continueBtn"),
      playBtn: document.getElementById("playBtn"),
      pauseBtn: document.getElementById("pauseBtn"),
      flagModeBtn: document.getElementById("flagModeBtn"),
      newGameBtn: document.getElementById("newGameBtn"),
      menuSettingsBtn: document.getElementById("menuSettingsBtn"),
      menuRulesBtn: document.getElementById("menuRulesBtn"),
      menuHelpBtn: document.getElementById("menuHelpBtn"),
      clearRecordsBtn: document.getElementById("clearRecordsBtn"),
      clearStatsBtn: document.getElementById("clearStatsBtn"),
      levelButtons: Array.from(document.querySelectorAll(".level-btn")),
      modalBackdrop: document.getElementById("modalBackdrop"),
      modalTitle: document.getElementById("modalTitle"),
      modalSubtitle: document.getElementById("modalSubtitle"),
      modalBody: document.getElementById("modalBody"),
      modalCloseBtn: document.getElementById("modalCloseBtn"),
      autoPauseOverlay: document.getElementById("autoPauseOverlay")
    };

    const state = {
      level: "easy",
      board: [],
      seconds: 0,
      flags: 0,
      opened: 0,
      timerId: null,
      gameStatus: "idle", // idle | playing | paused | won | lost
      activeSession: false,
      flagMode: false,
      longPressTimer: null,
      longPressTriggered: false,
      lastNumberTap: { key: "", time: 0 },
      ignoreActivation: { key: "", until: 0 },
      settings: loadSettings(),
      stats: loadStats(),
      currentScreen: "menuScreen",
      currentModal: null,
      pauseBeforeModal: false,
      inlinePauseResumeTap: false,
      suppressBoardInputUntil: 0,
      pendingConfirm: null,
      gameId: 0
    };
