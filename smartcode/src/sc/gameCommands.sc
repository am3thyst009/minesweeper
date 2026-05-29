theme: /

    state: NewGame
        q!: новая игра
        q!: начать игру
        q!: заново
        q!: перезапусти
        q!: перезапустить
        q!: сыграем ещё
        q!: сыграем еще
        q!: начни заново
        q!: стартуем
        q!: старт
        q!: сыграй ещё
        q!: сыграй еще
        q!: еще раз
        q!: ещё раз
        q!: заново начни
        script:
            sendGameCommand("NEW_GAME", $context);
            addGameSuggestions($context);
        a: Начинаю новую игру.

    state: Pause
        q!: пауза
        q!: поставь на паузу
        q!: стоп
        q!: приостанови
        q!: прекрати
        q!: останови
        q!: остановка
        q!: перерыв
        q!: передышка
        q!: прервись
        q!: остановить
        q!: перемирие
        q!: остановись
        script:
            sendGameCommand("PAUSE", $context);
            addGameSuggestions($context);
        a: Пауза.

    state: Resume
        q!: продолжить
        q!: продолжи
        q!: дальше
        q!: играем
        q!: снять паузу
        q!: вернуться к игре
        q!: продолжаем
        q!: поехали
        q!: верни к игре
        q!: играть
        script:
            sendGameCommand("RESUME", $context);
            addGameSuggestions($context);
        a: Продолжаю игру.

    state: Easy
        q!: легкий уровень
        q!: лёгкий уровень
        q!: поставь лёгкий уровень
        q!: поставь легкий уровень
        q!: включи лёгкий уровень
        q!: включи легкий уровень
        q!: простой уровень
        q!: простая игра
        q!: первый уровень
        q!: уровень для новичков
        q!: запусти легкий уровень
        q!: запусти лёгкий уровень
        q!: базовый уровень
        q!: несложный уровень
        q!: запусти простой уровень
        q!: начни легкий уровень
        q!: начни лёгкий уровень
        q!: запусти первый уровень
        q!: начни первый уровень
        q!: поставь первый уровень
        script:
            sendGameCommand("SET_LEVEL_EASY", $context);
            addGameSuggestions($context);
        a: Включён лёгкий уровень.

    state: Medium
        q!: средний уровень
        q!: поставь средний уровень
        q!: включи средний уровень
        q!: обычный уровень
        q!: нормальная сложность
        q!: средняя сложность
        q!: обычная сложность
        q!: стандартная сложность
        q!: сложнее чем простой уровень
        q!: запусти средний уровень
        q!: начни средний уровень
        script:
            sendGameCommand("SET_LEVEL_MEDIUM", $context);
            addGameSuggestions($context);
        a: Включён средний уровень.

    state: Hard
        q!: сложный уровень
        q!: поставь сложный уровень
        q!: включи сложный уровень
        q!: хард
        q!: максимальный уровень
        q!: тяжёлая игра
        q!: тяжелая игра
        q!: последняя сложность
        q!: самая сложная сложность
        q!: трудная сложность
        q!: запусти сложный уровень
        q!: начни сложный уровень
        q!: трудный уровень
        q!: последний уровень
        q!: уровень сложный
        q!: сложность последняя
        q!: сложность сложная
        q!: уровень последний
        q!: сложность трудная
        q!: уровень трудный
        script:
            sendGameCommand("SET_LEVEL_HARD", $context);
            addGameSuggestions($context);
        a: Включён сложный уровень.

    state: Rules
        q!: правила
        q!: как играть
        q!: объясни правила
        q!: инструкция
        q!: что делать
        q!: что это
        q!: правила игры
        q!: гайд
        q!: обучение
        q!: это что
        q!: правила объясни
        q!: играть как
        script:
            sendGameCommand("RULES", $context);
            addGameSuggestions($context);
        a: Показываю правила.

    state: Help
        q!: помощь
        q!: команды
        q!: что ты умеешь
        q!: что можно сказать
        q!: голосовые команды
        q!: помогите
        q!: какие команды
        script:
            sendGameCommand("HELP", $context);
            addGameSuggestions($context);
        a: Показываю голосовые команды.

    state: Settings
        q!: настройки
        q!: открой настройки
        q!: параметры
        q!: звук
        q!: музыка
        q!: вибрация
        script:
            sendGameCommand("SETTINGS", $context);
            addGameSuggestions($context);
        a: Показываю настройки.

    state: Records
        q!: рекорды
        q!: покажи рекорды
        q!: лучший результат
        q!: лучшее время
        q!: рекорд
        q!: достижения
        q!: успехи
        q!: максимальное время
        q!: покажи максимальное время
        script:
            sendGameCommand("RECORDS", $context);
            addGameSuggestions($context);
        a: Показываю рекорды.

    state: Stats
        q!: статистика
        q!: покажи статистику
        q!: мои игры
        q!: результаты
        q!: как сыграл
        q!: все игры
        q!: результат
        q!: запусти статистику
        script:
            sendGameCommand("STATS", $context);
            addGameSuggestions($context);
        a: Показываю статистику.

    state: Menu
        q!: в меню
        q!: главное меню
        q!: назад в меню
        q!: открой меню
        script:
            sendGameCommand("MENU", $context);
            addGameSuggestions($context);
        a: Открываю меню.

    state: MusicOn
        q!: запусти музыку
        q!: включить музыку
        q!: включи музыку
        q!: музыку включи
        q!: давай музыку
        q!: хочу музыку
        q!: фоновая музыка
        q!: включи фоновую музыку
        script:
            sendGameCommand("MUSIC_ON", $context);
            addGameSuggestions($context);
        a: Музыка включена.

    state: MusicOff
        q!: выключи музыку
        q!: выключить музыку
        q!: останови музыку
        q!: музыку выключи
        q!: без музыки
        q!: убери музыку
        q!: стоп музыка
        q!: отключи музыку
        q!: убери фоновую музыку
        q!: выключи фоновую музыку
        script:
            sendGameCommand("MUSIC_OFF", $context);
            addGameSuggestions($context);
        a: Музыка выключена.

    state: FlagModeOn
        q!: включи режим флага
        q!: режим флага
        q!: включить флаги
        q!: флаг включи
        q!: ставить флаги
        q!: режим маркера
        q!: включи флаг
        q!: режим флажка
        q!: включи флажки
        q!: запусти режим флага
        q!: режим флага включи
        script:
            sendGameCommand("FLAG_MODE_ON", $context);
            addGameSuggestions($context);
        a: Режим флага включён.

    state: FlagModeOff
        q!: выключи режим флага
        q!: выключить флаги
        q!: флаг выключи
        q!: убери флаг
        q!: отключи флаг
        q!: без флага
        q!: отключи режим флага
        q!: выключи флажки
        q!: убери флажки
        q!: режим флага выключи
        script:
            sendGameCommand("FLAG_MODE_OFF", $context);
            addGameSuggestions($context);
        a: Режим флага выключен.

    state: SoundOn
        q!: звуковые эффекты включи
        q!: включи звук
        q!: включи звуки
        q!: звуки включи
        q!: хочу звук
        q!: включи звуковые эффекты
        q!: запусти звуки
        script:
            sendGameCommand("SOUND_ON", $context);
            addGameSuggestions($context);
        a: Звуки включены.

    state: SoundOff
        q!: звуковые эффекты выключи
        q!: выключи звук
        q!: выключи звуки
        q!: звуки выключи
        q!: убери звук
        q!: тишина
        q!: убери звуковые эффекты
        script:
            sendGameCommand("SOUND_OFF", $context);
            addGameSuggestions($context);
        a: Звуки выключены.
