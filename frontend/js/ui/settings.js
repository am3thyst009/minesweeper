"use strict";

// Настройки и темы

function openSettingsModal(returnToPause = false) {
      state.pauseBeforeModal = returnToPause;
      openModal({ title: "Настройки", body: `<div class="stack">${settingRow("sound", "Звуки", "Игровые эффекты.")}${settingRow("music", "Музыка", "Фоновое сопровождение.")}${settingRow("vibration", "Вибрация", "Короткая отдача.")}${themeRow()}<button class="btn btn-secondary" type="button" data-action="back-from-settings">Назад</button></div>` });
      renderModalSettingsToggles();
    }
function settingRow(name, title, subtitle) {
      return `<div class="settings-row"><div><strong>${title}</strong><small>${subtitle}</small></div><button class="toggle ${state.settings[name] ? "on" : ""}" type="button" data-setting="${name}" aria-label="${title}"></button></div>`;
    }
function renderModalSettingsToggles() { el.modalBody.querySelectorAll("[data-setting]").forEach((button) => button.classList.toggle("on", state.settings[button.dataset.setting])); }
function toggleSetting(name) {
      state.settings[name] = !state.settings[name];
      saveSettings();
      renderModalSettingsToggles();
      AudioEngine.syncMusic();
      showToast(settingToastMessage(name));
    }
function settingLabel(name) { return { sound: "Звуки", music: "Музыка", vibration: "Вибрация" }[name] || "Настройка"; }
function settingToastMessage(name) {
      const enabled = Boolean(state.settings[name]);
      if (name === "music") return `Музыка ${enabled ? "включена" : "выключена"}.`;
      if (name === "vibration") return `Вибрация ${enabled ? "включена" : "выключена"}.`;
      if (name === "sound") return `Звуки ${enabled ? "включены" : "выключены"}.`;
      return `${settingLabel(name)} ${enabled ? "включена" : "выключена"}.`;
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
