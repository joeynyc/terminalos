const personas = {
  maya: {
    title: 'Starter Creator Momentum',
    highlights: [
      'Guided sequencer templates tuned for lo-fi, drill, and hyperpop starters.',
      'Community critique circles like <strong>Brooklyn Night Owls</strong> to surface feedback fast.',
      'Auto-generated promo packs with TikTok-ready clips and captions.',
      'Starter CRM playbook to capture first 100 superfans.'
    ]
  },
  luis: {
    title: 'Growth Artist Command Center',
    highlights: [
      'Import past catalog, sync merch SKUs, and relaunch bundles in minutes.',
      'Fan CRM segments superfans vs. casual listeners with actionable insights.',
      'AI tour routing suggestions based on conversion data and open dates.',
      'Automation studio preloads email drips and social cadences.'
    ]
  },
  dana: {
    title: 'Studio Producer, Elevated',
    highlights: [
      'White-label portals keep clients informed with mix versions and approvals.',
      'Mix assistant surfaces genre-specific polish presets and revision notes.',
      'Revenue dashboards track campaigns, sync deals, and retainer renewals.',
      'Team presence, task assignments, and analytics in one glassy HQ.'
    ]
  }
};

const personaTabs = document.querySelectorAll('.persona-tab');
const personaPanels = document.querySelectorAll('.persona-panel');

personaTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const persona = tab.dataset.persona;

    personaTabs.forEach((t) => {
      const isActive = t === tab;
      t.classList.toggle('active', isActive);
      t.setAttribute('aria-selected', String(isActive));
    });

    personaPanels.forEach((panel) => {
      const isMatch = panel.id === `persona-${persona}`;
      panel.classList.toggle('active', isMatch);
      panel.toggleAttribute('hidden', !isMatch);
    });
  });
});

// Sequencer setup
const instruments = [
  {
    id: 'kick',
    label: 'Kick',
    type: 'kick'
  },
  {
    id: 'snare',
    label: 'Snare',
    type: 'snare'
  },
  {
    id: 'hat',
    label: 'Hat',
    type: 'hat'
  }
];

const stepsPerBar = 8;
const sequencerGrid = document.querySelector('.sequencer-grid');
const bpmInput = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const togglePlayButton = document.getElementById('toggle-play');
const clearGridButton = document.getElementById('clear-grid');

let audioCtx;
let masterGain;
let eqFilter;
let stereoPanner;
let reverb;
let wetGain;
let dryGain;
let noiseBuffer;
let analyser;
let analyserData;
let visualizerAnimationFrame;
let visualizerThemeIndex = 0;
let isPlaying = false;
let currentStep = 0;

const pattern = instruments.map(() => new Array(stepsPerBar).fill(false));
const stepButtons = [];

function ensureAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();

    masterGain = audioCtx.createGain();
    eqFilter = audioCtx.createBiquadFilter();
    eqFilter.type = 'peaking';
    eqFilter.frequency.value = 1600;
    eqFilter.gain.value = 0;
    eqFilter.Q.value = 0.9;

    stereoPanner = audioCtx.createStereoPanner();
    stereoPanner.pan.value = 0;

    reverb = audioCtx.createConvolver();
    reverb.buffer = generateImpulseResponse(audioCtx, 1.8, 2.2);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.9;
    wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.25;

    eqFilter.connect(stereoPanner);
    stereoPanner.connect(dryGain);
    dryGain.connect(masterGain);

    stereoPanner.connect(reverb);
    reverb.connect(wetGain);
    wetGain.connect(masterGain);

    masterGain.gain.value = 0.85;
    masterGain.connect(audioCtx.destination);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;
    analyserData = new Uint8Array(analyser.frequencyBinCount);
    masterGain.connect(analyser);
    startVisualizer();
  }
}

function generateImpulseResponse(context, duration, decay) {
  const sampleRate = context.sampleRate;
  const length = sampleRate * duration;
  const impulse = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel += 1) {
    const channelData = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }

  return impulse;
}

