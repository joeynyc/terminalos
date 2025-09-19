let soundboardController = null;

const journeySection = document.querySelector('.journey');

if (journeySection) {
  const steps = Array.from(journeySection.querySelectorAll('.journey-step'));
  const indicator = journeySection.querySelector('.journey__stage-indicator');
  const indicatorNumber = indicator?.querySelector('.journey__stage-number');
  const indicatorLabel = indicator?.querySelector('.journey__stage-label');
  const glows = Array.from(journeySection.querySelectorAll('.journey__glow'));

  if (steps.length && indicator && indicatorNumber && indicatorLabel) {
    const activateStep = (step) => {
      steps.forEach((item) => {
        if (item === step) {
          item.classList.add('is-active');
        } else {
          item.classList.remove('is-active');
        }
      });

      const stageId = step.dataset.stage ?? '';
      const title = step.querySelector('.journey-step__title')?.textContent?.trim();

      indicator.dataset.stage = stageId;
      indicatorNumber.textContent = stageId.padStart(2, '0');

      if (title) {
        indicatorLabel.textContent = title;
      }

      soundboardController?.highlightStage(stageId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          activateStep(visible[0].target);
        }
      },
      {
        threshold: [0.4, 0.6, 0.75],
        rootMargin: '0px 0px -20% 0px',
      }
    );

    steps.forEach((step) => observer.observe(step));

    const initialActive = steps.find((step) => step.classList.contains('is-active'));
    if (initialActive) {
      activateStep(initialActive);
    }
  }

  const updatePointerEffects = (event) => {
    const rect = journeySection.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

    journeySection.style.setProperty('--cursor-x', `${x * 100}%`);
    journeySection.style.setProperty('--cursor-y', `${y * 100}%`);

    glows.forEach((glow, index) => {
      const intensity = (index + 1) / (glows.length + 1);
      const offsetX = (x - 0.5) * 60 * intensity;
      const offsetY = (y - 0.5) * 60 * intensity;
      glow.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      glow.style.opacity = `${0.45 + Math.abs(x - 0.5) * 0.4}`;
    });
  };

  const resetPointerEffects = () => {
    journeySection.style.removeProperty('--cursor-x');
    journeySection.style.removeProperty('--cursor-y');
    glows.forEach((glow) => {
      glow.style.transform = '';
      glow.style.opacity = '';
    });
  };

  journeySection.addEventListener('pointermove', updatePointerEffects);
  journeySection.addEventListener('pointerleave', resetPointerEffects);
}

