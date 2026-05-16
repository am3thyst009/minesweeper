"use strict";

const LEVELS = {
      easy: { label: "Лёгкий", rows: 8, cols: 8, mines: 10 },
      medium: { label: "Средний", rows: 16, cols: 16, mines: 40 },
      hard: { label: "Сложный", rows: 16, cols: 30, mines: 99 }
    };

    const STORAGE_KEYS = {
      settings: "sber_minesweeper_settings_v4",
      stats: "sber_minesweeper_stats_v4",
      bestPrefix: "sber_minesweeper_best_v4_"
    };
    /*
      Адаптер хранения данных.
      Приоритет: внешнее хранилище SmartApp → localStorage → память процесса.
    */

const LONG_PRESS_MS = 380;

const THEMES = {
      arcade: {
        label: "Аркада",
        boardBg: "#14192f",
        cellClosedTop: "#8a90c8",
        cellClosedBot: "#404880",
        cellClosedStroke: "rgba(212,220,255,0.20)",
        cellOpenTop: "#303870",
        cellOpenBot: "#1e2450",
        cellFlagTop: "#6e3434",
        cellFlagBot: "#2b171a",
      },
      blue: {
        label: "Синяя",
        boardBg:          "#05070e",
        cellClosedTop:    "#8a9ad8",
        cellClosedBot:    "#2e3c7d",
        cellClosedStroke: "rgba(170,187,255,0.22)",
        cellOpenTop:      "#2e3874",
        cellOpenBot:      "#141a3a",
        cellFlagTop:      "#8a304c",
        cellFlagBot:      "#3a1424",
      },
      teal: {
        label: "Бирюзовая",
        boardBg: "#060e14",
        cellClosedTop: "#7acec4",
        cellClosedBot: "#2a6860",
        cellClosedStroke: "rgba(169,255,243,0.20)",
        cellOpenTop: "#2a5752",
        cellOpenBot: "#162f2d",
        cellFlagTop: "#2a4855",
        cellFlagBot: "#12232a",
      },
      crimson: {
        label: "Алая",
        boardBg: "#0e0507",
        cellClosedTop: "#c47a8a",
        cellClosedBot: "#6b2e3c",
        cellClosedStroke: "rgba(255,170,187,0.20)",
        cellOpenTop: "#4d2830",
        cellOpenBot: "#2a1318",
        cellFlagTop: "#5a1e28",
        cellFlagBot: "#2d0e13",
      },
    };

    const Icons = {
      mine: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M30 6h4v10h-4zM30 48h4v10h-4zM6 30h10v4H6zM48 30h10v4H48zM11.5 14.4l2.9-2.9 7 7-2.9 2.9zM42.6 45.5l2.9-2.9 7 7-2.9 2.9zM42.6 18.5l7-7 2.9 2.9-7 7zM11.5 49.6l7-7 2.9 2.9-7 7z" opacity=".58"/><circle cx="32" cy="32" r="17" fill="currentColor"/><circle cx="25" cy="24" r="5" fill="#fff" opacity=".22"/></svg>`,
      flag: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M19 8h5v48h-5z"/><path fill="currentColor" d="M24 10c8-5 15 5 25 0v26c-10 5-17-5-25 0z"/><path fill="currentColor" d="M14 54h24v4H14z" opacity=".72"/></svg>`,
      restart: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M32 10a22 22 0 1 1-19.2 11.3h-6A28 28 0 1 0 32 4v6z"/><path fill="currentColor" d="M8 8v17h17z"/></svg>`,
      menu: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M12 18h40v5H12zM12 30h40v5H12zM12 42h40v5H12z"/></svg>`,
      back: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M35 12 15 32l20 20 4-4-13-13h25v-6H26l13-13z"/></svg>`,
      trophy: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M20 8h24v8h8v8c0 9-5 15-13 16-1 4-3 7-5 8v4h10v6H20v-6h10v-4c-2-1-4-4-5-8-8-1-13-7-13-16v-8h8zm24 14v11c4-1 7-4 7-9v-2zm-31 0v2c0 5 3 8 7 9V22z"/></svg>`,
      burst: `<svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="m32 3 6 18 17-8-8 17 18 6-18 6 8 17-17-8-6 18-6-18-17 8 8-17-18-6 18-6-8-17 17 8z"/></svg>`
    };
