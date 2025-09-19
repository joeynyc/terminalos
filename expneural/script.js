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
    const hue = theme.hue;
    const accentHue = theme.accentHue;

    displayedIntensity += (targetIntensity - displayedIntensity) * 0.04;
    const intensity = Math.max(0.35, Math.min(0.92, displayedIntensity));

    if (intensityLabel) {
      intensityLabel.textContent = `Intensity ${intensity.toFixed(2)}`;
    }

    ctx.globalCompositeOperation = 'lighter';

    pulses.forEach((pulse) => {
      const t = time * 0.0008 + pulse.offset;
      const jitter = Math.sin(t * pulse.rate * 2) * 0.12;
      const x = (pulse.baseX + Math.sin(t * pulse.rate) * 0.18 + 1) % 1;
      const y = (pulse.baseY + Math.cos(t * pulse.rate * 1.4) * 0.15 + 1) % 1;
      const radius = (Math.sin(t * 1.6) * 0.18 + 0.26) * pulse.scale * (0.8 + intensity * 0.6);
      const px = x * width;
      const py = y * height;
      const pr = radius * Math.max(width, height);

      const gradient = ctx.createRadialGradient(px, py, pr * 0.1, px, py, pr);
      gradient.addColorStop(0, `hsla(${hue}, 95%, ${65 + jitter * 10}%, ${0.28 + intensity * 0.24})`);
      gradient.addColorStop(0.65, `hsla(${accentHue}, 92%, ${68 + jitter * 6}%, ${0.18 + intensity * 0.18})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalCompositeOperation = 'source-over';

    const beamHeight = height * (0.12 + intensity * 0.15);
    const beamOffset = (Math.sin(time * 0.0006) * 0.5 + 0.5) * (height - beamHeight);

    const beamGradient = ctx.createLinearGradient(0, beamOffset, 0, beamOffset + beamHeight);
    beamGradient.addColorStop(0, `hsla(${accentHue}, 100%, 72%, 0)`);
    beamGradient.addColorStop(0.32, `hsla(${hue}, 100%, 78%, ${0.2 + intensity * 0.18})`);
    beamGradient.addColorStop(0.7, `hsla(${accentHue}, 90%, 70%, ${0.16 + intensity * 0.12})`);
    beamGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = beamGradient;
    ctx.fillRect(0, beamOffset, width, beamHeight);

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
      setStatus('Neural lens live • move your device to sculpt the field');
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

  setRunningState(false);
  resizeCanvas();
  updateStageHud();

  window.addEventListener('neural-stagechange', (event) => {
    const nextStage = event.detail?.stage ?? null;
    if (nextStage && stageThemes[nextStage]) {
      currentStage = nextStage;
    } else {
      currentStage = 'default';
    }
    updateStageHud();
  });

  if (typeof ResizeObserver === 'function') {
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });

    resizeObserver.observe(lensSection);
  } else {
    window.addEventListener('resize', resizeCanvas);
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
  });

  setStatus('Ready to activate • camera off');
}