function initSoundboard() {
  const root = document.querySelector('.soundboard');
  if (!root) {
    return null;
  }

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const supportsAudio = typeof AudioContextClass === 'function';

  const transportToggle = root.querySelector("[data-soundboard-action='toggle']");
  const transportReset = root.querySelector("[data-soundboard-action='reset']");
  const channels = Array.from(root.querySelectorAll('.soundboard-channel'));

  if (!channels.length) {
    return {
      highlightStage: () => {},
    };
  }

  if (!supportsAudio) {
    root.dataset.audioUnavailable = 'true';
  }

  const channelProfiles = {
    default: {
      pan: 0,
      toneType: 'sine',
      toneFrequency: 86,
      toneLevel: 0.18,
      modFrequency: 0.22,
      modDepth: 0.05,
      noiseColor: 'air',
      noiseLevel: 0.18,
      noiseRate: 1,
      noiseLfoFreq: 0.13,
      noiseLfoDepth: 0.05,
    },
    '01': {
      pan: -0.42,
      toneType: 'sine',
      toneFrequency: 58,
      toneLevel: 0.24,
      modFrequency: 0.18,
      modDepth: 0.045,
      noiseColor: 'earth',
      noiseLevel: 0.28,
      noiseRate: 0.85,
      noiseLfoFreq: 0.12,
      noiseLfoDepth: 0.07,
    },
    '02': {
      pan: -0.08,
      toneType: 'triangle',
      toneFrequency: 94,
      toneLevel: 0.2,
      modFrequency: 0.2,
      modDepth: 0.055,
      noiseColor: 'air',
      noiseLevel: 0.24,
      noiseRate: 0.92,
      noiseLfoFreq: 0.14,
      noiseLfoDepth: 0.06,
    },
    '03': {
      pan: 0.24,
      toneType: 'sawtooth',
      toneFrequency: 164,
      toneLevel: 0.18,
      modFrequency: 0.28,
      modDepth: 0.065,
      noiseColor: 'shimmer',
      noiseLevel: 0.22,
      noiseRate: 1.08,
      noiseLfoFreq: 0.18,
      noiseLfoDepth: 0.07,
    },
    '04': {
      pan: 0.46,
      toneType: 'sine',
      toneFrequency: 120,
      toneLevel: 0.22,
      modFrequency: 0.24,
      modDepth: 0.05,
      noiseColor: 'air',
      noiseLevel: 0.26,
      noiseRate: 1,
      noiseLfoFreq: 0.16,
      noiseLfoDepth: 0.08,
    },
  };

  let audioCtx;
  let masterGain;
  let isPlaying = false;
  let activeSoloStage = null;
  let highlightedStage = null;
  let broadcastStage = null;

  const channelStates = [];

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);

  const updateTransportUI = () => {
    if (!transportToggle) {
      return;
    }

    const label = transportToggle.querySelector('.soundboard__transport-label');

    if (!supportsAudio) {
      if (label) {
        label.textContent = 'Audio unavailable';
      }
      transportToggle.setAttribute('aria-pressed', 'false');
      transportToggle.disabled = true;
      return;
    }

    if (label) {
      label.textContent = isPlaying ? 'Pause Mix' : 'Play Mix';
    }

    transportToggle.setAttribute('aria-pressed', String(isPlaying));
  };

  const fadeMaster = (target, duration = 0.6) => {
    if (!audioCtx || !masterGain) {
      return;
    }

    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(clamp(target, 0, 1), now + duration);
  };

  const applyGain = (state, value, immediate = false) => {
    if (!state.gainNode || !audioCtx) {
      return;
    }

    const gain = state.gainNode.gain;
    const now = audioCtx.currentTime;
    const target = clamp(value, 0, 1.4);

    gain.cancelScheduledValues(now);

    if (immediate) {
      gain.setValueAtTime(target, now);
      return;
    }

    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(target, now + 0.25);
  };

  const updateMix = (immediate = false) => {
    const soloStage = activeSoloStage;
    const highlightActive = Boolean(highlightedStage && channelStates.some((state) => state.stage === highlightedStage));

    channelStates.forEach((state) => {
      const base = clamp(state.userGain, 0, 1.2);
      const soloMultiplier = soloStage ? (state.stage === soloStage ? 1 : 0) : 1;
      const muteMultiplier = state.isMuted ? 0 : 1;
      const highlightMultiplier = highlightActive
        ? state.highlightWeight
        : 1;

      const nextValue = base * soloMultiplier * muteMultiplier * highlightMultiplier;
      state.pendingGain = nextValue;
      state.element.dataset.muted = state.isMuted ? 'true' : 'false';

      applyGain(state, nextValue, immediate);
    });
  };

  const setPlaying = (nextPlaying) => {
    if (!audioCtx || !masterGain || !supportsAudio) {
      return;
    }

    if (isPlaying === nextPlaying) {
      return;
    }

    isPlaying = nextPlaying;
    updateTransportUI();
    fadeMaster(nextPlaying ? 0.85 : 0, nextPlaying ? 0.8 : 0.6);
  };

  const createNoiseLayer = (ctx, profile) => {
    const duration = 2.4;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.playbackRate.value = profile.noiseRate ?? 1;

    let currentNode = source;
    if (profile.noiseColor === 'earth') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 680;
      filter.Q.value = 0.8;
      currentNode.connect(filter);
      currentNode = filter;
    } else if (profile.noiseColor === 'shimmer') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1400;
      filter.Q.value = 0.9;
      currentNode.connect(filter);
      currentNode = filter;
    } else if (profile.noiseColor === 'air') {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 1.2;
      currentNode.connect(filter);
      currentNode = filter;
    }

    const gainNode = ctx.createGain();
    gainNode.gain.value = profile.noiseLevel ?? 0.2;
    currentNode.connect(gainNode);

    let modulator = null;
    if (profile.noiseLfoFreq && profile.noiseLfoDepth) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = profile.noiseLfoFreq;
      lfoGain.gain.value = profile.noiseLfoDepth;
      lfo.connect(lfoGain).connect(gainNode.gain);
      lfo.start();
      modulator = lfo;
    }

    return {
      source,
      output: gainNode,
      gainNode,
      modulator,
    };
  };

  const createChannelNodes = (state) => {
    if (!supportsAudio || !audioCtx || state.gainNode) {
      return;
    }

    const profile = channelProfiles[state.stage] ?? channelProfiles.default;

    const channelGain = audioCtx.createGain();
    channelGain.gain.value = clamp(state.pendingGain, 0, 1.2);
    state.gainNode = channelGain;

    const panner = audioCtx.createStereoPanner();
    panner.pan.value = profile.pan ?? 0;
    channelGain.connect(panner).connect(masterGain);

    const toneOsc = audioCtx.createOscillator();
    toneOsc.type = profile.toneType ?? 'sine';
    toneOsc.frequency.value = profile.toneFrequency ?? 90;

    const toneGain = audioCtx.createGain();
    toneGain.gain.value = profile.toneLevel ?? 0.2;
    toneOsc.connect(toneGain).connect(channelGain);
    toneOsc.start();
    state.toneOsc = toneOsc;
    state.toneGain = toneGain;

    if (profile.modFrequency && profile.modDepth) {
      const modOsc = audioCtx.createOscillator();
      modOsc.type = 'sine';
      modOsc.frequency.value = profile.modFrequency;
      const modGain = audioCtx.createGain();
      modGain.gain.value = profile.modDepth;
      modOsc.connect(modGain).connect(toneGain.gain);
      modOsc.start();
      state.modOsc = modOsc;
      state.modGain = modGain;
    }

    const noiseLayer = createNoiseLayer(audioCtx, profile);
    if (noiseLayer) {
      noiseLayer.output.connect(channelGain);
      noiseLayer.source.start();
      state.noiseSource = noiseLayer.source;
      state.noiseGain = noiseLayer.gainNode;
      state.noiseModulator = noiseLayer.modulator;
    }

    applyGain(state, state.pendingGain, true);
  };

  const channelPointerMove = (event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    target.style.setProperty('--cursor-x', `${x * 100}%`);
    target.style.setProperty('--cursor-y', `${y * 100}%`);
  };

  const channelPointerLeave = (event) => {
    const target = event.currentTarget;
    if (target instanceof HTMLElement) {
      target.style.removeProperty('--cursor-x');
      target.style.removeProperty('--cursor-y');
    }
  };

  channels.forEach((channel) => {
    const slider = channel.querySelector("input[data-action='gain']");
    const soloBtn = channel.querySelector("[data-action='solo']");
    const muteBtn = channel.querySelector("[data-action='mute']");
    const stage = channel.dataset.stage ?? '';
    const initialValue = slider ? Number(slider.value) : 60;
    const userGain = Number.isFinite(initialValue) ? clamp(initialValue / 100, 0, 1.2) : 0.6;

    const state = {
      stage,
      element: channel,
      slider,
      soloBtn,
      muteBtn,
      defaultSliderValue: initialValue,
      userGain,
      highlightWeight: 1,
      isMuted: false,
      isSolo: false,
      gainNode: null,
      pendingGain: userGain,
    };

    channel.addEventListener('pointermove', channelPointerMove);
    channel.addEventListener('pointerleave', channelPointerLeave);

    if (slider instanceof HTMLInputElement) {
      const handleSliderInput = (event) => {
        const { value } = event.currentTarget;
        state.userGain = clamp(Number(value) / 100, 0, 1.2);
        updateMix();
      };

      slider.addEventListener('input', handleSliderInput);
      slider.addEventListener('change', handleSliderInput);
    }

    if (soloBtn instanceof HTMLButtonElement) {
      soloBtn.setAttribute('aria-pressed', 'false');
      soloBtn.addEventListener('click', async () => {
        const willSolo = activeSoloStage !== state.stage;
        activeSoloStage = willSolo ? state.stage : null;

        channelStates.forEach((otherState) => {
          const isSolo = willSolo && otherState.stage === state.stage;
          otherState.isSolo = isSolo;
          if (otherState.soloBtn instanceof HTMLButtonElement) {
            otherState.soloBtn.setAttribute('aria-pressed', String(isSolo));
          }
        });

        if (willSolo && state.isMuted) {
          state.isMuted = false;
          if (muteBtn instanceof HTMLButtonElement) {
            muteBtn.setAttribute('aria-pressed', 'false');
          }
        }

        updateMix();

        if (willSolo && supportsAudio) {
          const ok = await ensureContext();
          if (ok && !isPlaying) {
            setPlaying(true);
          }
        }
      });
    }

    if (muteBtn instanceof HTMLButtonElement) {
      muteBtn.setAttribute('aria-pressed', 'false');
      muteBtn.addEventListener('click', () => {
        state.isMuted = !state.isMuted;
        muteBtn.setAttribute('aria-pressed', String(state.isMuted));

        if (state.isMuted && activeSoloStage === state.stage) {
          activeSoloStage = null;
          channelStates.forEach((otherState) => {
            otherState.isSolo = false;
            if (otherState.soloBtn instanceof HTMLButtonElement) {
              otherState.soloBtn.setAttribute('aria-pressed', 'false');
            }
          });
        }

        updateMix();
      });
    }

    channelStates.push(state);
  });

  const ensureContext = async () => {
    if (!supportsAudio) {
      return false;
    }

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0;
      masterGain.connect(audioCtx.destination);

      channelStates.forEach((state) => {
        createChannelNodes(state);
      });

      updateMix(true);
    }

    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    return true;
  };

  if (!supportsAudio && transportReset) {
    transportReset.disabled = true;
    transportReset.setAttribute('aria-disabled', 'true');
  }

  if (transportToggle && supportsAudio) {
    transportToggle.addEventListener('click', async () => {
      const ok = await ensureContext();
      if (!ok) {
        return;
      }

      if (isPlaying) {
        setPlaying(false);
      } else {
        updateMix();
        setPlaying(true);
      }
    });
  }

  if (transportReset && supportsAudio) {
    transportReset.addEventListener('click', async () => {
      if (!audioCtx) {
        activeSoloStage = null;
        channelStates.forEach((state) => {
          state.isSolo = false;
          state.isMuted = false;
          if (state.soloBtn instanceof HTMLButtonElement) {
            state.soloBtn.setAttribute('aria-pressed', 'false');
          }
          if (state.muteBtn instanceof HTMLButtonElement) {
            state.muteBtn.setAttribute('aria-pressed', 'false');
          }
        });
        updateMix(true);
        isPlaying = false;
        updateTransportUI();
        return;
      }

      await ensureContext();
      setPlaying(false);

      activeSoloStage = null;
      channelStates.forEach((state) => {
        if (state.isSolo || state.isMuted) {
          state.isSolo = false;
          state.isMuted = false;
          if (state.soloBtn instanceof HTMLButtonElement) {
            state.soloBtn.setAttribute('aria-pressed', 'false');
          }
          if (state.muteBtn instanceof HTMLButtonElement) {
            state.muteBtn.setAttribute('aria-pressed', 'false');
          }
        }
      });

      updateMix(true);
    });
  }

  const highlightStage = (stageId) => {
    const hasMatch = channelStates.some((state) => state.stage === stageId);
    highlightedStage = hasMatch ? stageId : null;

    channelStates.forEach((state) => {
      const isMatch = highlightedStage && state.stage === highlightedStage;
      state.highlightWeight = highlightedStage ? (isMatch ? 1.12 : 0.92) : 1;
      state.element.classList.toggle('is-active', Boolean(isMatch));
    });

    if (broadcastStage !== highlightedStage) {
      broadcastStage = highlightedStage ?? null;
      window.dispatchEvent(
        new CustomEvent('neural-stagechange', {
          detail: {
            stage: broadcastStage,
          },
        })
      );
    }

    updateMix();
  };

  updateTransportUI();
  updateMix(true);

  return {
    highlightStage,
  };
}

