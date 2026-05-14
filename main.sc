theme: /

    state: Start
        q!: $regex</start>
        q!: старт
        q!: запусти сапёр
        q!: открой сапёр
        q!: cыграть в cапёр
        q!: открой минное поле

        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "text",
                "text": "Сапёр запущен. Скажите: новая игра, помощь или правила."
            });

    state: NewGame
        q!: новая игра
        q!: начать игру
        q!: играть
        q!: заново
        q!: перезапусти
        q!: перезапустить
        q!: сыграем ещё
        q!: начни заново
        q!: стартуем
        q!: старт
        q!: сыграй ещё
        q!: еще раз 
        q!: заново начни 
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "NEW_GAME"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "NEW_GAME"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Начинаю новую игру."
            });

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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "PAUSE"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "PAUSE"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Пауза."
            });

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
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "RESUME"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "RESUME"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Продолжаю игру."
            });

    state: Easy
        q!: легкий уровень
        q!: лёгкий уровень
        q!: поставь лёгкий уровень
        q!: включи лёгкий уровень
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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_EASY"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_EASY"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Включён лёгкий уровень."
            });

    state: Medium
        q!: средний уровень
        q!: поставь средний уровень
        q!: включи средний уровень
        q!: обычный уровень
        q!: нормальная сложность
        q!: средняя сложность
        q!: обычная сложность
        q!: стандартная сложность 
        q!: сложнее, чем простой уровень
        q!: запусти средний уровень 
        q!: начни средний уровень 
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_MEDIUM"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_MEDIUM"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Включён средний уровень."
            });

    state: Hard
        q!: сложный уровень
        q!: поставь сложный уровень
        q!: включи сложный уровень
        q!: хард
        q!: максимальный уровень
        q!: тяжёлая игра
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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_HARD"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SET_LEVEL_HARD"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Включён сложный уровень."
            });

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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "RULES"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "RULES"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Показываю правила."
            });

    state: Help
        q!: помощь
        q!: команды
        q!: что ты умеешь
        q!: что можно сказать
        q!: голосовые команды
        q!: помогите
        q!: какие команды
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "HELP"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "HELP"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Показываю голосовые команды."
            });

    state: Settings
        q!: настройки
        q!: открой настройки
        q!: параметры
        q!: звук
        q!: музыка
        q!: вибрация
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SETTINGS"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SETTINGS"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Показываю настройки."
            });

    state: Records
        q!: рекорды
        q!: покажи рекорды
        q!: лучший результат
        q!: лучшее время
        q!: рекорд 
        q!: лучший результат 
        q!: достижения 
        q!: успехи
        q!: покажи рекорды
        q!: максимальное время 
        q!: покажи максимальное время
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "RECORDS"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "RECORDS"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Показываю рекорды."
            });

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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "STATS"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "STATS"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Показываю статистику."
            });

    state: Menu
        q!: в меню
        q!: главное меню
        q!: назад в меню
        q!: открой меню
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "MENU"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "MENU"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Открываю меню."
            });

    state: NoMatch
        event!: noMatch
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "text",
                "text": "Команда не распознана. Скажите: помощь."
            });

    state: MusicOn
        q!: включи музыку
        q!: включить музыку
        q!: запусти музыку
        q!: музыку включи
        q!: музыка
        q!: давай музыку
        q!: хочу музыку
        q!: поставь музыку
        q!: фоновая музыка
        q!: включи фоновую музыку
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "MUSIC_ON"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "MUSIC_ON"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Музыка включена."
            });

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
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "MUSIC_OFF"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "MUSIC_OFF"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Музыка выключена."
            });

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
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "FLAG_MODE_ON"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "FLAG_MODE_ON"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Режим флага включён."
            });

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
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "FLAG_MODE_OFF"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "FLAG_MODE_OFF"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Режим флага выключен."
            });

    state: SoundOn
        q!: включи звук
        q!: включить звук
        q!: включи звуки
        q!: звук включи
        q!: звуки включи
        q!: хочу звук
        q!: верни звук
        q!: звуковые эффекты включи
        q!: включи звуковые эффекты
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SOUND_ON"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SOUND_ON"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Звуки включены."
            });

    state: SoundOff
        q!: выключи звук
        q!: выключить звук
        q!: выключи звуки
        q!: звук выключи
        q!: звуки выключи
        q!: без звука
        q!: убери звук
        q!: тишина
        q!: звуковые эффекты выключи
        q!: выключи звуковые эффекты
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
                "type": "raw",
                "messageName": "ANSWER_TO_USER",
                "body": {
                    "items": [
                        {
                            "command": {
                                "type": "smart_app_data",
                                "smart_app_data": {
                                    "type": "salute-command",
                                    "intent": "SOUND_OFF"
                                },
                                "action": {
                                    "type": "salute-command",
                                    "intent": "SOUND_OFF"
                                }
                            }
                        }
                    ]
                }
            });
            $response.replies.push({
                "type": "text",
                "text": "Звуки выключены."
            });