function getNoiseBuffer() {
  if (noiseBuffer) return noiseBuffer;
  const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.5, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

function triggerKick(time) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(120, time);
  osc.frequency.exponentialRampToValueAtTime(45, time + 0.2);
  gain.gain.setValueAtTime(1, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
  osc.connect(gain);
  gain.connect(eqFilter);
  osc.start(time);
  osc.stop(time + 0.32);
}

function triggerSnare(time) {
  const noise = audioCtx.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(1800, time);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.7, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(eqFilter);
  noise.start(time);
  noise.stop(time + 0.3);
}

function triggerHat(time) {
  const noise = audioCtx.createBufferSource();
  noise.buffer = getNoiseBuffer();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(8000, time);
  filter.Q.value = 0.8;

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.35, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(eqFilter);
  noise.start(time);
  noise.stop(time + 0.12);
}

function scheduleStep() {
  if (!audioCtx || !isPlaying) return;
  const now = audioCtx.currentTime;
  const stepDuration = calculateStepDuration();
  const scheduledTime = now + 0.01;

  instruments.forEach((instrument, rowIndex) => {
    if (pattern[rowIndex][currentStep]) {
      switch (instrument.type) {
        case 'kick':
          triggerKick(scheduledTime);
          break;
        case 'snare':
          triggerSnare(scheduledTime);
          break;
        case 'hat':
          triggerHat(scheduledTime);
          break;
        default:
          break;
      }
    }
  });

  highlightStep(currentStep);
  currentStep = (currentStep + 1) % stepsPerBar;

  clearTimeout(stepTimer);
  stepTimer = setTimeout(scheduleStep, stepDuration);
}

let stepTimer;

function highlightStep(step) {
  const stepButtonsForIndex = stepButtons.filter((button) => Number(button.dataset.step) === step);
  stepButtons.forEach((button) => button.classList.remove('playing'));
  stepButtonsForIndex.forEach((button) => button.classList.add('playing'));
}

function calculateStepDuration() {
  const bpm = Number(bpmInput.value || 110);
  return (60000 / bpm) / 2;
}

function startSequencer() {
  ensureAudio();
  audioCtx.resume();
  isPlaying = true;
  togglePlayButton.textContent = 'Pause Loop';
  currentStep = 0;
  scheduleStep();
}

function stopSequencer() {
  isPlaying = false;
  togglePlayButton.textContent = 'Play Loop';
  clearTimeout(stepTimer);
  stepButtons.forEach((button) => button.classList.remove('playing'));
}

function rebuildSequencerGrid() {
  sequencerGrid.innerHTML = '';
  stepButtons.length = 0;
  instruments.forEach((instrument, rowIndex) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'sequencer-row-wrapper';

    const label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = instrument.label;
    wrapper.appendChild(label);

    const row = document.createElement('div');
    row.className = 'sequencer-row';
    row.setAttribute('role', 'group');
    row.setAttribute('aria-label', `${instrument.label} steps`);

    for (let stepIndex = 0; stepIndex < stepsPerBar; stepIndex += 1) {
      const cell = document.createElement('div');
      cell.className = 'step-cell';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'step-toggle';
      button.dataset.row = String(rowIndex);
      button.dataset.step = String(stepIndex);
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', `${instrument.label} step ${stepIndex + 1}`);
      button.addEventListener('click', () => toggleStep(rowIndex, stepIndex, button));
      cell.appendChild(button);
      row.appendChild(cell);
      stepButtons.push(button);
    }

    wrapper.appendChild(row);
    sequencerGrid.appendChild(wrapper);
  });
}

function toggleStep(row, step, button) {
  pattern[row][step] = !pattern[row][step];
  button.classList.toggle('active', pattern[row][step]);
  button.setAttribute('aria-pressed', String(pattern[row][step]));
}

function clearPattern() {
  pattern.forEach((row, rowIndex) => {
    row.forEach((_, stepIndex) => {
      pattern[rowIndex][stepIndex] = false;
    });
  });
  stepButtons.forEach((button) => {
    button.classList.remove('active');
    button.setAttribute('aria-pressed', 'false');
  });
}

bpmInput.addEventListener('input', () => {
  const bpm = Number(bpmInput.value);
  bpmValue.textContent = bpm;
  if (isPlaying) {
    stopSequencer();
    startSequencer();
  }
});