soundboardController = initSoundboard();
soundboardController?.highlightStage('01');

const labSection = document.querySelector('.lab');

if (labSection) {
  const styleCanvas = labSection.querySelector('.lab-style__canvas');
  const styleRange = labSection.querySelector('[data-style-range]');
  const styleOutput = labSection.querySelector('[data-style-output]');

  if (styleCanvas instanceof HTMLCanvasElement && styleRange && styleOutput) {
    const ctx = styleCanvas.getContext('2d', { willReadFrequently: false });
    const size = styleCanvas.width;
    const totalPixels = size * size;
    const base = new Float32Array(totalPixels * 3);
    const hallucination = new Float32Array(totalPixels * 3);
    const imageData = ctx?.createImageData(size, size);

    const fract = (value) => value - Math.floor(value);
    const noise = (x, y, seed) => {
      const raw = Math.sin((x * 12.9898 + y * 78.233 + seed) * 43758.5453);
      return fract(Math.abs(raw));
    };

    if (ctx && imageData) {
      for (let y = 0; y < size; y += 1) {
        for (let x = 0; x < size; x += 1) {
          const nx = x / size;
          const ny = y / size;
          const index = (y * size + x) * 3;

          const waveA = Math.sin((nx * 3.2 + ny * 1.4) * Math.PI);
          const waveB = Math.sin((nx * 1.6 + ny * 4.2) * Math.PI * 0.65);
          const grain = noise(nx * 2.1, ny * 1.8, 0.27);

          base[index] = 126 + waveA * 58 + grain * 24;
          base[index + 1] = 108 + waveB * 62 + noise(nx * 1.8, ny * 2.4, 0.73) * 28;
          base[index + 2] = 162 + waveA * 42 + noise(nx * 1.6, ny * 1.6, 0.93) * 32;

          const swirl = noise(nx * 3.8, ny * 3.4, 1.3);
          const ribbon = Math.cos((nx * 6.4 - ny * 5.2) * Math.PI * 0.4);

          hallucination[index] = 180 + swirl * 68 + ribbon * 36;
          hallucination[index + 1] = 92 + noise(nx * 4.2, ny * 3.6, 2.4) * 110 + swirl * 20;
          hallucination[index + 2] = 210 + ribbon * 58 + noise(nx * 5.1, ny * 2.7, 2.8) * 75;
        }
      }

      const renderStyle = (value) => {
        const target = Number(value) / 100;
        const clamped = Number.isFinite(target) ? Math.min(Math.max(target, 0), 1) : 0;
        const { data } = imageData;

        for (let i = 0; i < totalPixels; i += 1) {
          const i3 = i * 3;
          const i4 = i * 4;
          const mix = clamped;

          let r = base[i3] * (1 - mix) + hallucination[i3] * mix;
          let g = base[i3 + 1] * (1 - mix) + hallucination[i3 + 1] * mix;
          let b = base[i3 + 2] * (1 - mix) + hallucination[i3 + 2] * mix;

          const excitation = mix * 0.25 + noise(i % size / size, Math.floor(i / size) / size, mix * 3.4) * 0.12;
          r += excitation * 120;
          g += excitation * 100;
          b += excitation * 140;

          data[i4] = Math.max(0, Math.min(255, r));
          data[i4 + 1] = Math.max(0, Math.min(255, g));
          data[i4 + 2] = Math.max(0, Math.min(255, b));
          data[i4 + 3] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
        styleOutput.textContent = clamped.toFixed(2);
      };

      renderStyle(styleRange.value);

      let rafId = null;
      const handleStyleInput = (event) => {
        const { value } = event.currentTarget;
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          renderStyle(value);
        });
      };

      styleRange.addEventListener('input', handleStyleInput);
      styleRange.addEventListener('change', handleStyleInput);
    }
  }

  const promptInput = labSection.querySelector('[data-lab-prompt]');
  const temperatureInput = labSection.querySelector('[data-lab-temperature]');
  const temperatureOutput = labSection.querySelector('[data-temperature-output]');
  const promptRefresh = labSection.querySelector('[data-prompt-refresh]');
  const promptStatus = labSection.querySelector('[data-prompt-status]');
  const promptRenderer = labSection.querySelector('.lab-imagine__render');
  const promptLabel = labSection.querySelector('.lab-imagine__prompt');

  const inspirationPool = [
    'Aurora-synced cityscape',
    'Bioluminescent coral observatory',
    'Cybernetic rain garden',
    'Hyperspectral desert bloom',
    'Subliminal skyline mirage',
    'Zero-gravity meditation hall',
    'Neon rainforest canopy',
    'Translucent glacier cathedral',
  ];

  const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const applyPrompt = (prompt, temperature) => {
    if (!promptRenderer || !promptLabel || !promptStatus) return;

    const seed = hashString(`${prompt}:${temperature.toFixed(2)}`) % 9000 + 1000;
    const baseHue = (hashString(prompt) % 360 + temperature * 80) % 360;
    const accentHue = (baseHue + 90 + temperature * 140) % 360;
    const tertiaryHue = (baseHue + 210 - temperature * 60 + 360) % 360;

    const saturation = 68 + temperature * 22;
    const lightness = 52 - temperature * 12;

    const gradient = `conic-gradient(from ${baseHue.toFixed(1)}deg,
      hsla(${baseHue.toFixed(1)}, ${saturation}%, ${lightness}%, 0.85),
      hsla(${accentHue.toFixed(1)}, ${Math.min(96, saturation + 12)}%, ${Math.max(36, lightness - 8)}%, 0.82),
      hsla(${tertiaryHue.toFixed(1)}, ${Math.min(90, saturation + 6)}%, ${Math.min(72, lightness + 6)}%, 0.8),
      hsla(${baseHue.toFixed(1)}, ${saturation}%, ${lightness}%, 0.85))`;

    const overlay = `radial-gradient(circle at 28% 24%, hsla(${accentHue.toFixed(1)}, 95%, 72%, 0.35), transparent 68%),
      radial-gradient(circle at 78% 70%, hsla(${tertiaryHue.toFixed(1)}, 88%, 66%, 0.28), transparent 70%)`;

    promptRenderer.style.background = `${overlay}, ${gradient}`;
    promptRenderer.style.filter = `saturate(${1.1 + temperature * 0.6}) contrast(${1 + temperature * 0.45})`;
    promptLabel.textContent = `"${prompt}"`;
    promptStatus.textContent = `Ready • seed ${seed}`;
    temperatureOutput.textContent = temperature.toFixed(2);
  };

  if (promptInput && temperatureInput) {
    const getTemperature = () => Number(temperatureInput.value) / 100;

    applyPrompt(promptInput.value, getTemperature());

    const handlePromptChange = () => {
      applyPrompt(promptInput.value.trim() || 'Untitled dreamscape', getTemperature());
    };

    const handleTemperatureInput = () => {
      applyPrompt(promptInput.value.trim() || 'Untitled dreamscape', getTemperature());
    };

    promptInput.addEventListener('input', handlePromptChange);
    temperatureInput.addEventListener('input', handleTemperatureInput);
    temperatureInput.addEventListener('change', handleTemperatureInput);

    if (promptRefresh) {
      promptRefresh.addEventListener('click', () => {
        const current = promptInput.value.trim().toLowerCase();
        const options = inspirationPool.filter((item) => item.toLowerCase() !== current);
        const next = options[Math.floor(Math.random() * options.length)] ?? inspirationPool[0];
        promptInput.value = next;
        applyPrompt(next, getTemperature());
      });
    }
  }
}

