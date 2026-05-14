"use strict";

const AudioEngine = (() => {
      let ctx = null;
      let lastRevealSoundAt = 0;

      const lose_sound=new Audio("./audio/lose.wav");
      const win_sound=new Audio("./audio/win.mp3");

      lose_sound.preload = "auto";
      win_sound.preload = "auto";
      lose_sound.volume = 0.7;
      win_sound.volume = 0.7;
      try { lose_sound.load(); win_sound.load(); } catch (e) {}

      function ensureContext() {
        if (!ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return null;
          ctx = new AudioContext();
        }
        if (ctx.state === "suspended") ctx.resume();
        return ctx;
      }

      function tone(freq, duration = 0.08, type = "sine", volume = 0.05, delay = 0, ignoreSoundSetting = false) {
        if (!ignoreSoundSetting && !state.settings.sound) return;
        const audio = ensureContext();
        if (!audio) return;

        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const start = audio.currentTime + delay;
        const end = start + duration;

        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0001), start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        gain.connect(audio.destination);
        osc.start(start);
        osc.stop(end + 0.02);
      }

      function rand(min, max) { return min + Math.random() * (max - min); }

      function click() {
        const base = [470, 510, 545, 585][Math.floor(Math.random() * 4)];
        tone(base + rand(-10, 10), 0.028, "triangle", 0.1);
        tone(base * 1.52, 0.024, "sine", 0.08, 0.015);
      }

      function reveal(index = 0) {
        const now = performance.now ? performance.now() : Date.now();
        if (now - lastRevealSoundAt < 48) return;
        lastRevealSoundAt = now;

        tone(350 + Math.min(index, 18) * 5 + rand(-5, 5), 0.010, "sine", 0.052, 0.003);
      }

         function flag(isPlaced = true) {
        if (isPlaced) {
          tone(620, 0.045, "square", 0.08);
          tone(880, 0.055, "triangle", 0.05, 0.04);
        } else {
          tone(520, 0.04, "triangle", 0.08);
          tone(390, 0.055, "sine", 0.05, 0.035);
        }
      }

      function win() {
        if (!state.settings.sound) return;
        try {
          win_sound.currentTime = 0;
          const playPromise = win_sound.play();
          playPromise?.catch?.(() => {});
        } catch (e) {}
      }

      function lose() {
        if (!state.settings.sound) return;
        try {
          lose_sound.currentTime = 0;
          const playPromise = lose_sound.play();
          playPromise?.catch?.(() => {});
        } catch (e) {}
      }

      function startMusic() {
        if (!state.settings.music) return;
        const audioElement = document.getElementById('bgMusic');
        if (audioElement) {
          audioElement.volume = 0.075;
          const playPromise = audioElement.play();
          playPromise?.catch?.(() => {});
        }
      }

      function stopMusic() {
        const audioElement = document.getElementById('bgMusic');
        if (audioElement) {
          audioElement.pause();
        }
      }

      function syncMusic() {
        const shouldPlay = Boolean(state.settings.music && !state.lifecycleMusicPaused);
        shouldPlay ? startMusic() : stopMusic();
      }
      return { ensureContext, click, reveal, flag, win, lose, startMusic, stopMusic, syncMusic };
    })();