togglePlayButton.addEventListener('click', () => {
  if (isPlaying) {
    stopSequencer();
  } else {
    startSequencer();
  }
});

clearGridButton.addEventListener('click', () => {
  clearPattern();
  stopSequencer();
});

rebuildSequencerGrid();

// Mix assistant logic
const eqRange = document.getElementById('eq-range');
const eqLabel = document.getElementById('eq-value');
const reverbRange = document.getElementById('reverb-range');
const reverbLabel = document.getElementById('reverb-value');
const widthRange = document.getElementById('width-range');
const widthLabel = document.getElementById('width-value');
const mixNotes = document.getElementById('mix-notes');
const presetButtons = document.querySelectorAll('.mix-preset');
const visualizerCanvas = document.getElementById('visualizer');
const visualizerCtx = visualizerCanvas ? visualizerCanvas.getContext('2d') : null;
const visualizerThemeButton = document.getElementById('visualizer-theme');
const hookVibeButtons = document.querySelectorAll('.hook-vibe');
const hookLinesList = document.getElementById('hook-lines');
const generateHookButton = document.getElementById('generate-hook');
const copyHooksButton = document.getElementById('copy-hooks');
const hookFileInput = document.getElementById('hook-file');
const hookUploadText = document.querySelector('.upload-text');

const visualizerThemes = [
  {
    bg: ['rgba(109, 123, 255, 0.35)', 'rgba(255, 79, 139, 0.2)'],
    beam: 'rgba(255, 255, 255, 0.55)',
    pulses: ['#6d7bff', '#ff4f8b']
  },
  {
    bg: ['rgba(52, 232, 158, 0.4)', 'rgba(19, 84, 122, 0.2)'],
    beam: 'rgba(236, 255, 248, 0.6)',
    pulses: ['#34e89e', '#0f3443']
  },
  {
    bg: ['rgba(255, 206, 86, 0.35)', 'rgba(255, 99, 132, 0.25)'],
    beam: 'rgba(255, 248, 231, 0.65)',
    pulses: ['#ffce56', '#ff6384']
  }
];

const presetSettings = {
  warm: {
    eq: 4,
    reverb: 28,
    width: 48,
    notes: 'Dialing in Warm Glow—gentle high lift, cozy mids, and boutique plate verb.'
  },
  club: {
    eq: 6,
    reverb: 18,
    width: 72,
    notes: 'Club Punch activated—tight low shelf, transient snap, and focused width for PA systems.'
  },
  cinematic: {
    eq: -2,
    reverb: 64,
    width: 88,
    notes: 'Cinematic Air—lush tail, softened highs, and expanded stereo arc for trailers.'
  }
};

const hookBlueprints = {
  lofi: {
    intro: ['City lights hum with me', 'Rain taps in sync', 'Late train lullaby'],
    mid: ['looping on the rooftop', 'echoing under neon', 'floating through the static'],
    end: ['till sunrise finds us', 'while the borough breathes slow', 'over vinyl crackle love']
  },
  drill: {
    intro: ['Skrrt down Flatbush', 'Brooklyn bass knocking', 'Queensbridge night run'],
    mid: ['heartbeat on the hi-hat', 'shorty do the pop smoke', 'stacks in the backpack'],
    end: ['we don’t ever lay low', '’til the whole block shine', 'make the city say whoa']
  },
  hyperpop: {
    intro: ['Pixel heart glitching', 'Neon angel texting', 'Bubblegum supernova'],
    mid: ['autotune confession', 'sugar rush ignition', 'laser beam devotion'],
    end: ['til the speakers explode', '90s cam lens flare', 'spinning into warp mode']
  },
  club: {
    intro: ['Lights drop, bass bloom', 'Midnight siren call', 'VIP skyline view'],
    mid: ['body sync in motion', 'sweat and velvet rhythm', 'floor full of believers'],
    end: ['DJ run it back now', 'till the curfew fades out', 'make the ceiling rain down']
  }
};

function updateEq(value) {
  ensureAudio();
  eqFilter.gain.value = Number(value);
  eqLabel.textContent = value > 0 ? `+${value}dB` : value < 0 ? `${value}dB` : 'Neutral';
}

