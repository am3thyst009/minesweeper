"use strict";

function pauseActiveGameForVoiceNavigation() {
      if (state.currentScreen === "gameScreen" && state.gameStatus === "playing") {
        state.gameStatus = "paused";
        stopTimer();
        el.boardWrap.classList.add("paused");
        updateAllCells();
      }
    }

    const SALUTE_INTENTS = {
      NEW_GAME: {
        title: "Новая игра",
        phrases: ["новая игра", "начать заново", "перезапусти игру", "сыграем ещё", "начать игру"],
        reply: "Начинаю новую игру.",
        run: () => startFreshGame(state.level)
      },
      PAUSE: {
        title: "Пауза",
        phrases: ["пауза", "поставь на паузу", "останови игру", "приостанови"],
        reply: "Пауза.",
        run: () => { if (state.currentScreen === "gameScreen") pauseGame(); }
      },
      RESUME: {
        title: "Продолжить",
        phrases: ["продолжить", "продолжи", "вернуться к игре", "снять с паузы"],
        reply: "Продолжаю игру.",
        run: () => { if (canContinueSession()) continueGame(); }
      },
      MENU: {
        title: "Главное меню",
        phrases: ["в меню", "главное меню", "назад в меню", "открой меню"],
        reply: "Открываю меню.",
        run: () => {
          if (state.currentScreen === "gameScreen" && canContinueSession()) leaveGameToMenu();
          else { closeModal(); showScreen("menuScreen"); }
        }
      },
      SET_LEVEL_EASY: {
        title: "Лёгкий уровень",
        phrases: ["лёгкий уровень", "легкий уровень", "включи лёгкий", "простая игра"],
        reply: "Включён лёгкий уровень.",
        run: () => startFreshGame("easy")
      },
      SET_LEVEL_MEDIUM: {
        title: "Средний уровень",
        phrases: ["средний уровень", "включи средний", "нормальная сложность"],
        reply: "Включён средний уровень.",
        run: () => startFreshGame("medium")
      },
      SET_LEVEL_HARD: {
        title: "Сложный уровень",
        phrases: ["сложный уровень", "включи сложный", "тяжёлая игра", "максимальная сложность"],
        reply: "Включён сложный уровень.",
        run: () => startFreshGame("hard")
      },
      RULES: {
        title: "Правила",
        phrases: ["правила", "как играть", "объясни правила", "что делать"],
        reply: "Показываю правила.",
        run: () => { if (state.currentScreen === "gameScreen") pauseGame(); openRulesModal(state.gameStatus === "paused"); }
      },
      HELP: {
        title: "Помощь",
        phrases: ["помощь", "команды", "что умеешь", "голосовые команды"],
        reply: "Показываю голосовые команды.",
        run: () => { if (state.currentScreen === "gameScreen") pauseGame(); openHelpModal(state.gameStatus === "paused"); }
      },
      SETTINGS: {
        title: "Настройки",
        phrases: ["настройки", "открой настройки", "параметры", "звук"],
        reply: "Показываю настройки.",
        run: () => { if (state.currentScreen === "gameScreen") pauseGame(); openSettingsModal(state.gameStatus === "paused"); }
      },
      RECORDS: {
        title: "Рекорды",
        phrases: ["рекорды", "лучшее время", "покажи рекорды"],
        reply: "Показываю рекорды.",
        run: () => { pauseActiveGameForVoiceNavigation(); closeModal(); showScreen("recordsScreen"); }
      },
      STATS: {
        title: "Статистика",
        phrases: ["статистика", "моя статистика", "покажи статистику"],
        reply: "Показываю статистику.",
        run: () => { pauseActiveGameForVoiceNavigation(); closeModal(); showScreen("statsScreen"); }
      },
      MUSIC_ON: {
        title: "Включить музыку",
        phrases: ["запусти музыку", "включить музыку", "музыку включи", "музыка", "давай музыку", "хочу музыку"],
        reply: "Музыка включена.",
        run: () => { if (!state.settings.music) toggleSetting("music"); }
      },
      MUSIC_OFF: {
        title: "Выключить музыку",
        phrases: ["выключи музыку", "выключить музыку", "останови музыку", "музыку выключи", "без музыки", "убери музыку", "стоп музыка"],
        reply: "Музыка выключена.",
        run: () => { if (state.settings.music) toggleSetting("music"); }
      },
      FLAG_MODE_ON: {
        title: "Включить режим флага",
        phrases: ["включи режим флага", "режим флага", "включить флаги", "флаг включи", "ставить флаги", "режим маркера", "включи флаг"],
        reply: "Режим флага включён.",
        run: () => { if (!state.flagMode) toggleFlagMode(); }
      },
      FLAG_MODE_OFF: {
        title: "Выключить режим флага",
        phrases: ["выключи режим флага", "выключить флаги", "флаг выключи", "убери флаг", "отключи флаг", "без флага", "отключи режим флага"],
        reply: "Режим флага выключен.",
        run: () => { if (state.flagMode) toggleFlagMode(); }
      },
      SOUND_ON: {
        title: "Включить звуки",
        phrases: ["включи звук", "включи звуки", "звук включи", "звуки включи", "хочу звук", "верни звук"],
        reply: "Звуки включены.",
        run: () => { if (!state.settings.sound) toggleSetting("sound"); }
      },
      SOUND_OFF: {
        title: "Выключить звуки",
        phrases: ["выключи звук", "выключить звук", "выключи звуки", "звук выключи", "звуки выключи", "без звука", "убери звук", "тишина"],
        reply: "Звуки выключены.",
        run: () => { if (state.settings.sound) toggleSetting("sound"); }
      }
    };

    const SALUTE_COMMANDS_SPEC = Object.entries(SALUTE_INTENTS).map(([intent, data]) => ({
      intent,
      title: data.title,
      phrases: data.phrases,
      reply: data.reply
    }));

    const SaluteBridge = {
      initialized: false,

      init() {
        if (this.initialized) return;
        this.initialized = true;

        window.handleSaluteCommand = handleSaluteCommand;
        window.onSaluteCommand = handleSaluteCommand;
        window.SALUTE_COMMANDS_SPEC = SALUTE_COMMANDS_SPEC;

        const receive = (data) => {
          const command = extractSalutePayload(data);
          if (command) handleSaluteCommand(command);
        };

        window.addEventListener("message", (event) => receive(event.data));
        window.addEventListener("smart_app_data", (event) => receive(event.detail || event.data));
        window.addEventListener("assistantData", (event) => receive(event.detail || event.data));
        window.addEventListener("salute-command", (event) => receive(event.detail || event.data));

        this.tryInitAssistantClient(receive);
        setTimeout(() => this.tryInitAssistantClient(receive), 300);
        setTimeout(() => this.tryInitAssistantClient(receive), 1200);
      },

      tryInitAssistantClient(receive) {
        const factories = [
          window.assistant?.createAssistant,
          window.createAssistant,
          window.AssistantClient?.createAssistant,
          window.assistantClient?.createAssistant
        ].filter((factory) => typeof factory === "function");

        for (const createAssistant of factories) {
          try {
            const assistant = createAssistant({
              getState: () => ({ screen: state.currentScreen, status: state.gameStatus, level: state.level }),
              getRecoveryState: () => ({ screen: state.currentScreen, status: state.gameStatus, level: state.level })
            });

            if (!assistant) continue;

            if (typeof assistant.on === "function") {
              assistant.on("data", receive);
              assistant.on("smart_app_data", receive);
            }

            if (typeof assistant.subscribeToCommand === "function") {
              try { assistant.subscribeToCommand("smart_app_data", receive); } catch {}
            }

            if (typeof assistant.getInitialData === "function") {
              try {
                const initialData = assistant.getInitialData() || [];
                initialData.forEach(receive);
              } catch {}
            }

            window.saluteAssistant = assistant;
            return;
          } catch {}
        }
      },

      sendText(text, intent = "") {
        const bridge = window.SBER_SMARTAPP_BRIDGE || null;
        const message = { type: "smartapp-response", text, intent };

        try {
          if (bridge && typeof bridge.sendText === "function") {
            bridge.sendText(text);
            return;
          }

          if (bridge && typeof bridge.send === "function") {
            bridge.send(message);
            return;
          }

          if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, "*");
          }
        } catch {}
      }
    };

    function extractSalutePayload(data) {
      if (!data) return null;
      if (typeof data === "string") return data;

      const candidates = [
        data,
        data.action,
        data.payload,
        data.body,
        data.command,
        data.smart_app_data,
        data.data,
        data.message,
        data?.body?.smart_app_data,
        data?.command?.smart_app_data,
        data?.payload?.smart_app_data,
        data?.action?.smart_app_data,
        data?.action?.payload,
        data?.action?.command,
        data?.action?.body,
        data?.command?.action,
        data?.smart_app_data?.action,
        data?.smart_app_data?.payload,
        data?.body?.items?.[0]?.command?.smart_app_data,
        data?.payload?.items?.[0]?.command?.smart_app_data,
        data?.items?.[0]?.command?.smart_app_data,
        data?.body?.items?.[0]?.command?.action,
        data?.payload?.items?.[0]?.command?.action,
        data?.items?.[0]?.command?.action
      ];

      for (const candidate of candidates) {
        if (!candidate) continue;
        if (typeof candidate === "string") return candidate;
        if (candidate.type === "salute-command" || candidate.type === "smartapp-command" || candidate.type === "smart_app_data" || candidate.intent || candidate.command || candidate.text) {
          return candidate;
        }
      }

      return null;
    }

    function normalizeSaluteCommand(rawCommand) {
      const extracted = extractSalutePayload(rawCommand) || rawCommand;
      if (typeof extracted === "string") return { text: extracted, intent: "" };

      return {
        text: extracted?.command
          || extracted?.text
          || extracted?.messageName
          || extracted?.payload?.command
          || extracted?.payload?.text
          || extracted?.smart_app_data?.command
          || extracted?.smart_app_data?.text
          || "",
        intent: extracted?.intent
          || extracted?.payload?.intent
          || extracted?.smart_app_data?.intent
          || extracted?.messageName
          || ""
      };
    }

    function resolveSaluteIntent(rawCommand) {
      const normalized = normalizeSaluteCommand(rawCommand);
      const intent = String(normalized.intent || "").trim().toUpperCase();
      const text = String(normalized.text || "").toLowerCase().trim();
      const intentAliases = { SHOW_RECORDS: "RECORDS", SHOW_STATS: "STATS", SHOW_SETTINGS: "SETTINGS", OPEN_SETTINGS: "SETTINGS", OPEN_MENU: "MENU", ENABLE_MUSIC: "MUSIC_ON", DISABLE_MUSIC: "MUSIC_OFF", TOGGLE_FLAG: "FLAG_MODE_ON", FLAG_ON: "FLAG_MODE_ON", FLAG_OFF: "FLAG_MODE_OFF", ENABLE_SOUND: "SOUND_ON", DISABLE_SOUND: "SOUND_OFF" };

      if (intent && SALUTE_INTENTS[intent]) return intent;
      if (intentAliases[intent] && SALUTE_INTENTS[intentAliases[intent]]) return intentAliases[intent];
      if (!text) return "";

      return Object.entries(SALUTE_INTENTS).find(([, data]) => hasAny(text, data.phrases))?.[0] || "";
    }

    function handleSaluteCommand(rawCommand) {
      const intent = resolveSaluteIntent(rawCommand);
      if (!intent) {
        SaluteBridge.sendText("Команда не распознана. Скажите: помощь.");
        showToast("Команда не распознана. Скажите: помощь.");
        return;
      }

      const command = SALUTE_INTENTS[intent];
      command.run();
      SaluteBridge.sendText(command.reply, intent);
    }

    function hasAny(text, variants) { return variants.some((variant) => text.includes(variant.toLowerCase())); }
