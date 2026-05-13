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
        q!: останови игру
        q!: стоп
        q!: приостанови
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
