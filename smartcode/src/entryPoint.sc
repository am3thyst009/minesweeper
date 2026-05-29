require: slotfilling/slotFilling.sc
  module = sys.zb-common

# Подключение javascript обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение сценарных файлов
require: sc/gameCommands.sc

patterns:
    $AnyText = $nonEmptyGarbage

theme: /
    state: Start
        # При запуске приложения с кнопки прилетит сообщение /start.
        q!: $regex</start>
        # При запуске приложения с голоса прилетит сказанная фраза.
        q!: (запусти | открой | вруби | включи | активируй | навык) [игру] (Обычный (сапёр | сапер) | сапер | минное поле | сапёр)
        q!: сыграть в (Обычный (сапёр | сапер) | сапер | сапёр | минное поле)
        q!: давай поиграем в (Обычный (сапёр | сапер) | сапер | сапёр | минное поле)

        script:
            addGameSuggestions($context);
        a: Добро пожаловать в Сапёр! Чтобы начать, скажите Новая игра. Если вы здесь впервые, произнесите Правила или Помощь.

    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context));
            addGameSuggestions($context);
        a: Команда не распознана. Скажите: помощь.
