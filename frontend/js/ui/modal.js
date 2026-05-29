"use strict";

// Модальные окна

function getModalLayoutClass(title) {
      const tallModalTitles = new Set(["Настройки", "Правила", "Голосовое управление"]);
      const resultModalTitles = new Set(["Победа!", "Поражение"]);
      if (resultModalTitles.has(title)) return "modal-result";
      return tallModalTitles.has(title) ? "modal-tall" : "modal-compact";
    }
function resetModalScrollPosition() {
      const modal = el.modalBackdrop.querySelector(".modal");
      const scrollTargets = [el.modalBackdrop, modal, el.modalBody].filter(Boolean);

      scrollTargets.forEach((target) => {
        target.scrollTop = 0;
        target.scrollLeft = 0;
        if (typeof target.scrollTo === "function") target.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
    }
function openModal({ title, subtitle = "", body = "", closeable = true }) {
      state.currentModal = title;
      state.modalActionLockUntil = Date.now() + 450;
      el.modalTitle.textContent = title;
      el.modalSubtitle.textContent = subtitle;
      el.modalSubtitle.hidden = !subtitle;
      el.modalBody.innerHTML = body;
      el.modalCloseBtn.hidden = !closeable;
      el.modalBackdrop.classList.remove("modal-compact", "modal-tall", "modal-result");
      el.modalBackdrop.classList.add(getModalLayoutClass(title));
      resetModalScrollPosition();
      el.modalBackdrop.classList.add("show");
      el.modalBackdrop.setAttribute("aria-hidden", "false");

    
      requestAnimationFrame(resetModalScrollPosition);
      window.setTimeout(resetModalScrollPosition, 180);
    }
function closeModal() {
      state.currentModal = null;
      state.confirmReturnToPause = false;
      state.pendingConfirm = null;
      state.modalActionLockUntil = 0;
      el.modalBackdrop.classList.remove("show", "modal-compact", "modal-tall", "modal-result");
      el.modalBackdrop.setAttribute("aria-hidden", "true");
      el.modalBody.innerHTML = "";
    }
function closeModalSmart() {
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