function updateReverb(value) {
  ensureAudio();
  const wetValue = Number(value) / 100;
  dryGain.gain.value = 1 - wetValue * 0.6;
  wetGain.gain.value = 0.15 + wetValue * 0.8;
  const descriptors = ['Dry Loft', 'Loft', 'Echo Hall', 'Cathedral'];
  const index = Math.min(descriptors.length - 1, Math.floor((value / 100) * descriptors.length));
  reverbLabel.textContent = descriptors[index];
}

function updateWidth(value) {
  ensureAudio();
  const normalized = (Number(value) - 50) / 50;
  stereoPanner.pan.value = Math.max(-0.7, Math.min(0.7, normalized));
  if (value < 35) widthLabel.textContent = 'Intimate';
  else if (value < 65) widthLabel.textContent = 'Wide';
  else widthLabel.textContent = 'Arena';
}

function applyPreset(name) {
  const preset = presetSettings[name];
  if (!preset) return;

  presetButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.preset === name));

  eqRange.value = preset.eq;
  reverbRange.value = preset.reverb;
  widthRange.value = preset.width;

  updateEq(preset.eq);
  updateReverb(preset.reverb);
  updateWidth(preset.width);
  mixNotes.textContent = preset.notes;
}

eqRange.addEventListener('input', (event) => {
  updateEq(event.target.value);
  mixNotes.textContent = 'Custom EQ tilt applied—save as a preset to reuse across sessions.';
});

reverbRange.addEventListener('input', (event) => {
  updateReverb(event.target.value);
  mixNotes.textContent = 'Space adjusted—wet/dry balance set for the current project.';
});

widthRange.addEventListener('input', (event) => {
  updateWidth(event.target.value);
  mixNotes.textContent = 'Stereo image retuned—monitor in headphones for detail.';
});

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    applyPreset(button.dataset.preset);
  });
});

applyPreset('warm');

function startVisualizer() {
  if (!visualizerCanvas || !visualizerCtx || !analyser) return;
  cancelAnimationFrame(visualizerAnimationFrame);
  renderVisualizer();
}

function renderVisualizer() {
  if (!visualizerCanvas || !visualizerCtx || !analyser) return;

  analyser.getByteFrequencyData(analyserData);
  const { width, height } = visualizerCanvas;
  visualizerCtx.clearRect(0, 0, width, height);

  const theme = visualizerThemes[visualizerThemeIndex % visualizerThemes.length];
  const gradient = visualizerCtx.createRadialGradient(width * 0.25, height * 0.2, 80, width * 0.5, height * 0.8, width * 0.8);
  gradient.addColorStop(0, theme.bg[0]);
  gradient.addColorStop(1, theme.bg[1]);
  visualizerCtx.fillStyle = gradient;
  visualizerCtx.fillRect(0, 0, width, height);

  const beamHeight = height * 0.18 + analyserData[4] * 0.6;
  visualizerCtx.fillStyle = theme.beam;
  visualizerCtx.fillRect(width / 2 - 3, height - beamHeight, 6, beamHeight);

  const barCount = 48;
  const slice = Math.floor(analyserData.length / barCount);
  const barWidth = width / (barCount * 1.8);

  for (let i = 0; i < barCount; i += 1) {
    const magnitude = analyserData[i * slice] / 255;
    const barHeight = height * 0.2 + magnitude * height * 0.6;
    const x = (i * 1.8) * barWidth + width * 0.05;
    const colorIndex = i % theme.pulses.length;
    const barGradient = visualizerCtx.createLinearGradient(x, height, x, height - barHeight);
    barGradient.addColorStop(0, 'rgba(9, 9, 24, 0.0)');
    barGradient.addColorStop(0.2, `${theme.pulses[colorIndex]}33`);
    barGradient.addColorStop(1, theme.pulses[colorIndex]);
    visualizerCtx.fillStyle = barGradient;
    visualizerCtx.fillRect(x, height - barHeight, barWidth, barHeight);
  }

  visualizerAnimationFrame = requestAnimationFrame(renderVisualizer);
}

