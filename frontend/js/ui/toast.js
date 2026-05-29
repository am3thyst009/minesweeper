"use strict";

// Уведомления

function showToast(message) {
      el.toast.textContent = message;
      el.toast.classList.add("show");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => el.toast.classList.remove("show"), 2600);
    }
