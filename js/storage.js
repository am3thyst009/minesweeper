"use strict";

const AppStorage = (() => {
      const memory = new Map();

      function getBridgeStorage() {
        return window.SBER_SMARTAPP_STORAGE || null;
      }

      function getLocalStorage() {
        try {
          const testKey = "__sber_minesweeper_storage_test__";
          window.localStorage.setItem(testKey, "1");
          window.localStorage.removeItem(testKey);
          return window.localStorage;
        } catch {
          return null;
        }
      }

      function getAdapter() {
        return getBridgeStorage() || getLocalStorage();
      }

      function getItem(key) {
        try {
          const adapter = getAdapter();
          if (adapter && typeof adapter.getItem === "function") {
            const value = adapter.getItem(key);
            return value == null ? null : String(value);
          }
        } catch (error) {
          console.warn("AppStorage.getItem fallback:", error);
        }

        return memory.has(key) ? memory.get(key) : null;
      }

      function setItem(key, value) {
        const stringValue = String(value);
        try {
          const adapter = getAdapter();
          if (adapter && typeof adapter.setItem === "function") {
            adapter.setItem(key, stringValue);
            return;
          }
        } catch (error) {
          console.warn("AppStorage.setItem fallback:", error);
        }

        memory.set(key, stringValue);
      }

      function removeItem(key) {
        try {
          const adapter = getAdapter();
          if (adapter && typeof adapter.removeItem === "function") {
            adapter.removeItem(key);
            return;
          }
        } catch (error) {
          console.warn("AppStorage.removeItem fallback:", error);
        }

        memory.delete(key);
      }

      function getJSON(key, fallback) {
        try {
          const raw = getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      }

      function setJSON(key, value) {
        setItem(key, JSON.stringify(value));
      }

      return { getItem, setItem, removeItem, getJSON, setJSON };
    })();