const lensSection = document.querySelector('.lens');

if (lensSection) {
  const videoEl = lensSection.querySelector('.lens__video');
  const canvasEl = lensSection.querySelector('.lens__canvas');
  const stageLabel = lensSection.querySelector('[data-lens-stage]');
  const intensityLabel = lensSection.querySelector('[data-lens-intensity]');
  const statusLabel = lensSection.querySelector('[data-lens-status]');
  const startBtn = lensSection.querySelector('[data-lens-action="start"]');
  const stopBtn = lensSection.querySelector('[data-lens-action="stop"]');

  const ctx = canvasEl instanceof HTMLCanvasElement ? canvasEl.getContext('2d') : null;
  const portalButtons = Array.from(lensSection.querySelectorAll('.lens-portal')).filter(
    (button) => button instanceof HTMLButtonElement
  );
  const portalOverlay = lensSection.querySelector('[data-portal-overlay]');
  const portalStageLabelEl = portalOverlay?.querySelector('[data-portal-stage-label]');
  const portalTitleEl = portalOverlay?.querySelector('[data-portal-title]');
  const portalDescriptionEl = portalOverlay?.querySelector('[data-portal-description]');
  const portalMetaEl = portalOverlay?.querySelector('[data-portal-meta]');
  const portalCanvas = portalOverlay?.querySelector('.lens__portal-overlay-canvas');
  const portalCtx = portalCanvas instanceof HTMLCanvasElement ? portalCanvas.getContext('2d') : null;
  const portalDismissEls = portalOverlay
    ? Array.from(portalOverlay.querySelectorAll('[data-portal-dismiss]')).filter(
        (el) => el instanceof HTMLElement
      )
    : [];

  const stageThemes = {
    default: {
      label: 'Immersion Flow',
      hue: 186,
      accentHue: 264,
      depth: 0.6,
    },
    '01': {
      label: 'Signal Capture',
      hue: 186,
      accentHue: 42,
      depth: 0.62,
    },
    '02': {
      label: 'Latent Mapping',
      hue: 204,
      accentHue: 312,
      depth: 0.68,
    },
    '03': {
      label: 'Synaesthetic Rendering',
      hue: 288,
      accentHue: 24,
      depth: 0.74,
    },
    '04': {
      label: 'Adaptive Reflection',
      hue: 336,
      accentHue: 184,
      depth: 0.66,
    },
  };

  const portalScenes = {
    default: {
      title: 'Immersion Gate',
      description: 'A neutral anchor that echoes the neural field when no stage is in focus.',
      meta: 'Immersion token • 0X0',
      coreHue: 198,
      accentHue: 186,
      sparkHue: 264,
      orbitCount: 14,
      orbitSpread: 0.32,
      waveSpeed: 0.45,
      warp: 0.56,
      sparkCount: 50,
      sparkSpeed: 0.82,
      sparkDrift: 1.05,
      sparkSize: 3.6,
    },
    '01': {
      title: 'Signal Vault',
      description:
        'Step inside the denoised vault where raw oscillations crystalize into magnetic relics.',
      meta: 'Immersion token • 01A',
      coreHue: 186,
      accentHue: 42,
      sparkHue: 212,
      orbitCount: 12,
      orbitSpread: 0.28,
      waveSpeed: 0.36,
      warp: 0.48,
      sparkCount: 46,
      sparkSpeed: 0.74,
      sparkDrift: 0.96,
      sparkSize: 3.8,
    },
    '02': {
      title: 'Latent Cube',
      description:
        'Navigate the translucent atlas where embeddings tessellate into navigable attention planes.',
      meta: 'Immersion token • 02L',
      coreHue: 204,
      accentHue: 312,
      sparkHue: 168,
      orbitCount: 16,
      orbitSpread: 0.36,
      waveSpeed: 0.48,
      warp: 0.62,
      sparkCount: 58,
      sparkSpeed: 0.85,
      sparkDrift: 1.12,
      sparkSize: 3.2,
    },
    '03': {
      title: 'Render Bloom',
      description:
        'Witness synaesthetic particles bloom into luminous waves synchronized with multisensory cues.',
      meta: 'Immersion token • 03S',
      coreHue: 288,
      accentHue: 24,
      sparkHue: 318,
      orbitCount: 18,
      orbitSpread: 0.4,
      waveSpeed: 0.6,
      warp: 0.74,
      sparkCount: 64,
      sparkSpeed: 0.98,
      sparkDrift: 1.24,
      sparkSize: 3.5,
    },
    '04': {
      title: 'Reflection Loop',
      description:
        'Enter the adaptive feedback loop where audience resonance folds into regenerative echoes.',
      meta: 'Immersion token • 04R',
      coreHue: 336,
      accentHue: 184,
      sparkHue: 48,
      orbitCount: 15,
      orbitSpread: 0.34,
      waveSpeed: 0.52,
      warp: 0.68,
      sparkCount: 52,
      sparkSpeed: 0.88,
      sparkDrift: 1.18,
      sparkSize: 3.7,
    },
  };

  const overlayProfiles = {
    default: {
      tintAlpha: 0.04,
      pulseAlpha: 0.12,
      beamAlpha: 0.16,
      pulseRadius: 0.9,
      tiltAmplitude: 0.12,
      beamBase: 0.12,
      beamScale: 0.16,
      beamSpeed: 0.00055,
      beamParallax: 0.16,
    },
    '01': {
      tintAlpha: 0.05,
      pulseAlpha: 0.15,
      beamAlpha: 0.18,
      pulseRadius: 0.95,
      tiltAmplitude: 0.14,
      beamBase: 0.13,
      beamScale: 0.18,
      beamSpeed: 0.0005,
      beamParallax: 0.18,
    },
    '02': {
      tintAlpha: 0.06,
      pulseAlpha: 0.17,
      beamAlpha: 0.18,
      pulseRadius: 0.98,
      tiltAmplitude: 0.16,
      beamBase: 0.14,
      beamScale: 0.2,
      beamSpeed: 0.0006,
      beamParallax: 0.18,
    },
    '03': {
      tintAlpha: 0.07,
      pulseAlpha: 0.2,
      beamAlpha: 0.2,
      pulseRadius: 1.08,
      tiltAmplitude: 0.18,
      beamBase: 0.15,
      beamScale: 0.22,
      beamSpeed: 0.00065,
      beamParallax: 0.2,
    },
    '04': {
      tintAlpha: 0.06,
      pulseAlpha: 0.16,
      beamAlpha: 0.22,
      pulseRadius: 0.96,
      tiltAmplitude: 0.17,
      beamBase: 0.16,
      beamScale: 0.18,
      beamSpeed: 0.00058,
      beamParallax: 0.24,
    },
  };

  const pulses = Array.from({ length: 28 }, (_, index) => ({
    seed: index * 37.1,
    baseX: (index * 73) % 53 / 53,
    baseY: (index * 29) % 47 / 47,
    rate: 0.18 + (index % 7) * 0.035,
    scale: 0.24 + ((index * 13) % 9) * 0.02,
    offset: Math.random() * Math.PI * 2,
  }));

  let animationId = null;
  let running = false;
  let mediaStream = null;
  let currentStage = '01';
  let displayedIntensity = 0.62;
  let targetIntensity = 0.62;
  let portalAnimationId = null;
  let portalSceneStage = null;
  let lastPortalTrigger = null;
  let tiltX = 0;
  let tiltY = 0;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let orientationEnabled = false;
  let orientationPermissionDenied = false;

  const resizeCanvas = () => {
    if (!(canvasEl instanceof HTMLCanvasElement) || !ctx) {
      return;
    }

    const { clientWidth, clientHeight } = canvasEl;
    if (canvasEl.width !== clientWidth || canvasEl.height !== clientHeight) {
      canvasEl.width = clientWidth;
      canvasEl.height = clientHeight;
    }
  };

  const setStatus = (message) => {
    if (statusLabel) {
      statusLabel.textContent = message;
    }
  };

  const updateStageHud = () => {
    const theme = stageThemes[currentStage] ?? stageThemes.default;
    if (stageLabel) {
      stageLabel.textContent = theme.label;
    }
    targetIntensity = theme.depth;
  };

  const clampTilt = (value, min = -1, max = 1) => Math.min(Math.max(value, min), max);
  const clamp01 = (value) => Math.min(Math.max(value, 0), 1);
  const wrapUnit = (value) => ((value % 1) + 1) % 1;

  const formatStageDescriptor = (stage) => {
    const theme = stageThemes[stage] ?? stageThemes.default;
    if (!stageThemes[stage] || stage === 'default') {
      return theme.label;
    }
    return `Stage ${stage.padStart(2, '0')} • ${theme.label}`;
  };

  const updatePortals = () => {
    portalButtons.forEach((button) => {
      const stage = button.dataset.portalStage ?? '';
      const isOpen = portalSceneStage === stage;
      const isFocused = stage === currentStage;
      button.dataset.active = String(isFocused || isOpen);
      button.setAttribute('aria-pressed', String(isOpen));
    });
  };

  const handlePointerTilt = (event) => {
    if (orientationEnabled) {
      return;
    }

    if (
      event.target instanceof HTMLElement &&
      (event.target.closest('.lens-portal') || event.target.closest('[data-portal-overlay]'))
    ) {
      return;
    }

    const rect = lensSection.getBoundingClientRect();
    const x = clampTilt((event.clientX - rect.left) / rect.width * 2 - 1);
    const y = clampTilt((event.clientY - rect.top) / rect.height * 2 - 1);
    targetTiltX = x;
    targetTiltY = y;
  };

  const resetPointerTilt = () => {
    if (orientationEnabled) {
      return;
    }
    targetTiltX = 0;
    targetTiltY = 0;
  };

  const handleDeviceOrientation = (event) => {
    const gamma = Number.isFinite(event.gamma) ? event.gamma : 0;
    const beta = Number.isFinite(event.beta) ? event.beta : 0;
    const nextX = gamma / 45;
    const nextY = beta / 55;
    targetTiltX = clampTilt(nextX);
    targetTiltY = clampTilt(nextY);
  };

  const enableOrientationTracking = async () => {
    if (orientationEnabled || orientationPermissionDenied) {
      return orientationEnabled;
    }

    if ('DeviceOrientationEvent' in window) {
      try {
        const OrientationEventClass = window.DeviceOrientationEvent;
        if (typeof OrientationEventClass?.requestPermission === 'function') {
          const response = await OrientationEventClass.requestPermission();
          if (response !== 'granted') {
            orientationPermissionDenied = true;
            return false;
          }
        }

        window.addEventListener('deviceorientation', handleDeviceOrientation, true);
        orientationEnabled = true;
        return true;
      } catch (error) {
        console.warn('Device orientation permission error', error);
        orientationPermissionDenied = true;
        return false;
      }
    }

    orientationPermissionDenied = true;
    return false;
  };

  const disableOrientationTracking = () => {
    if (!orientationEnabled) {
      return;
    }
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true);
    orientationEnabled = false;
  };

  const resizePortalCanvas = () => {
    if (!(portalCanvas instanceof HTMLCanvasElement) || !portalCtx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const { clientWidth, clientHeight } = portalCanvas;
    const width = Math.max(Math.floor(clientWidth), 1);
    const height = Math.max(Math.floor(clientHeight), 1);
    const needsResize = portalCanvas.width !== width * dpr || portalCanvas.height !== height * dpr;

    if (needsResize) {
      portalCanvas.width = width * dpr;
      portalCanvas.height = height * dpr;
      portalCtx.setTransform(1, 0, 0, 1, 0, 0);
      portalCtx.scale(dpr, dpr);
    }
  };

  const applyPortalContent = (stage) => {
    if (!portalOverlay) {
      return;
    }

    const descriptor = formatStageDescriptor(stage);
    const scene = portalScenes[stage] ?? portalScenes.default;

    if (portalStageLabelEl) {
      portalStageLabelEl.textContent = descriptor;
    }

    if (portalTitleEl) {
      portalTitleEl.textContent = scene.title;
    }

    if (portalDescriptionEl) {
      portalDescriptionEl.textContent = scene.description;
    }

    if (portalMetaEl) {
      portalMetaEl.textContent = scene.meta;
    }
  };

  const renderPortalScene = (time) => {
    if (!(portalCanvas instanceof HTMLCanvasElement) || !portalCtx || !portalSceneStage) {
      return;
    }

    resizePortalCanvas();

    const width = portalCanvas.clientWidth;
    const height = portalCanvas.clientHeight;
    const scene = portalScenes[portalSceneStage] ?? portalScenes.default;
    const stageTheme = stageThemes[portalSceneStage] ?? stageThemes.default;
    const t = time * 0.001;

    portalCtx.clearRect(0, 0, width, height);

    const backdrop = portalCtx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.05,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.62
    );
    backdrop.addColorStop(0, `hsla(${scene.coreHue}, 98%, 72%, 0.38)`);
    backdrop.addColorStop(0.45, `hsla(${stageTheme.hue}, 92%, 60%, 0.24)`);
    backdrop.addColorStop(1, 'rgba(5, 11, 22, 0.94)');

    portalCtx.fillStyle = 'rgba(5, 11, 22, 0.92)';
    portalCtx.fillRect(0, 0, width, height);
    portalCtx.fillStyle = backdrop;
    portalCtx.fillRect(0, 0, width, height);

    const orbitCount = scene.orbitCount ?? 12;
    const orbitSpread = scene.orbitSpread ?? 0.32;
    const waveSpeed = scene.waveSpeed ?? 0.46;
    const warp = scene.warp ?? 0.6;

    for (let i = 0; i < orbitCount; i += 1) {
      const pct = i / orbitCount;
      const angle = t * waveSpeed + pct * Math.PI * 2;
      const baseRadius = Math.min(width, height) * (0.18 + orbitSpread * pct);
      const wobble = Math.sin(t * (warp + pct * 0.4) + i) * 0.08;
      const radiusX = baseRadius * (1 + wobble * 0.4);
      const radiusY = baseRadius * (0.65 + wobble);

      portalCtx.save();
      portalCtx.translate(width / 2, height / 2);
      portalCtx.rotate(angle * 0.6);
      portalCtx.beginPath();
      portalCtx.strokeStyle = `hsla(${scene.accentHue + pct * 24}, 95%, ${60 + pct * 20}%, ${0.22 + pct * 0.25})`;
      portalCtx.lineWidth = 1.2 + pct * 2.4;
      portalCtx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
      portalCtx.stroke();
      portalCtx.restore();
    }

    const sparkCount = scene.sparkCount ?? 52;
    const sparkSpeed = scene.sparkSpeed ?? 0.86;
    const sparkDrift = scene.sparkDrift ?? 1.12;
    const sparkSize = scene.sparkSize ?? 3.5;

    for (let i = 0; i < sparkCount; i += 1) {
      const phase = i / sparkCount;
      const angle = phase * Math.PI * 2 + t * sparkSpeed;
      const radial = (Math.sin(t * sparkDrift + i) * 0.5 + 0.5) * Math.min(width, height) * 0.42;
      const x = width / 2 + Math.cos(angle) * radial;
      const y = height / 2 + Math.sin(angle) * radial * (0.66 + Math.sin(angle + t) * 0.12);
      const size = (0.7 + Math.sin(angle * 2.4 + t * 0.8) * 0.45) * sparkSize;

      const sparkGradient = portalCtx.createRadialGradient(x, y, 0, x, y, size * 5.4);
      sparkGradient.addColorStop(0, `hsla(${scene.sparkHue}, 100%, 78%, 0.55)`);
      sparkGradient.addColorStop(0.6, `hsla(${scene.sparkHue + 40}, 96%, 68%, 0.22)`);
      sparkGradient.addColorStop(1, 'rgba(5, 11, 22, 0)');

      portalCtx.beginPath();
      portalCtx.fillStyle = sparkGradient;
      portalCtx.arc(x, y, size * 5.4, 0, Math.PI * 2);
      portalCtx.fill();
    }

    const aperture = portalCtx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.min(width, height) * 0.26
    );
    aperture.addColorStop(0, `hsla(${scene.accentHue}, 100%, 76%, 0.58)`);
    aperture.addColorStop(0.86, `hsla(${scene.coreHue}, 96%, 62%, 0.26)`);
    aperture.addColorStop(1, 'rgba(5, 11, 22, 0)');

    portalCtx.fillStyle = aperture;
    portalCtx.beginPath();
    portalCtx.arc(
      width / 2,
      height / 2,
      Math.min(width, height) * (0.24 + Math.sin(t * 0.7) * 0.02),
      0,
      Math.PI * 2
    );
    portalCtx.fill();

    portalAnimationId = requestAnimationFrame(renderPortalScene);
  };

  const stopPortalScene = () => {
    if (portalAnimationId) {
      cancelAnimationFrame(portalAnimationId);
      portalAnimationId = null;
    }

    if (portalCanvas instanceof HTMLCanvasElement && portalCtx) {
      portalCtx.clearRect(0, 0, portalCanvas.clientWidth, portalCanvas.clientHeight);
    }

    portalSceneStage = null;

    if (portalButtons.length) {
      portalButtons.forEach((button) => button.setAttribute('aria-pressed', 'false'));
    }
  };

  const openPortal = (stage, { force = false } = {}) => {
    if (!portalOverlay) {
      return;
    }

    const key = portalScenes[stage] ? stage : 'default';
    const alreadyOpen = portalOverlay && !portalOverlay.hasAttribute('hidden');

    if (alreadyOpen && !force && portalSceneStage === key) {
      return;
    }

    stopPortalScene();
    portalSceneStage = key;
    applyPortalContent(key);
    updatePortals();

    if (portalButtons.length) {
      portalButtons.forEach((button) => {
        const isMatch = button.dataset.portalStage === key;
        button.setAttribute('aria-pressed', String(isMatch));
      });

      if (force) {
        const replacement = portalButtons.find((button) => button.dataset.portalStage === key);
        if (replacement) {
          lastPortalTrigger = replacement;
        }
      }
    }

    if (portalOverlay) {
      portalOverlay.hidden = false;
      portalOverlay.removeAttribute('hidden');
    }

    resizePortalCanvas();
    portalAnimationId = requestAnimationFrame(renderPortalScene);

    const focusTarget = portalOverlay?.querySelector('.lens__portal-overlay-close');
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus({ preventScroll: true });
    }
  };

  const closePortal = () => {
    if (!portalOverlay) {
      return;
    }

    portalOverlay.hidden = true;
    portalOverlay.setAttribute('hidden', '');
    stopPortalScene();
    updatePortals();

    if (lastPortalTrigger instanceof HTMLElement) {
      lastPortalTrigger.focus({ preventScroll: true });
    }
  };

  const setRunningState = (nextRunning) => {
    running = nextRunning;
    if (startBtn instanceof HTMLButtonElement) {
      startBtn.disabled = running;
    }
    if (stopBtn instanceof HTMLButtonElement) {
      stopBtn.disabled = !running;
    }
  };

  const animateOverlay = (time) => {
    if (!ctx || !(canvasEl instanceof HTMLCanvasElement)) {
      return;
    }

    resizeCanvas();

    const { width, height } = canvasEl;
    ctx.clearRect(0, 0, width, height);

    const theme = stageThemes[currentStage] ?? stageThemes.default;
    const overlayProfile = overlayProfiles[currentStage] ?? overlayProfiles.default;
    const hue = theme.hue;
    const accentHue = theme.accentHue;

    displayedIntensity += (targetIntensity - displayedIntensity) * 0.045;
    const intensity = clamp01(displayedIntensity);

    tiltX += (targetTiltX - tiltX) * 0.08;
    tiltY += (targetTiltY - tiltY) * 0.08;

    if (intensityLabel) {
      intensityLabel.textContent = `Intensity ${intensity.toFixed(2)}`;
    }

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = overlayProfile.tintAlpha;
    const tintGradient = ctx.createLinearGradient(0, 0, width, height);
    tintGradient.addColorStop(0, `hsla(${hue}, 96%, 68%, 1)`);
    tintGradient.addColorStop(1, `hsla(${accentHue}, 92%, 66%, 1)`);
    ctx.fillStyle = tintGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const offsetX = tiltX * overlayProfile.tiltAmplitude;
    const offsetY = tiltY * overlayProfile.tiltAmplitude;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = overlayProfile.pulseAlpha;

    pulses.forEach((pulse) => {
      const pulseTime = time * 0.0008 + pulse.offset;
      const jitter = Math.sin(pulseTime * pulse.rate * 2) * 0.1;
      const xBase = pulse.baseX + Math.sin(pulseTime * pulse.rate) * 0.18 + offsetX;
      const yBase = pulse.baseY + Math.cos(pulseTime * pulse.rate * 1.4) * 0.15 + offsetY;
      const radius = (Math.sin(pulseTime * 1.6) * 0.18 + 0.26) * pulse.scale * (0.8 + intensity * 0.6);
      const px = wrapUnit(xBase) * width;
      const py = wrapUnit(yBase) * height;
      const pr = radius * Math.max(width, height) * overlayProfile.pulseRadius;

      const gradient = ctx.createRadialGradient(px, py, pr * 0.08, px, py, pr);
      gradient.addColorStop(0, `hsla(${hue}, 95%, ${66 + jitter * 12}%, ${0.22 + intensity * 0.18})`);
      gradient.addColorStop(0.58, `hsla(${accentHue}, 92%, ${68 + jitter * 6}%, ${0.14 + intensity * 0.12})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = overlayProfile.beamAlpha;

    const beamHeight = height * (overlayProfile.beamBase + intensity * overlayProfile.beamScale);
    const beamCenterNorm = clamp01(
      Math.sin(time * overlayProfile.beamSpeed) * 0.5 + 0.5 + tiltY * overlayProfile.beamParallax
    );
    const beamOffsetNorm = clamp01(beamCenterNorm - (beamHeight / height) * 0.5);
    const beamY = beamOffsetNorm * (height - beamHeight);

    const beamGradient = ctx.createLinearGradient(0, beamY, 0, beamY + beamHeight);
    beamGradient.addColorStop(0, `hsla(${accentHue}, 100%, 74%, 0)`);
    beamGradient.addColorStop(0.3, `hsla(${hue}, 100%, 76%, ${0.18 + intensity * 0.18})`);
    beamGradient.addColorStop(0.75, `hsla(${accentHue}, 90%, 70%, ${0.14 + intensity * 0.14})`);
    beamGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = beamGradient;
    ctx.fillRect(0, beamY, width, beamHeight);
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = overlayProfile.tintAlpha * 0.8;
    const haloRadius = Math.min(width, height) * (0.22 + intensity * 0.06);
    const haloX = width / 2 + tiltX * width * 0.08;
    const haloY = height / 2 + tiltY * height * 0.08;
    const haloGradient = ctx.createRadialGradient(haloX, haloY, haloRadius * 0.35, haloX, haloY, haloRadius);
    haloGradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.4)`);
    haloGradient.addColorStop(0.65, `hsla(${accentHue}, 98%, 72%, 0.22)`);
    haloGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGradient;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    if (running) {
      animationId = requestAnimationFrame(animateOverlay);
    }
  };

  const stopLens = ({ message } = { message: 'Lens paused • camera off' }) => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      mediaStream = null;
    }

    if (videoEl instanceof HTMLVideoElement) {
      videoEl.pause();
      videoEl.srcObject = null;
      videoEl.removeAttribute('data-active');
    }

    if (canvasEl instanceof HTMLCanvasElement && ctx) {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    }
    disableOrientationTracking();
    targetTiltX = 0;
    targetTiltY = 0;
    tiltX = 0;
    tiltY = 0;
    if (portalOverlay && !portalOverlay.hasAttribute('hidden')) {
      closePortal();
    }
    setRunningState(false);

    if (message) {
      setStatus(message);
    }
  };

  const startLens = async () => {
    if (!(videoEl instanceof HTMLVideoElement) || !ctx || running) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('Camera access unsupported on this device');
      return;
    }

    try {
      setStatus('Requesting camera access…');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      mediaStream = stream;
      videoEl.srcObject = stream;
      await videoEl.play();
      videoEl.setAttribute('data-active', 'true');
      setRunningState(true);
      const orientationEnabledNow = await enableOrientationTracking();
      const liveStatus = orientationEnabledNow
        ? 'Neural lens live • tilt to sculpt the field'
        : 'Neural lens live • drag to sculpt the field';
      setStatus(liveStatus);
      if (orientationEnabledNow) {
        resetPointerTilt();
      }
      animationId = requestAnimationFrame(animateOverlay);
    } catch (error) {
      console.error('Neural lens camera error', error);
      stopLens({ message: 'Unable to access camera • check permissions' });
    }
  };

  if (startBtn instanceof HTMLButtonElement) {
    startBtn.addEventListener('click', () => {
      startLens();
    });
  }

  if (stopBtn instanceof HTMLButtonElement) {
    stopBtn.addEventListener('click', () => {
      stopLens();
    });
    stopBtn.disabled = true;
  }

  lensSection.addEventListener('pointermove', handlePointerTilt);
  lensSection.addEventListener('pointerleave', resetPointerTilt);
  lensSection.addEventListener('pointercancel', resetPointerTilt);
  lensSection.addEventListener('touchend', resetPointerTilt);

  portalButtons.forEach((button) => {
    button.addEventListener('click', () => {
      lastPortalTrigger = button;
      const stage = button.dataset.portalStage ?? currentStage;
      openPortal(stage);
    });
  });

  portalDismissEls.forEach((element) => {
    element.addEventListener('click', () => {
      closePortal();
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && portalOverlay && !portalOverlay.hasAttribute('hidden')) {
      event.preventDefault();
      closePortal();
    }
  });

  setRunningState(false);
  resizeCanvas();
  updateStageHud();
  updatePortals();

  window.addEventListener('neural-stagechange', (event) => {
    const nextStage = event.detail?.stage ?? null;
    if (nextStage && stageThemes[nextStage]) {
      currentStage = nextStage;
    } else {
      currentStage = 'default';
    }
    updateStageHud();
    updatePortals();

    if (portalOverlay && !portalOverlay.hasAttribute('hidden')) {
      openPortal(currentStage, { force: true });
    }
  });

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
      resizePortalCanvas();
    });

    resizeObserver.observe(lensSection);
  } else {
    window.addEventListener('resize', () => {
      resizeCanvas();
      resizePortalCanvas();
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running) {
      stopLens({ message: 'Lens paused • resume to reactivate camera' });
    }
  });

  window.addEventListener('pagehide', () => {
    if (running) {
      stopLens({ message: null });
    }
    if (portalOverlay && !portalOverlay.hasAttribute('hidden')) {
      closePortal();
    }
  });

  setStatus('Ready to activate • camera off • portals sync per stage');
}
