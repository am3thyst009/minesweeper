"use strict";

/*
  Ограничение нижнего отступа ассистента.
*/
(function setupSmartAppInsetBridge() {
  const root = document.documentElement;
  const MAX_ASSISTANT_INSET = 80;
  let attachedAssistant = null;
  let lastInset = null;

  function normalizeInset(value) {
    const px = Number.parseFloat(value);
    if (!Number.isFinite(px) || px < 0) return null;
    return Math.min(Math.round(px), MAX_ASSISTANT_INSET);
  }

  function setInset(value) {
    const nextInset = normalizeInset(value);
    if (nextInset === null) return false;
    if (lastInset === nextInset) return true;
    lastInset = nextInset;

    root.style.setProperty("--smartapp-assistant-inset", `${nextInset}px`);
    root.style.setProperty(
      "--smartapp-screen-bottom-space",
      `calc(${nextInset}px + var(--smartapp-assistant-gap, 8px))`
    );
    return true;
  }

  function readInsetValue(insets) {
    if (!insets || typeof insets !== "object") return NaN;

    const keys = [
      "bottom",
      "bottomInset",
      "safeAreaBottom",
      "bottomSafeArea",
      "keyboardBottomInset",
      "nativePanelBottomInset"
    ];

    for (const key of keys) {
      const value = Number(insets[key]);
      if (Number.isFinite(value)) return value;
    }

    return NaN;
  }

  function readInsets(data) {
    if (!data || typeof data !== "object") return null;

    const candidates = [
      data.insets,
      data.payload?.insets,
      data.data?.insets,
      data.body?.insets,
      data.smart_app_data?.insets,
      data.command?.insets,
      data.action?.insets,
      data.safeArea,
      data.payload?.safeArea,
      data.data?.safeArea,
      data.body?.safeArea,
      data?.body?.payload?.insets,
      data?.payload?.data?.insets,
      data?.event?.insets
    ];

    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object") return candidate;
    }

    return null;
  }

  function applyFromEventData(data) {
    const insets = readInsets(data);
    const bottom = readInsetValue(insets);
    if (Number.isFinite(bottom)) setInset(bottom);
  }

  function onDomEvent(event) {
    applyFromEventData(event?.detail || event?.data || event);
  }

  function attachToAssistantIfReady() {
    const assistant = window.saluteAssistant || window.assistant || window.AssistantClient || null;
    if (!assistant || assistant === attachedAssistant) return;

    attachedAssistant = assistant;

    if (typeof assistant.on === "function") {
      try { assistant.on("data", applyFromEventData); } catch {}
      try { assistant.on("insets", applyFromEventData); } catch {}
      try { assistant.on("smart_app_data", applyFromEventData); } catch {}
    }

    if (typeof assistant.getInitialData === "function") {
      try {
        const initialData = assistant.getInitialData() || [];
        if (Array.isArray(initialData)) initialData.forEach(applyFromEventData);
        else applyFromEventData(initialData);
      } catch {}
    }
  }

  window.setSmartAppAssistantInset = setInset;
  window.applySmartAppAssistantInsets = applyFromEventData;

  const params = new URLSearchParams(window.location.search);
  const urlInset = params.get("assistantInset") || params.get("assistantBottom");
  if (urlInset !== null) setInset(urlInset);

  window.addEventListener("message", onDomEvent);
  window.addEventListener("smart_app_data", onDomEvent);
  window.addEventListener("assistantData", onDomEvent);
  window.addEventListener("assistant-data", onDomEvent);
  window.addEventListener("salute-insets", onDomEvent);

  attachToAssistantIfReady();
  setTimeout(attachToAssistantIfReady, 50);
  setTimeout(attachToAssistantIfReady, 300);
  setTimeout(attachToAssistantIfReady, 1200);
})();