if (visualizerThemeButton) {
  visualizerThemeButton.addEventListener('click', () => {
    visualizerThemeIndex = (visualizerThemeIndex + 1) % visualizerThemes.length;
    if (visualizerCanvas && visualizerCtx) {
      renderVisualizer();
    }
  });
}

let activeHookVibe = 'lofi';

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function buildHookLines() {
  const blueprint = hookBlueprints[activeHookVibe] || hookBlueprints.lofi;
  const lines = [];
  for (let i = 0; i < 3; i += 1) {
    const intro = randomFrom(blueprint.intro);
    const mid = randomFrom(blueprint.mid);
    const end = randomFrom(blueprint.end);
    lines.push(`${intro}, ${mid}, ${end}.`);
  }
  return lines;
}

function renderHookLines(lines) {
  if (!hookLinesList) return;
  hookLinesList.innerHTML = '';
  lines.forEach((line, index) => {
    const item = document.createElement('li');
    item.className = 'hook-line';
    item.textContent = `${index + 1}. ${line}`;
    hookLinesList.appendChild(item);
  });
}

function generateHookLines() {
  const lines = buildHookLines();
  renderHookLines(lines);
}

if (hookVibeButtons.length) {
  hookVibeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      hookVibeButtons.forEach((other) => other.classList.toggle('active', other === button));
      activeHookVibe = button.dataset.vibe || 'lofi';
      generateHookLines();
    });
  });
}

if (generateHookButton) {
  generateHookButton.addEventListener('click', () => {
    generateHookLines();
    generateHookButton.textContent = 'Hooks Refreshed!';
    setTimeout(() => {
      generateHookButton.textContent = 'Generate Fresh Hooks';
    }, 1400);
  });
}

if (copyHooksButton) {
  copyHooksButton.addEventListener('click', async () => {
    if (!hookLinesList) return;
    const text = Array.from(hookLinesList.querySelectorAll('.hook-line'))
      .map((item) => item.textContent)
      .join('\n');
    try {
      await navigator.clipboard.writeText(text);
      copyHooksButton.textContent = 'Copied!';
      setTimeout(() => {
        copyHooksButton.textContent = 'Copy All';
      }, 1200);
    } catch (error) {
      console.error('Clipboard unavailable', error);
      copyHooksButton.textContent = 'Copy Failed';
      setTimeout(() => {
        copyHooksButton.textContent = 'Copy All';
      }, 1500);
    }
  });
}

if (hookFileInput && hookUploadText) {
  hookFileInput.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      hookUploadText.textContent = `Loaded: ${file.name}`;
      generateHookLines();
    } else {
      hookUploadText.textContent = 'Drop a rough vocal or hum (30s max)';
    }
  });
}

generateHookLines();

// Automation builder micro-interactions
const automationSteps = document.querySelectorAll('.automation-step');
automationSteps.forEach((step) => {
  step.addEventListener('click', () => {
    step.classList.add('pulse');
    setTimeout(() => step.classList.remove('pulse'), 300);
  });
});

// Community feed rotation
const activityEntries = document.getElementById('activity-entries');
const mockEvents = [
  'Maya scheduled <em>Night Shift III</em> for Friday drop.',
  'Luis added 128 new fans from the Camden pop-up.',
  'Dana booked a sync meeting with Neon Atlantic Studios.',
  'IndieLab collective launched a cross-city collab challenge.',
  'Sound Sorority mentorship applications opened to Starter tier.',
  'Luis automated merch restock emails for VIPs.',
  'Maya’s loop pack hit 2K downloads overnight.',
  'Dana introduced a new motion reel for studio clients.'
];

function pushActivity() {
  const item = document.createElement('li');
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const event = mockEvents[Math.floor(Math.random() * mockEvents.length)];
  item.innerHTML = `<span>${timestamp}</span> ${event}`;
  activityEntries.prepend(item);
  while (activityEntries.children.length > 6) {
    activityEntries.removeChild(activityEntries.lastElementChild);
  }
}

setInterval(pushActivity, 6000);

// Accessibility: hide non-active persona panels on load
personaPanels.forEach((panel) => {
  if (!panel.classList.contains('active')) {
    panel.setAttribute('hidden', 'true');
  } else {
    panel.removeAttribute('hidden');
  }
});
