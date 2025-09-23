class BootSequence {
    constructor(terminal) {
        this.terminal = terminal;
        this.overlay = document.getElementById('boot-overlay');
        this.body = document.body;
        this.linesContainer = document.getElementById('boot-lines');
        this.timelineContainer = document.getElementById('boot-timeline');
        this.statusElement = document.getElementById('boot-status');
        this.skipButton = document.getElementById('boot-skip');
        this.sequence = [
            {
                label: 'BIOS',
                text: 'Waking Joey.OS // creative technologist credentials verified.',
                status: 'Authenticating identity…',
                highlight: true,
                timelineIndex: 0
            },
            {
                label: 'TELEMETRY',
                text: 'Mapping obsessions: immersive terminals, narrative design, measurable impact.',
                status: 'Mapping strengths…',
                timelineIndex: 0
            },
            {
                label: 'SENSORS',
                text: 'Syncing live tools, games, and rapid prototyping utilities.',
                status: 'Loading toolkit…',
                timelineIndex: 1
            },
            {
                label: 'MISSION',
                text: 'Compiling cinematic case studies with outcomes, metrics, and takeaways.',
                status: 'Preparing case studies…',
                highlight: true,
                timelineIndex: 1
            },
            {
                label: 'HANDOFF',
                text: 'Control panel online. Type `help` to explore or `case` for cinematic studies.',
                status: 'Terminal ready. Awaiting input.',
                highlight: true,
                timelineIndex: 2
            }
        ];
        this.timelineData = [
            {
                phase: 'Phase 01 — Discovery',
                copy: 'Translate product vision into missions with technical guardrails and storytelling hooks.'
            },
            {
                phase: 'Phase 02 — Engineering',
                copy: 'Prototype fast, polish relentlessly, automate rituals, and keep humans in the loop.'
            },
            {
                phase: 'Phase 03 — Impact',
                copy: 'Ship experiences that earn adoption, measurable lift, and long-term delight.'
            }
        ];
        this.storageKey = 'joeyBootSequencePlayed';
        this.timers = [];
        this.welcomeInjected = false;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        this.handleGlobalKeydown = (event) => this.onKeydown(event);
        this.bindEvents();
    }

    bindEvents() {
        if (!this.overlay) return;

        if (this.skipButton) {
            this.skipButton.addEventListener('click', () => this.finish({ skipped: true }));
        }

        document.addEventListener('keydown', this.handleGlobalKeydown);
    }

    onKeydown(event) {
        if (!this.isRunning()) return;

        const key = event.key.toLowerCase();
        if (key === ' ' || key === 'enter' || key === 'escape') {
            event.preventDefault();
            this.finish({ skipped: true });
        }
    }

    isRunning() {
        return this.overlay && !this.overlay.classList.contains('hidden') && this.body.classList.contains('boot-active');
    }

    clearTimers() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.timers = [];
    }

    renderTimeline() {
        if (!this.timelineContainer) return;

        this.timelineContainer.innerHTML = '';
        this.timelineSteps = this.timelineData.map((step) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'boot-timeline-step';

            const phase = document.createElement('div');
            phase.className = 'boot-timeline-phase';
            phase.textContent = step.phase;

            const copy = document.createElement('div');
            copy.className = 'boot-timeline-copy';
            copy.textContent = step.copy;

            wrapper.appendChild(phase);
            wrapper.appendChild(copy);
            this.timelineContainer.appendChild(wrapper);
            return wrapper;
        });
    }

    announceLine(line, index) {
        if (!this.linesContainer) return;

        const lineElement = document.createElement('div');
        lineElement.className = 'boot-line';
        if (line.highlight) {
            lineElement.classList.add('is-highlight');
        }

        const label = document.createElement('span');
        label.className = 'boot-line-label';
        label.textContent = line.label;

        const copy = document.createElement('span');
        copy.className = 'boot-line-copy';
        copy.textContent = line.text;

        lineElement.appendChild(label);
        lineElement.appendChild(copy);
        this.linesContainer.appendChild(lineElement);

        if (this.statusElement && line.status) {
            this.statusElement.textContent = line.status;
        }

        if (this.timelineSteps && this.timelineSteps.length) {
            const activeIndex = Math.min(line.timelineIndex ?? index, this.timelineSteps.length - 1);
            this.timelineSteps.forEach((step, stepIndex) => {
                if (stepIndex <= activeIndex) {
                    step.classList.add('is-active');
                }
            });
        }
    }

    injectWelcome() {
        if (this.welcomeInjected || !this.terminal || !this.terminal.addToOutput) {
            if (this.terminal && this.terminal.input) {
                this.terminal.focusInput();
                this.terminal.updateCursorPosition();
            }
            return;
        }

        const welcomeLines = [
            '<span class="success">Joey.OS launch sequence complete.</span>',
            '<span class="info">Type \'help\' to preview the full mission control.</span>',
            '<span class="info">Try \'projects\' for cinematic case studies or \'matrix\' for easter eggs.</span>'
        ];

        welcomeLines.forEach(line => this.terminal.addToOutput(line, 'command-output'));
        this.welcomeInjected = true;

        if (this.terminal.input) {
            setTimeout(() => {
                this.terminal.focusInput();
                this.terminal.updateCursorPosition();
            }, 200);
        }
    }

    finish({ skipped = false } = {}) {
        if (!this.overlay) {
            this.injectWelcome();
            return;
        }

        this.clearTimers();
        this.overlay.classList.add('hidden');
        this.overlay.setAttribute('aria-hidden', 'true');
        this.body.classList.remove('boot-active');
        sessionStorage.setItem(this.storageKey, '1');
        document.removeEventListener('keydown', this.handleGlobalKeydown);
        this.injectWelcome();

        if (skipped && this.statusElement) {
            this.statusElement.textContent = 'Terminal ready. Awaiting input.';
        }
    }

    start() {
        if (!this.overlay) {
            this.injectWelcome();
            return;
        }

        const reduceMotion = this.prefersReducedMotion?.matches;

        if (reduceMotion) {
            this.finish({ skipped: true });
            return;
        }

        this.overlay.classList.remove('hidden');
        this.overlay.setAttribute('aria-hidden', 'false');
        this.body.classList.add('boot-active');

        if (this.linesContainer) {
            this.linesContainer.innerHTML = '';
        }

        this.renderTimeline();

        this.sequence.forEach((line, index) => {
            const timer = setTimeout(() => {
                this.announceLine(line, index);
                if (index === this.sequence.length - 1) {
                    const finishTimer = setTimeout(() => this.finish(), 600);
                    this.timers.push(finishTimer);
                }
            }, index * 700);

            this.timers.push(timer);
        });
    }
}

class CaseStudyViewer {
    constructor(terminal) {
        this.terminal = terminal;
        this.overlay = document.getElementById('case-overlay');
        this.dialog = this.overlay ? this.overlay.querySelector('.case-dialog') : null;
        this.closeButton = document.getElementById('case-close');
        this.prevButton = document.getElementById('case-prev');
        this.nextButton = document.getElementById('case-next');
        this.cta = document.getElementById('case-cta');
        this.metricsContainer = document.getElementById('case-metrics');
        this.timelineContainer = document.getElementById('case-timeline');
        this.highlightsContainer = document.getElementById('case-highlights');
        this.titleElement = document.getElementById('case-title');
        this.subtitleElement = document.getElementById('case-subtitle');
        this.kickerElement = document.getElementById('case-kicker');
        this.indexElement = document.getElementById('case-index');
        this.activeIndex = 0;
        this.focusReturnElement = null;

        this.handleKeydown = (event) => this.onKeydown(event);

        this.studies = [
            {
                id: 'browseros',
                aliases: ['browser', 'os', 'desktop'],
                kicker: 'Case Study 01',
                title: 'BrowserOS — Web Desktop for Rapid Prototyping',
                subtitle: 'Unified dozens of product demos into a responsive, multi-window OS experience that sales teams could launch in seconds.',
                metrics: [
                    { label: 'Role', value: 'Lead Engineer & Designer' },
                    { label: 'Timeline', value: '6 weeks' },
                    { label: 'Impact', value: '+64% demo engagement' }
                ],
                timeline: [
                    { phase: 'Recon', copy: 'Interviewed solution engineers and mapped the friction that killed energy in remote demos.' },
                    { phase: 'Build', copy: 'Crafted a window manager, live preview docking, and theming using vanilla JS with Houdini-level polish.' },
                    { phase: 'Impact', copy: 'Enabled teams to spin up curated workspaces in 30 seconds, unlocking new enterprise pilots.' }
                ],
                focusStep: 2,
                highlights: [
                    'Multi-window layout engine with drag, resize, and persistent context.',
                    'Edge-cached assets and offline mode for low-bandwidth meetings.',
                    'Telemetry overlay that surfaced KPIs directly in the workspace UI.'
                ],
                cta: { href: 'browseros/index.html', label: 'Launch BrowserOS' }
            },
            {
                id: 'vespera',
                aliases: ['crypto', 'cryptowatch', 'mission'],
                kicker: 'Case Study 02',
                title: 'Vespera — Mission Control for Crypto Signals',
                subtitle: 'Translated raw market data into an aerospace-grade dashboard so analysts could call trades with clarity.',
                metrics: [
                    { label: 'Role', value: 'Full-stack Engineer' },
                    { label: 'Timeline', value: '5 weeks' },
                    { label: 'Result', value: '-45% time-to-decision' }
                ],
                timeline: [
                    { phase: 'Signal', copy: 'Studied analyst workflows and prioritized legibility over flashy noise.' },
                    { phase: 'Systems', copy: 'Built streaming data pipelines and adaptive visual hierarchy with GPU-accelerated charts.' },
                    { phase: 'Launch', copy: 'Delivered dark-room compliant UI with responsive controls for trading floors.' }
                ],
                focusStep: 2,
                highlights: [
                    'Command center layout with mission badges and anomaly alerts.',
                    'GPU-accelerated charts with smooth scrub, replay, and predictive cues.',
                    'Custom alert scripting so teams could codify strategies without dev support.'
                ],
                cta: { href: 'cryptowatch/index.html', label: 'View Vespera' }
            },
            {
                id: 'focusclock',
                aliases: ['focus', 'clock', 'timer'],
                kicker: 'Case Study 03',
                title: 'FocusClock — Offline Productivity Mission Control',
                subtitle: 'Equipped remote teams with an offline-first sprint timer that keeps context, rituals, and notes in one view.',
                metrics: [
                    { label: 'Role', value: 'Product Engineer' },
                    { label: 'Timeline', value: '3 weeks' },
                    { label: 'Adoption', value: '87% weekly retention' }
                ],
                timeline: [
                    { phase: 'Research', copy: 'Shadowed async teams across time zones to map meeting and deep work friction.' },
                    { phase: 'Design', copy: 'Crafted a PWA with encrypted notes, ritual templates, and multi-sensory cues.' },
                    { phase: 'Delivery', copy: 'Rolled out analytics and theme systems proving time saved per sprint.' }
                ],
                focusStep: 2,
                highlights: [
                    'Offline-first architecture with service workers and resilient storage.',
                    'Real-time ritual cues tuned for deep focus across devices and lighting.',
                    'Accessible keyboard controls and AA contrast across every theme.'
                ],
                cta: { href: 'tools/focusclock.html', label: 'Open FocusClock' }
            }
        ];

        this.bindEvents();
    }

    canOpen() {
        return Boolean(this.overlay);
    }

    bindEvents() {
        if (!this.overlay) return;

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.close());
        }

        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.showPrevious());
        }

        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.showNext());
        }

        this.overlay.addEventListener('mousedown', (event) => {
            if (event.target === this.overlay) {
                this.close();
            }
        });

        document.addEventListener('keydown', this.handleKeydown);
    }

    onKeydown(event) {
        if (!this.isOpen()) return;

        switch (event.key) {
            case 'Escape':
                event.preventDefault();
                this.close();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.showNext();
                break;
            case 'ArrowLeft':
                event.preventDefault();
                this.showPrevious();
                break;
            case 'Tab':
                this.maintainFocus(event);
                break;
        }
    }

    isOpen() {
        return this.overlay?.classList.contains('case-overlay--open');
    }

    maintainFocus(event) {
        if (!this.overlay) return;

        const focusableSelectors = 'button, [href], [tabindex]:not([tabindex="-1"])';
        const focusable = Array.from(this.overlay.querySelectorAll(focusableSelectors))
            .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        } else if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        }
    }

    open(index = 0) {
        if (!this.overlay) return;

        const wasOpen = this.isOpen();
        const safeIndex = Math.max(0, Math.min(index, this.studies.length - 1));
        this.activeIndex = safeIndex;
        this.render();

        this.overlay.classList.add('case-overlay--open');
        this.overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('case-study-open');

        if (!wasOpen) {
            this.focusReturnElement = document.activeElement;
        }

        requestAnimationFrame(() => {
            if (this.closeButton) {
                this.closeButton.focus();
            }
        });
    }

    close() {
        if (!this.overlay) return;

        this.overlay.classList.remove('case-overlay--open');
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('case-study-open');

        if (this.focusReturnElement) {
            try {
                this.focusReturnElement.focus({ preventScroll: true });
            } catch (error) {
                this.focusReturnElement.focus();
            }
        } else if (this.terminal?.input) {
            this.terminal.focusInput();
            this.terminal.updateCursorPosition();
        }
    }

    showPrevious() {
        const nextIndex = (this.activeIndex - 1 + this.studies.length) % this.studies.length;
        this.open(nextIndex);
    }

    showNext() {
        const nextIndex = (this.activeIndex + 1) % this.studies.length;
        this.open(nextIndex);
    }

    findIndexById(id) {
        if (!id) return -1;

        const target = id.toLowerCase();
        return this.studies.findIndex(study => {
            if (study.id === target) return true;
            return Array.isArray(study.aliases) && study.aliases.includes(target);
        });
    }

    render() {
        const study = this.studies[this.activeIndex];
        if (!study) return;

        if (this.kickerElement) {
            this.kickerElement.textContent = study.kicker || `Case Study ${String(this.activeIndex + 1).padStart(2, '0')}`;
        }

        if (this.titleElement) {
            this.titleElement.textContent = study.title;
        }

        if (this.subtitleElement) {
            this.subtitleElement.textContent = study.subtitle || '';
        }

        if (this.metricsContainer) {
            this.metricsContainer.innerHTML = '';
            study.metrics?.forEach(metric => {
                const metricEl = document.createElement('div');
                metricEl.className = 'case-metric';

                const label = document.createElement('span');
                label.className = 'case-metric-label';
                label.textContent = metric.label;

                const value = document.createElement('span');
                value.className = 'case-metric-value';
                value.textContent = metric.value;

                metricEl.appendChild(label);
                metricEl.appendChild(value);
                this.metricsContainer.appendChild(metricEl);
            });
        }

        if (this.timelineContainer) {
            this.timelineContainer.innerHTML = '';
            const focusStep = typeof study.focusStep === 'number'
                ? study.focusStep
                : Math.max(0, (study.timeline?.length || 1) - 1);

            study.timeline?.forEach((step, index) => {
                const item = document.createElement('div');
                item.className = 'case-timeline-step';
                if (index === focusStep) {
                    item.classList.add('is-current');
                }

                const phase = document.createElement('div');
                phase.className = 'case-timeline-phase';
                phase.textContent = step.phase;

                const copy = document.createElement('div');
                copy.className = 'case-timeline-copy';
                copy.textContent = step.copy;

                item.appendChild(phase);
                item.appendChild(copy);
                this.timelineContainer.appendChild(item);
            });
        }

        if (this.highlightsContainer) {
            this.highlightsContainer.innerHTML = '';
            study.highlights?.forEach(point => {
                const li = document.createElement('li');
                li.textContent = point;
                this.highlightsContainer.appendChild(li);
            });
        }

        if (this.cta) {
            this.cta.href = study.cta?.href || '#';
            this.cta.textContent = study.cta?.label || 'View Project';
        }

        if (this.indexElement) {
            const total = String(this.studies.length).padStart(2, '0');
            const current = String(this.activeIndex + 1).padStart(2, '0');
            this.indexElement.textContent = `${current} / ${total}`;
        }
    }
}

class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.cursor = document.getElementById('cursor');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.isRoot = false;
        this.currentDirectory = '~';
        this.currentTheme = 'green';
        this.terminalZone = document.getElementById('terminal-zone');

        // Mobile detection and device capabilities
        this.deviceInfo = this.detectDevice();
        this.isMobile = this.deviceInfo.isMobile;
        this.isTablet = this.deviceInfo.isTablet;
        this.hasTouch = this.deviceInfo.hasTouch;
        
        // Game state management
        this.gameActive = false;
        this.currentGame = null;
        this.gameData = {};
        
        // RSS state management
        this.rssActive = false;
        this.rssStories = [];
        
        // Available themes
        this.themes = {
            green: { name: 'Matrix Green', color: '#00ff00', description: 'Classic hacker terminal' },
            blue: { name: 'Ocean Blue', color: '#00aaff', description: 'Cool and professional' },
            amber: { name: 'Retro Amber', color: '#ffaa00', description: 'Vintage computer vibes' },
            purple: { name: 'Cyberpunk Purple', color: '#aa00ff', description: 'Futuristic neon' },
            red: { name: 'Alert Red', color: '#ff0044', description: 'High-intensity mode' },
            cyan: { name: 'Aqua Cyan', color: '#00ffaa', description: 'Fresh and modern' },
            retro: { name: 'Orange Retro', color: '#ff8800', description: 'Classic 80s terminal' }
        };

        this.commands = {
            help: () => this.showHelp(),
            about_me: () => this.showAbout(),
            show_tools: () => this.showTools(),
            contact_joey: () => this.showContact(),
            clear: () => this.clearScreen(),
            ls: () => this.listFiles(),
            date: () => this.showDate(),
            echo: (args) => this.echo(args),
            sudo: (args) => this.sudo(args),
            exit: () => this.exit(),
            matrix: () => this.matrixEffect(),
            hack: () => this.hackEffect(),
            secret: () => this.showSecret(),
            skills: () => this.showSkills(),
            projects: () => this.openProjects(),
            theme: (args) => this.themeCommand(args),
            themes: () => this.showThemes(),
            games: () => this.showGames(),
            snake: () => this.playSnake(),
            guess: () => this.playGuessNumber(),
            wordle: () => this.playWordGuess(),
            tictactoe: () => this.playTicTacToe(),
            rps: () => this.playRockPaperScissors(),
            device: () => this.showDeviceInfo(),
            mobile_help: () => this.showMobileHelp(),
            touch: () => this.showTouchCommands(),
            blog: () => this.openBlog(),
            rss: () => this.showRSS(),
            github: () => this.openGitHub(),
            focusclock: () => this.openFocusClock(),
            git: () => this.openGitCheatsheet(),
            jotdown: () => this.openJotdown(),
            pindrop: () => this.openPindrop(),
            cryptowatch: () => this.openCryptowatch(),
            docker: () => this.openDockerCheatsheet(),
            expneural: () => this.openExpneural(),
            browseros: () => this.openBrowserOS(),
            svgviewer: () => this.openSVGViewer(),
            musicfactory: () => this.openMusicFactory(),
            worldclock: () => this.openWorldClock(),
            roadmap: () => this.showRoadmap(),
            case: (args) => this.openCaseStudy(args)
        };

        this.init();
        this.loadTheme();
        this.initMobileFeatures();
        this.initNavigation();

        this.caseStudyViewer = new CaseStudyViewer(this);
    }

    detectDevice() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                         (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && window.innerWidth <= 768);
        const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent) && window.innerWidth > 768;
        const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const supportsHover = window.matchMedia('(hover: hover)').matches;
        
        return {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            hasTouch,
            supportsHover,
            userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
            orientation: window.screen.orientation ? window.screen.orientation.angle : 0,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }

    initMobileFeatures() {
        // Add device classes to body for CSS targeting
        document.body.classList.add(
            this.isMobile ? 'device-mobile' : 
            this.isTablet ? 'device-tablet' : 'device-desktop'
        );
        
        if (this.hasTouch) {
            document.body.classList.add('has-touch');
        }
        
        // Mobile-specific event listeners
        if (this.isMobile || this.hasTouch) {
            this.initTouchEvents();
        }
        
        // Orientation change detection
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.deviceInfo = this.detectDevice();
                this.handleOrientationChange();
            }, 100);
        });
        
        // Viewport size change detection
        window.addEventListener('resize', () => {
            this.deviceInfo = this.detectDevice();
            this.handleViewportChange();
        });
    }

    focusInput({ preventScroll = true } = {}) {
        if (!this.input) return;
        try {
            if (preventScroll) {
                this.input.focus({ preventScroll: true });
            } else {
                this.input.focus();
            }
        } catch (error) {
            this.input.focus();
        }
    }

    ensureInputVisible({ smooth = true } = {}) {
        if (!this.input) return;
        const behavior = smooth ? 'smooth' : 'auto';
        const block = (this.isMobile || this.hasTouch) ? 'end' : 'nearest';

        try {
            this.input.scrollIntoView({ behavior, block });
        } catch (error) {
            // Fallback for browsers without smooth scrolling support
            this.input.scrollIntoView(false);
        }
    }

    scrollTerminalIntoView({ smooth = true } = {}) {
        if (!this.terminalZone) return;

        const rect = this.terminalZone.getBoundingClientRect();
        const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isVisible) {
            const behavior = smooth ? 'smooth' : 'auto';
            const viewportOffset = this.isMobile || this.hasTouch ? 48 : 80;
            const target = Math.max(0, window.scrollY + rect.top - viewportOffset);
            window.scrollTo({ top: target, behavior });
        }
    }

    ensureInputReady() {
        this.scrollTerminalIntoView();
        this.focusInput({ preventScroll: false });
        requestAnimationFrame(() => {
            this.ensureInputVisible({ smooth: false });
            this.updateCursorPosition();
        });
    }

    initTouchEvents() {
        let touchStartY = 0;
        let touchEndY = 0;

        // Touch events for swipe gestures on terminal body
        this.output.addEventListener('touchstart', (e) => {
            touchStartY = e.changedTouches[0].screenY;
        });
        
        this.output.addEventListener('touchend', (e) => {
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture(touchStartY, touchEndY);
        });
        
        // Prevent zoom on double tap for input
        let lastTouchEnd = 0;
        this.input.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    handleSwipeGesture(startY, endY) {
        const swipeThreshold = 50;
        const diff = startY - endY;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe up - scroll to bottom
                this.scrollToBottom();
            } else {
                // Swipe down - scroll to top if at bottom
                if (this.output.scrollTop + this.output.clientHeight >= this.output.scrollHeight - 10) {
                    this.output.scrollTop = Math.max(0, this.output.scrollTop - 200);
                }
            }
        }
    }

    handleOrientationChange() {
        // Adjust terminal size and focus input after orientation change
        setTimeout(() => {
            this.focusInput();
            this.scrollToBottom();
            this.scrollTerminalIntoView({ smooth: false });
            this.updateCursorPosition(); // Recalculate cursor position after orientation change
        }, 300);
        
        // Additional delay for iOS Safari viewport adjustment
        setTimeout(() => {
            this.updateCursorPosition();
        }, 500);
    }

    handleViewportChange() {
        // Handle viewport changes for better mobile alignment
        if (this.isMobile || this.hasTouch) {
            setTimeout(() => {
                this.updateCursorPosition();
                // Ensure input line stays visible
                if (this.input && this.input.getBoundingClientRect) {
                    const inputRect = this.input.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    // If input is close to viewport bottom, scroll it into view
                    if (inputRect.bottom > viewportHeight - 100) {
                        this.input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }, 100);
        }
    }

    init() {
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.addEventListener('input', () => this.updateCursorPosition());
        this.focusInput();
        
        // Keep input focused
        document.addEventListener('click', () => this.focusInput());
        
        // Initial cursor positioning
        this.updateCursorPosition();
    }

    updateCursorPosition() {
        const prompt = document.querySelector('.prompt');
        const inputValue = this.input.value;
        
        // Mobile-optimized cursor positioning
        if (this.isMobile || this.hasTouch) {
            this.updateMobileCursorPosition(prompt, inputValue);
        } else {
            this.updateDesktopCursorPosition(prompt, inputValue);
        }
    }

    updateMobileCursorPosition(prompt, inputValue) {
        // Use more accurate text measurement for mobile
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const computedStyle = window.getComputedStyle(this.input);
        context.font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
        
        const textWidth = context.measureText(inputValue).width;
        const promptWidth = prompt.getBoundingClientRect().width;
        
        // Add small offset for mobile touch precision
        const mobileOffset = 2;
        this.cursor.style.left = (promptWidth + textWidth + mobileOffset) + 'px';
        
        // Ensure cursor stays visible on small screens
        const maxLeft = this.input.parentElement.getBoundingClientRect().width - 20;
        if (promptWidth + textWidth + mobileOffset > maxLeft) {
            this.cursor.style.left = maxLeft + 'px';
        }
    }

    updateDesktopCursorPosition(prompt, inputValue) {
        // Original desktop cursor positioning logic
        const measurer = document.createElement('span');
        measurer.style.visibility = 'hidden';
        measurer.style.position = 'absolute';
        measurer.style.font = window.getComputedStyle(this.input).font;
        measurer.textContent = inputValue;
        document.body.appendChild(measurer);
        
        const textWidth = measurer.offsetWidth;
        document.body.removeChild(measurer);
        
        const promptWidth = prompt.offsetWidth;
        this.cursor.style.left = (promptWidth + textWidth) + 'px';
    }

    handleKeydown(e) {
        switch(e.key) {
            case 'Enter':
                this.executeCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.navigateHistory(-1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.navigateHistory(1);
                break;
            case 'Tab':
                e.preventDefault();
                this.autoComplete();
                break;
        }
    }

    executeCommand() {
        const command = this.input.value.trim();
        if (!command) return;

        // Handle game states
        if (this.gameActive && this.currentGame) {
            this.handleGameInput(command);
            this.input.value = '';
            this.scrollToBottom();
            this.ensureInputReady();
            return;
        }

        // Handle RSS states
        if (this.rssActive) {
            this.handleRSSInput(command);
            this.input.value = '';
            this.scrollToBottom();
            this.ensureInputReady();
            return;
        }

        this.addToOutput(`${this.getPrompt()}${command}`, 'command-line');
        this.commandHistory.unshift(command);
        this.historyIndex = -1;

        const [cmd, ...args] = command.split(' ');
        
        if (this.commands[cmd]) {
            this.commands[cmd](args);
        } else {
            this.addToOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
        }

        this.input.value = '';
        this.ensureInputReady();
    }

    runCommand(commandString) {
        if (!commandString) return;
        const parsed = Array.isArray(commandString) ? commandString.join(' ') : commandString;
        const trimmed = parsed.trim();
        if (!trimmed) return;

        this.input.value = trimmed;
        this.executeCommand();
        this.scrollToBottom();
    }

    addToOutput(content, className = 'command-output') {
        const div = document.createElement('div');
        div.className = className;
        
        // Secure HTML rendering: parse and sanitize content
        if (typeof content === 'string' && content.includes('<span')) {
            // Handle formatted content with spans safely
            this.renderFormattedContent(div, content);
        } else {
            // Plain text content - safe
            div.textContent = content;
        }
        
        this.output.appendChild(div);
        
        // Always scroll to bottom after adding content to keep cursor visible
        // Use requestAnimationFrame for smooth scrolling that syncs with browser rendering
        requestAnimationFrame(() => {
            setTimeout(() => this.scrollToBottom(), 0);
        });
    }

    renderFormattedContent(container, content) {
        // Safe HTML parser that only allows specific formatting tags
        const allowedTags = ['span', 'pre', 'div'];
        const allowedClasses = [
            'success', 'error', 'warning', 'info', 'hidden-content', 
            'matrix-effect', 'theme-preview'
        ];
        
        // Split content by HTML tags and process safely
        const parts = content.split(/(<\/?[^>]+>)/);
        
        parts.forEach(part => {
            if (part.startsWith('<') && part.endsWith('>')) {
                // This is an HTML tag - validate and create safely
                const tagMatch = part.match(/<\/?(\w+)(?:\s+class=['"]([^'"]+)['"])?[^>]*>/);
                if (tagMatch) {
                    const [, tagName, className] = tagMatch;
                    
                    if (allowedTags.includes(tagName.toLowerCase())) {
                        if (part.startsWith('</')) {
                            // Closing tag - handled by DOM structure
                            return;
                        }
                        
                        const element = document.createElement(tagName);
                        if (className && allowedClasses.includes(className)) {
                            element.className = className;
                        }
                        container.appendChild(element);
                        // Set current container to the new element for nested content
                        container = element;
                    }
                }
            } else if (part.trim()) {
                // This is text content - safe to add
                const textNode = document.createTextNode(part);
                container.appendChild(textNode);
            }
        });
    }

    getPrompt() {
        const user = this.isRoot ? 'root' : 'joey';
        const symbol = this.isRoot ? '#' : '$';
        return `${user}@terminal:${this.currentDirectory}${symbol} `;
    }

    showHelp() {
        const helpText = `
Available Commands:
──────────────────
<span class="success">about_me</span>      - Learn about Joey
<span class="success">show_tools</span>    - Display technical skills
<span class="success">contact_joey</span>  - Get contact information
<span class="success">skills</span>       - Show programming skills
<span class="success">roadmap</span>      - View 90-day technical roadmap
<span class="success">projects</span>     - Open projects portfolio page
<span class="success">case [id]</span>    - Launch cinematic case studies deck
<span class="success">blog</span>         - Open minimal blog page
<span class="success">github</span>       - Open Govee-MCP repository
<span class="success">rss</span>          - Browse Hacker News stories

<span class="info">Available Tools:</span>
<span class="success">focusclock</span>   - Launch productivity timer tool
<span class="success">git</span>          - Launch Git command reference
<span class="success">jotdown</span>     - Launch minimal modular workspace
<span class="success">pindrop</span>     - Launch draggable sticky notes board
<span class="success">cryptowatch</span>  - Launch cryptocurrency dashboard
<span class="success">docker</span>       - Launch Docker command cheat sheet
<span class="success">browseros</span>    - Launch web-based operating system
<span class="success">svgviewer</span>    - Launch SVG gallery viewer
<span class="success">musicfactory</span>  - Launch music production interface
<span class="success">worldclock</span>    - Launch global time zones viewer

<span class="info">System Commands:</span>
<span class="success">clear</span>        - Clear the terminal
<span class="success">ls</span>           - List directory contents
<span class="success">date</span>         - Display current date
<span class="success">echo [text]</span>  - Display text

<span class="warning">Theme Commands:</span>
<span class="success">themes</span>       - Show available themes
<span class="success">theme [name]</span> - Change terminal theme

<span class="warning">Games:</span>
<span class="success">games</span>        - Show available games
<span class="success">snake</span>        - Play Snake game
<span class="success">guess</span>        - Number guessing game
<span class="success">wordle</span>       - Word guessing game
<span class="success">tictactoe</span>    - Play Tic-Tac-Toe
<span class="success">rps</span>          - Rock Paper Scissors

${this.isMobile ? '<span class="warning">📱 Mobile Commands:</span>\n<span class="success">device</span>       - Show device info\n<span class="success">touch</span>        - Touch gesture help\n<span class="success">mobile_help</span>  - Mobile-optimized help\n' : ''}
<span class="warning">Special Commands:</span>
<span class="success">sudo su</span>      - Switch to root user (🔓)
<span class="success">matrix</span>       - Enter the Matrix
<span class="success">hack</span>         - Initiate hack sequence
<span class="success">secret</span>       - ???

<span class="info">Navigation:</span>
${this.isMobile ? '• Tap to focus input\n• Swipe up/down to scroll\n• Use on-screen keyboard' : '↑/↓ arrows for command history\nTab for autocompletion'}
        `;
        this.addToOutput(helpText, 'command-output');
    }

    showAbout() {
        const aboutText = `
<span class="info">About Joey</span>
═══════════════

<span class="success">Background:</span>
• Full-stack developer and automation engineer focused on AI-assisted workflows and high-leverage tooling. (<a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
• Builds single-file web apps, CLI/terminal UIs, and agentic systems that integrate with local models and cloud APIs. (<a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
• DevOps-minded: containers, CI/CD, reproducible environments, observability, and performance tuning. (<a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
• Workstation: high-end GPU rig (RTX 4080), 64GB+ RAM, multi-NVMe, Windows + WSL2 + Docker for rapid iteration. (<a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)

<span class="success">Interests:</span>
• Local LLMs & Agents (Ollama, Open WebUI, LocalAI, Codex CLI) — prompt tooling, evaluation, automation hooks.
• Web Platforms (React, Expo/React Native, TypeScript) — PWA, routing, state, offline primitives.
• Systems & Automation (n8n, Playwright/MCP, Node/TS services) — scheduled jobs, headless orchestration.
• DevOps (Docker, Compose, Git, CI/CD) — images, pipelines, artifact management.
• Frontend Engineering (HTML/CSS, Tailwind, shadcn/ui, Framer Motion, Recharts) — accessible, performant UIs.
• Graphics/Assets (SVG pipelines, icon systems, animated wordmarks).

<span class="success">Philosophy:</span>
"Ship small, ship often. Automate the repeatable; craft the remarkable." (<a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)

<span class="warning">Fun Facts:</span>
• Built a browser "OS," sticky-note apps, SVG viewers, and AR/interactive landing pages as portable single-file demos.
• Runs agentic workflows to generate marketing assets, control IoT, and batch-process data locally.
        `;
        this.addToOutput(aboutText, 'command-output');
    }

    showTools() {
        const toolsText = `
<span class="info">Technical Arsenal</span>
═══════════════════

<span class="success">Frontend Technologies:</span>
├── HTML5/CSS3/JavaScript (ES6+)
├── React.js & Vue.js
├── TypeScript
├── SASS/SCSS
└── Responsive Design & CSS Frameworks

<span class="success">Backend Technologies:</span>
├── Python (Django, Flask, FastAPI)
├── Node.js & Express
├── SQL Databases (PostgreSQL, MySQL)
├── Elasticsearch
└── RESTful APIs & GraphQL

<span class="success">Development Tools:</span>
├── Git/GitHub
├── Docker & Containerization
├── VS Code & Terminal
├── Linux/Unix Systems
└── CI/CD Pipelines

<span class="success">Cloud & DevOps:</span>
├── AWS/Azure
├── Database Management
├── Server Administration
└── Monitoring & Analytics

<span class="warning">Currently Learning:</span>
├── Advanced Cybersecurity
├── Machine Learning
└── Blockchain Development
        `;
        this.addToOutput(toolsText, 'command-output');
    }

    showContact() {
        const contactText = `
<span class="info">Contact</span>
═══════════

<span class="success">📧 Email:</span>     <a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>

<span class="warning">Primary Contact Method:</span>
Email is the best way to reach me for all professional inquiries,
technical discussions, project collaborations, and automation consulting.

<span class="info">Response Time:</span> Typically within 24 hours for technical inquiries.
        `;
        this.addToOutput(contactText, 'command-output');
    }

    showSkills() {
        const skillsText = `
<span class="info">Programming & Markup Matrix</span> (reach: <a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
═══════════════════════════════════════════════════════════
<span class="success">JavaScript/Node.js</span>        [███████████████▉ ] 95%
<span class="success">HTML/CSS</span>                  [███████████████▉ ] 95%
<span class="success">React / RN / Expo</span>         [██████████████   ] 90%
<span class="success">TypeScript</span>                [█████████████▏   ] 86%
<span class="success">Shopify Liquid/Templating</span> [██████████████▉ ] 92%
<span class="success">Python (automation/data)</span>  [███████████▎     ] 76%
<span class="success">SQL (analytics/reporting)</span> [████████████     ] 80%
<span class="success">Bash/CLI & WSL2</span>           [████████████     ] 80%
<span class="success">SEO/Schema/Perf</span>           [████████████▏    ] 82%
<span class="success">SVG/Animation (CSS/JS)</span>    [████████████     ] 80%

<span class="info">Ops / AI / Automation</span>
═════════════════════════
<span class="success">Docker & Compose</span>         [█████████████▏   ] 88%
<span class="success">Windows + WSL2 Dev</span>       [█████████████▎   ] 89%
<span class="success">n8n Workflows</span>            [██████████████   ] 90%
<span class="success">Open WebUI/Ollama/Local</span>  [████████████     ] 80%
<span class="success">Playwright MCP/Agents</span>    [███████████▌     ] 78%
<span class="success">CI/CD & Git</span>              [███████████████  ] 92%
<span class="success">Linux (admin basics)</span>     [███████████▊     ] 78%
<span class="success">DNS/Email Auth (SPF/DMARC)</span>[████████████    ] 80%

<span class="warning">Toolbelt (often used)</span>
═══════════════════════════════
• Languages: JS/TS, Python, SQL, Bash
• Frameworks: React, Expo, Tailwind, shadcn/ui, Framer Motion, Recharts
• AI: Codex CLI, Ollama, Open WebUI, LocalAI; model presets & prompt JSON specs
• Automation: n8n, Playwright, headless Chromium, cron-style schedulers
• DevOps: Docker/Compose, Git, CI pipelines, artifact/version management
• Assets: SVG pipelines, icon sets, animated wordmarks
(contact: <a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
        `;
        this.addToOutput(skillsText, 'command-output');
    }

    showRoadmap() {
        const roadmapText = `
<span class="info">roadmap --next-90-days</span>
═══════════════════════════════
1) Codex-powered Ops Agent: file ingest → reasoning → action runners (n8n & Playwright bridges).
2) PWA foundation: installable shell, offline cache, background sync, structured routing.
3) Local LLM toolkit: one-click model swap, evaluation harness, batch asset generator.
4) Portable demo suite: SVG viewer, terminal UI starter, AR vignette — all single-file and downloadable.
5) Telemetry: lightweight metrics for latency, error rates, and model/tool success.
(inquiries → <a href="mailto:info@socialwithjoey.com">info@socialwithjoey.com</a>)
        `;
        this.addToOutput(roadmapText, 'command-output');
    }

    showProjects() {
        const projectsText = `
<span class="info">Featured Projects</span>
═══════════════════

<span class="success">1. Terminal Portfolio Website</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Interactive CLI, Easter eggs, RSS integration
   └── Status: You're using it right now! 🎉

<span class="success">2. SocialWithJoey.com</span>
   ├── Tech: Web Development
   ├── Features: Social platform and content hub
   └── Status: Live at socialwithjoey.com

<span class="success">3. FocusClock</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Productivity timer with notes & encryption
   └── Status: Integrated tool (type 'focusclock')

<span class="success">4. Git Command Cheatsheet</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Interactive Git reference guide
   └── Status: Integrated tool (type 'git')

<span class="success">5. JOT DOWN</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Minimal modular workspace for notes & tasks
   └── Status: Integrated tool (type 'jotdown')

<span class="success">6. PinDrop</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Draggable sticky notes with themes
   └── Status: Integrated tool (type 'pindrop')

<span class="success">7. Vespera Cryptocurrency Dashboard</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: NASA-inspired crypto tracker with live prices
   └── Status: Integrated tool (type 'cryptowatch')

<span class="success">8. Experience Neural</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Interactive AI visualization platform with immersive experiences
   └── Status: Integrated tool (type 'expneural')

<span class="success">9. BrowserOS</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Web-based operating system with desktop environment
   └── Status: Integrated tool (type 'browseros')

<span class="success">10. SVG Gallery Viewer</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Advanced SVG viewer with color analysis and dynamic theming
   └── Status: Integrated tool (type 'svgviewer')

<span class="success">11. Music Factory</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Music production and composition interface
   └── Status: Integrated tool (type 'musicfactory')

<span class="success">12. Govee MCP Server</span>
   ├── Tech: Python, MCP Protocol
   ├── Features: Control Govee lights with natural language
   └── Status: Open Source (type 'github')

<span class="warning">Development Tools:</span>
• Terminal-based development environment
• Integrated productivity and reference tools
• Claude Code automation workflows
        `;
        this.addToOutput(projectsText, 'command-output');
    }

    clearScreen() {
        this.output.innerHTML = '';
    }

    listFiles() {
        const files = `
<span class="info">Directory Contents:</span>
drwxr-xr-x  joey  staff   about_me.txt
drwxr-xr-x  joey  staff   skills.json
drwxr-xr-x  joey  staff   projects/
drwxr-xr-x  joey  staff   contact.info
drwxr-xr-x  joey  staff   games/
-rw-r--r--  joey  staff   secret.encrypted
-rwxr-xr-x  root  admin   sudo_access.sh
        `;
        this.addToOutput(files, 'command-output');
    }

    showDate() {
        const now = new Date();
        this.addToOutput(now.toString(), 'command-output');
    }

    echo(args) {
        this.addToOutput(args.join(' '), 'command-output');
    }

    sudo(args) {
        if (args.length === 0) {
            this.addToOutput('Usage: sudo [command]', 'error');
            return;
        }

        if (args[0] === 'su') {
            if (!this.isRoot) {
                this.isRoot = true;
                this.addToOutput('🔓 Root access granted. Welcome to the Matrix, Neo.', 'hidden-content');
                this.addToOutput('You now have elevated privileges. Use them wisely.', 'warning');
                this.addToOutput('Type \'secret\' to access classified information.', 'info');
            } else {
                this.addToOutput('You are already root.', 'warning');
            }
        } else {
            this.addToOutput('sudo: sorry, you are not allowed to run that command.', 'error');
        }
    }

    showSecret() {
        if (!this.isRoot) {
            this.addToOutput('Access denied. Root privileges required.', 'error');
            return;
        }

        const secretText = `
<span class="hidden-content">🔐 CLASSIFIED INFORMATION 🔐</span>
═══════════════════════════════

<span class="warning">SECURITY CLEARANCE: ROOT</span>

<span class="hidden-content">Easter Egg Unlocked!</span>

Joey's Secret Development Stats:
├── Lines of Code Written: 847,293
├── Bugs Fixed: 12,847
├── Coffee Consumed: 2,847 cups
├── Stack Overflow Visits: 15,329
└── Hours Spent Debugging: 3,847

<span class="success">Hidden Achievement Unlocked:</span>
"Terminal Hacker" - You found the secret command!

<span class="info">Bonus Content:</span>
The real secret is that this entire website was built 
with pure HTML, CSS, and JavaScript to prove that 
sometimes the simplest solutions are the most elegant.

<span class="warning">⚠️ This message will self-destruct in 30 seconds... ⚠️</span>
(Just kidding, it won't. But it sounds cool, right?)
        `;
        this.addToOutput(secretText, 'command-output');
    }

    matrixEffect() {
        this.addToOutput('Entering the Matrix...', 'warning');
        
        setTimeout(() => {
            const matrix = `
<div class="matrix-effect">
01001000 01100101 01101100 01101100 01101111
01010111 01101111 01110010 01101100 01100100
01001001 01101110 01110100 01101000 01100101
01001101 01100001 01110100 01110010 01101001
01111000 00100000 01100101 01110110 01100101
01110010 01111001 01110100 01101000 01101001
01101110 01100111 00100000 01101001 01110011
01100011 01101111 01100100 01100101 00100001
</div>
Welcome to the Matrix, Neo. The choice is yours.
            `;
            this.addToOutput(matrix, 'command-output');
        }, 1000);
    }

    hackEffect() {
        this.addToOutput('Initiating hack sequence...', 'warning');
        
        const hackSteps = [
            'Scanning for vulnerabilities...',
            'Found 0 vulnerabilities (this is a portfolio site!)',
            'Accessing mainframe...',
            'Just kidding! This is just for fun 😄',
            'Hack complete: You now have the power to... hire Joey!'
        ];

        hackSteps.forEach((step, index) => {
            setTimeout(() => {
                this.addToOutput(step, index < 3 ? 'info' : 'success');
            }, (index + 1) * 1000);
        });
    }


    exit() {
        this.addToOutput('Thanks for visiting! Connection terminated.', 'warning');
        setTimeout(() => {
            this.addToOutput('Just kidding! You can\'t escape that easily 😄', 'success');
            this.addToOutput('Type \'help\' to continue exploring!', 'info');
        }, 2000);
    }

    navigateHistory(direction) {
        if (this.commandHistory.length === 0) return;

        this.historyIndex += direction;
        
        if (this.historyIndex < 0) {
            this.historyIndex = 0;
        } else if (this.historyIndex >= this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length - 1;
        }

        this.input.value = this.commandHistory[this.historyIndex] || '';
    }

    autoComplete() {
        const input = this.input.value.toLowerCase();
        const commands = Object.keys(this.commands);
        const matches = commands.filter(cmd => cmd.startsWith(input));

        if (matches.length === 1) {
            this.input.value = matches[0];
        } else if (matches.length > 1) {
            this.addToOutput(`${this.getPrompt()}${input}`, 'command-line');
            this.addToOutput(matches.join('  '), 'info');
        }
    }

    typeCommand(command, delay = 0) {
        setTimeout(() => {
            let i = 0;
            const typing = setInterval(() => {
                this.input.value = command.substring(0, i);
                i++;
                if (i > command.length) {
                    clearInterval(typing);
                    setTimeout(() => this.executeCommand(), 500);
                }
            }, 100);
        }, delay);
    }

    scrollToBottom() {
        this.output.scrollTop = this.output.scrollHeight;
    }

    showThemes() {
        const themesText = `
<span class="info">Available Terminal Themes</span>
═══════════════════════════════

<span class="theme-preview green"></span><span class="success">green</span>    - ${this.themes.green.name} (${this.themes.green.description})
<span class="theme-preview blue"></span><span class="success">blue</span>     - ${this.themes.blue.name} (${this.themes.blue.description})
<span class="theme-preview amber"></span><span class="success">amber</span>    - ${this.themes.amber.name} (${this.themes.amber.description})
<span class="theme-preview purple"></span><span class="success">purple</span>   - ${this.themes.purple.name} (${this.themes.purple.description})
<span class="theme-preview red"></span><span class="success">red</span>      - ${this.themes.red.name} (${this.themes.red.description})
<span class="theme-preview cyan"></span><span class="success">cyan</span>     - ${this.themes.cyan.name} (${this.themes.cyan.description})
<span class="theme-preview retro"></span><span class="success">retro</span>    - ${this.themes.retro.name} (${this.themes.retro.description})

<span class="warning">Current theme:</span> <span class="success">${this.currentTheme}</span> (${this.themes[this.currentTheme].name})

<span class="info">Usage:</span> theme [name]
<span class="info">Example:</span> theme blue
        `;
        this.addToOutput(themesText, 'command-output');
    }

    themeCommand(args) {
        if (!args.length) {
            this.addToOutput('Usage: theme [theme-name]\nType "themes" to see available themes.', 'error');
            return;
        }

        const themeName = args[0].toLowerCase();
        
        if (!this.themes[themeName]) {
            this.addToOutput(`Theme "${themeName}" not found. Type "themes" to see available themes.`, 'error');
            return;
        }

        this.setTheme(themeName);
        this.addToOutput(`🎨 Theme changed to "${this.themes[themeName].name}"`, 'success');
        this.addToOutput('Terminal appearance updated with smooth transitions!', 'info');
    }

    setTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Save theme preference
        localStorage.setItem('terminalTheme', themeName);
        
        // Add visual feedback
        document.body.style.animation = 'themeTransition 0.5s ease-in-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('terminalTheme');
        if (savedTheme && this.themes[savedTheme]) {
            this.setTheme(savedTheme);
        }
    }

    // ========================
    // GAMES SECTION
    // ========================

    showGames() {
        const gamesText = `
<span class="info">🎮 Terminal Games 🎮</span>
═══════════════════════

<span class="success">Available Games:</span>
├── <span class="success">snake</span>      - Classic Snake game${this.isMobile ? ' (mobile optimized)' : ' with ASCII graphics'}
├── <span class="success">guess</span>      - Number guessing game (1-100)
├── <span class="success">wordle</span>     - Word guessing game (5 letters)
├── <span class="success">tictactoe</span>  - Tic-Tac-Toe against AI
└── <span class="success">rps</span>        - Rock Paper Scissors

<span class="warning">Game Controls:</span>
${this.isMobile ? '📱 Mobile Controls:\n• Most games use simple text input\n• Snake: Use w/a/s/d keys on your device keyboard\n• Number entry games work great with mobile keyboards\n• Type "quit" during any game to exit' : '• Most games use simple text commands\n• Snake uses WASD or arrow key letters (w/a/s/d)\n• Type "quit" during any game to exit\n• Type "help" in-game for game-specific commands'}

${this.isMobile ? '<span class="info">💡 Mobile Gaming Tips:</span>\n• Snake game uses smaller board for mobile screens\n• Virtual keyboard will appear automatically\n• Swipe gestures still work during games for scrolling\n• Portrait mode recommended for best experience' : '<span class="info">High Scores:</span>\nGames will track your best scores during this session!'}

<span class="success">Ready to play?</span> Just type the game name to start!
        `;
        this.addToOutput(gamesText, 'command-output');
    }

    handleGameInput(input) {
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            this.endGame();
            return;
        }

        switch (this.currentGame) {
            case 'snake':
                this.handleSnakeInput(input);
                break;
            case 'guess':
                this.handleGuessInput(input);
                break;
            case 'wordle':
                this.handleWordleInput(input);
                break;
            case 'tictactoe':
                this.handleTicTacToeInput(input);
                break;
            case 'rps':
                this.handleRPSInput(input);
                break;
        }
    }

    endGame() {
        this.gameActive = false;
        this.currentGame = null;
        this.gameData = {};
        this.addToOutput('<span class="warning">Game ended. Back to terminal.</span>', 'command-output');
        this.addToOutput('Type \'games\' to see available games or \'help\' for all commands.', 'info');
    }

    // ========================
    // SNAKE GAME
    // ========================

    playSnake() {
        this.gameActive = true;
        this.currentGame = 'snake';
        
        // Adjust board size for mobile
        const boardWidth = this.isMobile ? 20 : 30;
        const boardHeight = this.isMobile ? 12 : 15;
        
        this.gameData = {
            board: Array(boardHeight).fill().map(() => Array(boardWidth).fill(' ')),
            snake: [{x: Math.floor(boardWidth/2), y: Math.floor(boardHeight/2)}, 
                    {x: Math.floor(boardWidth/2)-1, y: Math.floor(boardHeight/2)}, 
                    {x: Math.floor(boardWidth/2)-2, y: Math.floor(boardHeight/2)}],
            direction: {x: 1, y: 0},
            food: {x: Math.floor(boardWidth*0.7), y: Math.floor(boardHeight/2)},
            score: 0,
            gameOver: false,
            boardWidth,
            boardHeight
        };

        this.addToOutput('<span class="success">🐍 SNAKE GAME STARTED 🐍</span>', 'command-output');
        if (this.isMobile) {
            this.addToOutput('<span class="info">📱 Mobile Controls: w(up) a(left) s(down) d(right) | "quit" to exit</span>', 'command-output');
            this.addToOutput('<span class="warning">💡 Tip: Use your device keyboard for w/a/s/d controls</span>', 'command-output');
        } else {
            this.addToOutput('<span class="info">Controls: w(up) a(left) s(down) d(right) | Type "quit" to exit</span>', 'command-output');
        }
        this.updateSnakeDisplay();
    }

    handleSnakeInput(input) {
        if (this.gameData.gameOver) {
            if (input.toLowerCase() === 'r' || input.toLowerCase() === 'restart') {
                this.playSnake();
            }
            return;
        }

        const direction = input.toLowerCase();
        switch (direction) {
            case 'w':
                if (this.gameData.direction.y !== 1) this.gameData.direction = {x: 0, y: -1};
                break;
            case 's':
                if (this.gameData.direction.y !== -1) this.gameData.direction = {x: 0, y: 1};
                break;
            case 'a':
                if (this.gameData.direction.x !== 1) this.gameData.direction = {x: -1, y: 0};
                break;
            case 'd':
                if (this.gameData.direction.x !== -1) this.gameData.direction = {x: 1, y: 0};
                break;
            default:
                this.addToOutput('<span class="error">Use w/a/s/d to move the snake!</span>', 'command-output');
                return;
        }

        this.moveSnake();
    }

    moveSnake() {
        const head = {...this.gameData.snake[0]};
        head.x += this.gameData.direction.x;
        head.y += this.gameData.direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= this.gameData.boardWidth || head.y < 0 || head.y >= this.gameData.boardHeight) {
            this.gameData.gameOver = true;
            this.addToOutput('<span class="error">💥 GAME OVER! Hit the wall!</span>', 'command-output');
            this.addToOutput(`<span class="info">Final Score: ${this.gameData.score}</span>`, 'command-output');
            this.addToOutput('<span class="warning">Type "r" to restart or "quit" to exit</span>', 'command-output');
            return;
        }

        // Check self collision
        for (let segment of this.gameData.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameData.gameOver = true;
                this.addToOutput('<span class="error">💥 GAME OVER! Snake bit itself!</span>', 'command-output');
                this.addToOutput(`<span class="info">Final Score: ${this.gameData.score}</span>`, 'command-output');
                this.addToOutput('<span class="warning">Type "r" to restart or "quit" to exit</span>', 'command-output');
                return;
            }
        }

        this.gameData.snake.unshift(head);

        // Check food collision
        if (head.x === this.gameData.food.x && head.y === this.gameData.food.y) {
            this.gameData.score += 10;
            this.generateFood();
        } else {
            this.gameData.snake.pop();
        }

        this.updateSnakeDisplay();
    }

    generateFood() {
        do {
            this.gameData.food = {
                x: Math.floor(Math.random() * this.gameData.boardWidth),
                y: Math.floor(Math.random() * this.gameData.boardHeight)
            };
        } while (this.gameData.snake.some(segment => 
            segment.x === this.gameData.food.x && segment.y === this.gameData.food.y
        ));
    }

    updateSnakeDisplay() {
        const board = Array(this.gameData.boardHeight).fill().map(() => Array(this.gameData.boardWidth).fill('·'));
        
        // Place food
        board[this.gameData.food.y][this.gameData.food.x] = '🍎';
        
        // Place snake
        this.gameData.snake.forEach((segment, index) => {
            if (index === 0) {
                board[segment.y][segment.x] = '█'; // Head
            } else {
                board[segment.y][segment.x] = '▓'; // Body
            }
        });

        const display = board.map(row => row.join('')).join('\n');
        this.addToOutput(`<span class="success">Score: ${this.gameData.score}</span>\n<pre>${display}</pre>`, 'command-output');
    }

    // ========================
    // GUESS THE NUMBER GAME
    // ========================

    playGuessNumber() {
        this.gameActive = true;
        this.currentGame = 'guess';
        this.gameData = {
            target: Math.floor(Math.random() * 100) + 1,
            attempts: 0,
            maxAttempts: 7,
            guesses: []
        };

        const startText = `
<span class="success">🎯 NUMBER GUESSING GAME 🎯</span>

I'm thinking of a number between 1 and 100.
You have ${this.gameData.maxAttempts} attempts to guess it!

<span class="info">Type your guess (1-100) or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleGuessInput(input) {
        const guess = parseInt(input);
        
        if (isNaN(guess) || guess < 1 || guess > 100) {
            this.addToOutput('<span class="error">Please enter a valid number between 1 and 100!</span>', 'command-output');
            return;
        }

        this.gameData.attempts++;
        this.gameData.guesses.push(guess);

        if (guess === this.gameData.target) {
            this.addToOutput(`<span class="success">🎉 CONGRATULATIONS! You guessed it!</span>`, 'command-output');
            this.addToOutput(`<span class="info">The number was ${this.gameData.target}</span>`, 'command-output');
            this.addToOutput(`<span class="info">It took you ${this.gameData.attempts} attempts</span>`, 'command-output');
            this.addToOutput(`<span class="info">Your guesses: ${this.gameData.guesses.join(', ')}</span>`, 'command-output');
            this.endGame();
            return;
        }

        const remaining = this.gameData.maxAttempts - this.gameData.attempts;
        const hint = guess < this.gameData.target ? 'higher' : 'lower';
        
        if (remaining === 0) {
            this.addToOutput(`<span class="error">💥 GAME OVER! No attempts left!</span>`, 'command-output');
            this.addToOutput(`<span class="warning">The number was ${this.gameData.target}</span>`, 'command-output');
            this.addToOutput(`<span class="info">Your guesses: ${this.gameData.guesses.join(', ')}</span>`, 'command-output');
            this.endGame();
        } else {
            this.addToOutput(`<span class="warning">Try ${hint}! (${remaining} attempts left)</span>`, 'command-output');
            this.addToOutput(`<span class="info">Your guesses so far: ${this.gameData.guesses.join(', ')}</span>`, 'command-output');
        }
    }

    // ========================
    // WORD GUESSING GAME (WORDLE-STYLE)
    // ========================

    playWordGuess() {
        this.gameActive = true;
        this.currentGame = 'wordle';
        
        const words = ['REACT', 'SNAKE', 'GAMES', 'CODER', 'LINUX', 'PIXEL', 'BYTES', 'DEBUG', 'LOGIC', 'ARRAY'];
        this.gameData = {
            target: words[Math.floor(Math.random() * words.length)],
            attempts: 0,
            maxAttempts: 6,
            guesses: [],
            letters: new Set()
        };

        const startText = `
<span class="success">📝 WORD GUESSING GAME 📝</span>

Guess the 5-letter word! You have ${this.gameData.maxAttempts} attempts.

<span class="info">🟩 = Correct letter in right position</span>
<span class="warning">🟨 = Correct letter in wrong position</span>
<span class="error">⬜ = Letter not in word</span>

<span class="info">Type a 5-letter word or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleWordleInput(input) {
        const guess = input.toUpperCase().trim();
        
        if (guess.length !== 5 || !/^[A-Z]+$/.test(guess)) {
            this.addToOutput('<span class="error">Please enter a valid 5-letter word!</span>', 'command-output');
            return;
        }

        this.gameData.attempts++;
        this.gameData.guesses.push(guess);

        // Check each letter
        let result = '';
        let feedback = '';
        for (let i = 0; i < 5; i++) {
            const letter = guess[i];
            this.gameData.letters.add(letter);
            
            if (letter === this.gameData.target[i]) {
                result += '🟩';
                feedback += `<span class="success">${letter}</span>`;
            } else if (this.gameData.target.includes(letter)) {
                result += '🟨';
                feedback += `<span class="warning">${letter}</span>`;
            } else {
                result += '⬜';
                feedback += `<span class="error">${letter}</span>`;
            }
        }

        this.addToOutput(`${feedback} ${result}`, 'command-output');

        if (guess === this.gameData.target) {
            this.addToOutput(`<span class="success">🎉 EXCELLENT! You found the word!</span>`, 'command-output');
            this.addToOutput(`<span class="info">The word was "${this.gameData.target}"</span>`, 'command-output');
            this.addToOutput(`<span class="info">Solved in ${this.gameData.attempts} attempts</span>`, 'command-output');
            this.endGame();
            return;
        }

        const remaining = this.gameData.maxAttempts - this.gameData.attempts;
        if (remaining === 0) {
            this.addToOutput(`<span class="error">💥 GAME OVER! No attempts left!</span>`, 'command-output');
            this.addToOutput(`<span class="warning">The word was "${this.gameData.target}"</span>`, 'command-output');
            this.endGame();
        } else {
            this.addToOutput(`<span class="info">${remaining} attempts remaining</span>`, 'command-output');
        }
    }

    // ========================
    // TIC-TAC-TOE GAME
    // ========================

    playTicTacToe() {
        this.gameActive = true;
        this.currentGame = 'tictactoe';
        this.gameData = {
            board: Array(9).fill(' '),
            playerSymbol: 'X',
            aiSymbol: 'O',
            gameOver: false
        };

        const startText = `
<span class="success">⭕ TIC-TAC-TOE vs AI ❌</span>

You are X, AI is O. Choose your position (1-9):

 1 | 2 | 3 
-----------
 4 | 5 | 6 
-----------
 7 | 8 | 9 

<span class="info">Type a number (1-9) or "quit" to exit</span>
        `;
        this.addToOutput(startText, 'command-output');
        this.displayTicTacToeBoard();
    }

    handleTicTacToeInput(input) {
        if (this.gameData.gameOver) return;

        const position = parseInt(input) - 1;
        
        if (isNaN(position) || position < 0 || position > 8) {
            this.addToOutput('<span class="error">Please enter a number between 1 and 9!</span>', 'command-output');
            return;
        }

        if (this.gameData.board[position] !== ' ') {
            this.addToOutput('<span class="error">That position is already taken!</span>', 'command-output');
            return;
        }

        // Player move
        this.gameData.board[position] = this.gameData.playerSymbol;
        this.displayTicTacToeBoard();

        if (this.checkTicTacToeWin(this.gameData.playerSymbol)) {
            this.addToOutput('<span class="success">🎉 YOU WIN! Congratulations!</span>', 'command-output');
            this.gameData.gameOver = true;
            this.endGame();
            return;
        }

        if (this.gameData.board.every(cell => cell !== ' ')) {
            this.addToOutput('<span class="warning">🤝 It\'s a tie! Good game!</span>', 'command-output');
            this.gameData.gameOver = true;
            this.endGame();
            return;
        }

        // AI move
        const aiMove = this.getAIMove();
        this.gameData.board[aiMove] = this.gameData.aiSymbol;
        this.addToOutput(`<span class="info">AI chooses position ${aiMove + 1}</span>`, 'command-output');
        this.displayTicTacToeBoard();

        if (this.checkTicTacToeWin(this.gameData.aiSymbol)) {
            this.addToOutput('<span class="error">🤖 AI WINS! Better luck next time!</span>', 'command-output');
            this.gameData.gameOver = true;
            this.endGame();
            return;
        }

        if (this.gameData.board.every(cell => cell !== ' ')) {
            this.addToOutput('<span class="warning">🤝 It\'s a tie! Good game!</span>', 'command-output');
            this.gameData.gameOver = true;
            this.endGame();
        }
    }

    displayTicTacToeBoard() {
        const board = this.gameData.board;
        const display = `
 ${board[0]} | ${board[1]} | ${board[2]} 
-----------
 ${board[3]} | ${board[4]} | ${board[5]} 
-----------
 ${board[6]} | ${board[7]} | ${board[8]} 
        `;
        this.addToOutput(`<pre>${display}</pre>`, 'command-output');
    }

    checkTicTacToeWin(symbol) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6] // Diagonals
        ];

        return winPatterns.some(pattern => 
            pattern.every(index => this.gameData.board[index] === symbol)
        );
    }

    getAIMove() {
        // Simple AI: Try to win, then block player, then take center/corners
        const board = this.gameData.board;
        
        // Check if AI can win
        for (let i = 0; i < 9; i++) {
            if (board[i] === ' ') {
                board[i] = this.gameData.aiSymbol;
                if (this.checkTicTacToeWin(this.gameData.aiSymbol)) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        // Check if need to block player
        for (let i = 0; i < 9; i++) {
            if (board[i] === ' ') {
                board[i] = this.gameData.playerSymbol;
                if (this.checkTicTacToeWin(this.gameData.playerSymbol)) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        // Take center if available
        if (board[4] === ' ') return 4;

        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => board[i] === ' ');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        // Take any available spot
        const available = board.map((cell, index) => cell === ' ' ? index : null).filter(x => x !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    // ========================
    // ROCK PAPER SCISSORS
    // ========================

    playRockPaperScissors() {
        this.gameActive = true;
        this.currentGame = 'rps';
        this.gameData = {
            playerScore: 0,
            aiScore: 0,
            rounds: 0,
            maxRounds: 5
        };

        const startText = `
<span class="success">✂️ ROCK PAPER SCISSORS ✂️</span>

Best of ${this.gameData.maxRounds} rounds against the AI!

<span class="info">Commands: rock, paper, scissors, or quit</span>
<span class="warning">Score: You 0 - 0 AI</span>
        `;
        this.addToOutput(startText, 'command-output');
    }

    handleRPSInput(input) {
        const choice = input.toLowerCase().trim();
        const validChoices = ['rock', 'paper', 'scissors'];
        
        if (!validChoices.includes(choice)) {
            this.addToOutput('<span class="error">Choose: rock, paper, or scissors!</span>', 'command-output');
            return;
        }

        const aiChoice = validChoices[Math.floor(Math.random() * 3)];
        const result = this.getRPSResult(choice, aiChoice);
        
        this.gameData.rounds++;
        
        let resultText = `
<span class="info">Round ${this.gameData.rounds}</span>
You: ${this.getRPSEmoji(choice)} ${choice}
AI:  ${this.getRPSEmoji(aiChoice)} ${aiChoice}
        `;

        if (result === 'win') {
            this.gameData.playerScore++;
            resultText += '<span class="success">🎉 You win this round!</span>';
        } else if (result === 'lose') {
            this.gameData.aiScore++;
            resultText += '<span class="error">🤖 AI wins this round!</span>';
        } else {
            resultText += '<span class="warning">🤝 It\'s a tie!</span>';
        }

        resultText += `\n<span class="info">Score: You ${this.gameData.playerScore} - ${this.gameData.aiScore} AI</span>`;
        
        this.addToOutput(resultText, 'command-output');

        if (this.gameData.rounds >= this.gameData.maxRounds) {
            let finalResult;
            if (this.gameData.playerScore > this.gameData.aiScore) {
                finalResult = '<span class="success">🏆 YOU WIN THE GAME! Congratulations!</span>';
            } else if (this.gameData.aiScore > this.gameData.playerScore) {
                finalResult = '<span class="error">🤖 AI WINS THE GAME! Better luck next time!</span>';
            } else {
                finalResult = '<span class="warning">🤝 OVERALL TIE! Great game!</span>';
            }
            
            this.addToOutput(finalResult, 'command-output');
            this.addToOutput(`<span class="info">Final Score: You ${this.gameData.playerScore} - ${this.gameData.aiScore} AI</span>`, 'command-output');
            this.endGame();
        } else {
            this.addToOutput(`<span class="info">${this.gameData.maxRounds - this.gameData.rounds} rounds remaining</span>`, 'command-output');
        }
    }

    getRPSResult(player, ai) {
        if (player === ai) return 'tie';
        if (
            (player === 'rock' && ai === 'scissors') ||
            (player === 'paper' && ai === 'rock') ||
            (player === 'scissors' && ai === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    }

    getRPSEmoji(choice) {
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        return emojis[choice] || '';
    }

    // ========================
    // MOBILE-SPECIFIC COMMANDS
    // ========================

    showMobileHelp() {
        const mobileHelpText = `
<span class="info">📱 Mobile Terminal - Welcome!</span>
═══════════════════════════════

<span class="success">👋 Quick Start for Mobile:</span>
<span class="success">about_me</span>      - Learn about Joey
<span class="success">contact_joey</span>  - Get contact info  
<span class="success">skills</span>       - View skills & experience
<span class="success">games</span>        - Play terminal games

<span class="warning">📱 Mobile Features:</span>
<span class="success">device</span>       - Show device info
<span class="success">touch</span>        - Touch gesture help
<span class="success">mobile_help</span>  - This help (mobile optimized)
<span class="success">help</span>         - Full command list

<span class="info">🎮 Touch Controls:</span>
• Tap to focus input
• Swipe up/down to scroll
• Use on-screen keyboard
• Double-tap prevention enabled

<span class="info">💡 Pro Tips:</span>
• Rotate device for better view
• Use 'clear' to clean screen
• Try 'theme blue' for different colors
• 'snake' game works great on mobile!

<span class="warning">Type any command to get started!</span>
        `;
        this.addToOutput(mobileHelpText, 'command-output');
    }

    showDeviceInfo() {
        const deviceText = `
<span class="info">Device Information</span>
═══════════════════════

<span class="success">Device Type:</span>    ${this.isMobile ? '📱 Mobile' : this.isTablet ? '📱 Tablet' : '💻 Desktop'}
<span class="success">Touch Support:</span>  ${this.hasTouch ? '✅ Yes' : '❌ No'}
<span class="success">Hover Support:</span>  ${this.deviceInfo.supportsHover ? '✅ Yes' : '❌ No'}
<span class="success">Screen Size:</span>    ${this.deviceInfo.screenWidth}x${this.deviceInfo.screenHeight}
<span class="success">Viewport:</span>       ${this.deviceInfo.viewportWidth}x${this.deviceInfo.viewportHeight}
<span class="success">Pixel Ratio:</span>    ${this.deviceInfo.devicePixelRatio}x
<span class="success">Touch Points:</span>   ${this.deviceInfo.maxTouchPoints}
<span class="success">Platform:</span>       ${this.deviceInfo.platform}
<span class="success">Orientation:</span>    ${this.deviceInfo.orientation}°

<span class="warning">User Agent:</span>
${this.deviceInfo.userAgent}

<span class="info">Optimizations Active:</span>
${this.isMobile ? '• Mobile UI adjustments\n• Touch gesture support\n• Mobile-first welcome' : '• Desktop experience\n• Full feature set\n• Hover interactions'}
        `;
        this.addToOutput(deviceText, 'command-output');
    }

    showTouchCommands() {
        const touchText = `
<span class="info">🤚 Touch Gesture Guide</span>
═══════════════════════════

<span class="success">Basic Gestures:</span>
├── <span class="warning">Tap</span>           Focus input field
├── <span class="warning">Swipe Up</span>      Scroll to bottom
├── <span class="warning">Swipe Down</span>    Scroll up (when at bottom)
└── <span class="warning">Double Tap</span>    Prevented (no zoom)

<span class="success">Mobile Navigation:</span>
├── Use on-screen keyboard for typing
├── Scroll naturally through terminal history
├── Rotate device for landscape view
└── Terminal automatically adjusts to orientation

<span class="success">Gaming on Mobile:</span>
├── <span class="success">snake</span> - Use w/a/s/d keys
├── <span class="success">tictactoe</span> - Tap numbers 1-9
├── <span class="success">rps</span> - Type rock/paper/scissors
└── <span class="success">guess</span> - Number guessing works great!

<span class="warning">Pro Tips:</span>
• Terminal remembers your command history
• Use Tab for autocompletion on mobile keyboards
• 'clear' command cleans up cluttered screen
• Themes work beautifully on mobile displays

<span class="info">Having issues? Try 'device' to see your setup!</span>
        `;
        this.addToOutput(touchText, 'command-output');
    }

    openBlog() {
        this.addToOutput('<span class="info">Opening blog in new tab...</span>', 'command-output');
        window.open('blog.html', '_blank');
        this.addToOutput('<span class="success">Blog opened! Check your browser tabs.</span>', 'command-output');
    }

    openProjects() {
        this.addToOutput('<span class="info">Opening projects portfolio in new tab...</span>', 'command-output');
        window.open('projects.html', '_blank');
        this.addToOutput('<span class="success">Projects portfolio opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">For the cinematic version, try the \'case\' command or use the Case Studies tab.</span>', 'command-output');
    }

    openCaseStudy(args = []) {
        if (!this.caseStudyViewer || !this.caseStudyViewer.canOpen()) {
            this.addToOutput('<span class="warning">Interactive case deck unavailable. Try the projects command instead.</span>', 'command-output');
            return;
        }

        if (!args.length) {
            this.caseStudyViewer.open();
            this.addToOutput('<span class="info">Showing case studies. Use ←/→ or type \'case [id]\' for a direct jump.</span>', 'command-output');
            return;
        }

        const target = String(args[0]).toLowerCase();
        const index = this.caseStudyViewer.findIndexById(target);

        if (index >= 0) {
            this.caseStudyViewer.open(index);
            this.addToOutput(`<span class="success">Loaded ${target} case study.</span>`, 'command-output');
        } else {
            this.addToOutput(`<span class="warning">Unknown case study: ${target}. Launching full deck instead.</span>`, 'command-output');
            this.caseStudyViewer.open();
        }
    }

    openGitHub() {
        this.addToOutput('<span class="info">🐙 Opening Govee-MCP GitHub repository...</span>', 'command-output');
        window.open('https://github.com/joeynyc/Govee-MCP.git', '_blank');
        this.addToOutput('<span class="success">✅ GitHub repository opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">💡 A MCP Server to control your Govee Lights using natural language!</span>', 'command-output');
    }

    openFocusClock() {
        this.addToOutput('<span class="info">🔧 Launching FocusClock tool...</span>', 'command-output');
        window.open('tools/focusclock.html', '_blank');
        this.addToOutput('<span class="success">✅ FocusClock opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">⏱️ Offline productivity timer with notes and client-side encryption.</span>', 'command-output');
    }

    openGitCheatsheet() {
        this.addToOutput('<span class="info">📚 Opening Git command cheatsheet...</span>', 'command-output');
        window.open('tools/git-cheatsheet.html', '_blank');
        this.addToOutput('<span class="success">✅ Git cheatsheet opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">💡 Quick reference for all your Git commands and workflows.</span>', 'command-output');
    }

    openJotdown() {
        this.addToOutput('<span class="info">📝 Launching JOT DOWN workspace...</span>', 'command-output');
        window.open('jotdown.html', '_blank');
        this.addToOutput('<span class="success">✅ JOT DOWN opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">✨ Minimal modular workspace for notes and task management.</span>', 'command-output');
    }

    openPindrop() {
        this.addToOutput('<span class="info">📌 Launching PinDrop sticky notes...</span>', 'command-output');
        window.open('pindrop.html', '_blank');
        this.addToOutput('<span class="success">✅ PinDrop opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">🎨 Draggable sticky notes board with themes and organization.</span>', 'command-output');
    }

    openCryptowatch() {
        this.addToOutput('<span class="info">📈 Launching Vespera Cryptocurrency Dashboard...</span>', 'command-output');
        window.open('cryptowatch/index.html', '_blank');
        this.addToOutput('<span class="success">✅ Cryptowatch opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">🚀 NASA-inspired cryptocurrency mission control with live prices and analytics.</span>', 'command-output');
    }

    openDockerCheatsheet() {
        this.addToOutput('<span class="info">🐳 Opening Docker command cheatsheet...</span>', 'command-output');
        window.open('./docker-cheatsheet.html', '_blank');
        this.addToOutput('<span class="success">✅ Docker cheatsheet opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">📦 Complete reference for Docker commands, containers, and workflows.</span>', 'command-output');
    }

    openExpneural() {
        this.addToOutput('<span class="info">🧠 Launching Experience Neural...</span>', 'command-output');
        window.open('expneural/index.html', '_blank');
        this.addToOutput('<span class="success">✅ Experience Neural opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">✨ Interactive AI visualization platform with immersive neural network experiences.</span>', 'command-output');
    }

    openBrowserOS() {
        this.addToOutput('<span class="info">🌐 Launching BrowserOS...</span>', 'command-output');
        window.open('browseros/index.html', '_blank');
        this.addToOutput('<span class="success">✅ BrowserOS opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">💻 Web-based operating system interface with desktop environment.</span>', 'command-output');
    }

    openSVGViewer() {
        this.addToOutput('<span class="info">🎨 Launching SVG Gallery Viewer...</span>', 'command-output');
        window.open('svgviewer/index.html', '_blank');
        this.addToOutput('<span class="success">✅ SVG Viewer opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">🖼️ Advanced SVG file viewer with color extraction and dynamic theming.</span>', 'command-output');
    }

    openMusicFactory() {
        this.addToOutput('<span class="info">🎵 Launching Music Factory...</span>', 'command-output');
        window.open('musicfactory/index.html', '_blank');
        this.addToOutput('<span class="success">✅ Music Factory opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">🎼 Music production and composition interface for creating digital music.</span>', 'command-output');
    }

    openWorldClock() {
        this.addToOutput('<span class="info">🌍 Launching World Clock...</span>', 'command-output');
        window.open('worldclock/index.html', '_blank');
        this.addToOutput('<span class="success">✅ World Clock opened! Check your browser tabs.</span>', 'command-output');
        this.addToOutput('<span class="info">⏰ Global time zones viewer with real-time clock display.</span>', 'command-output');
    }

    // ========================
    // RSS / HACKER NEWS INTEGRATION
    // ========================

    async showRSS() {
        this.addToOutput('<span class="info">📰 Fetching latest Hacker News stories...</span>', 'command-output');
        
        try {
            const stories = await this.fetchHackerNewsStories();
            
            if (!stories || stories.length === 0) {
                throw new Error('No stories received from API');
            }
            
            this.rssStories = stories.filter(story => story && story.title);
            this.displayRSSStories();
            this.rssActive = true;
            
        } catch (error) {
            const fallbackStories = await this.loadFallbackStories();

            if (fallbackStories.length) {
                this.addToOutput('<span class="warning">🔌 Live feed unavailable. Switching to Joey.OS mission briefings.</span>', 'command-output');
                this.rssStories = fallbackStories;
                this.displayRSSStories({
                    heading: '📡 Joey.OS Mission Briefings',
                    offline: true
                });
                this.rssActive = true;
            } else {
                this.addToOutput('<span class="warning">⚠️ Unable to fetch live stories right now.</span>', 'command-output');
                this.addToOutput(`<span class="info">${error.message}</span>`, 'command-output');
            }
        }
    }

    async loadFallbackStories() {
        try {
            const response = await fetch('posts.json');
            if (!response.ok) {
                throw new Error('Fallback posts could not be loaded');
            }

            const posts = await response.json();
            if (!Array.isArray(posts) || posts.length === 0) {
                return [];
            }

            return posts.map((post, index) => {
                const safeId = post?.id || `local-${index}`;
                const date = post?.date ? new Date(post.date) : null;
                const formattedDate = date && !Number.isNaN(date.valueOf())
                    ? date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : 'Recently updated';

                return {
                    id: safeId,
                    title: post?.title || 'Joey.OS briefing',
                    url: `blog.html#${safeId}`,
                    infoLine: `📅 ${formattedDate}`,
                    isLocal: true
                };
            });
        } catch (fallbackError) {
            console.warn('Local fallback stories unavailable:', fallbackError.message);
            return [];
        }
    }

    async fetchHackerNewsStories() {
        try {
            // Try multiple proxy services in order
            const proxies = [
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://thingproxy.freeboard.io/fetch/',
                'https://cors-anywhere.herokuapp.com/',
                'https://corsproxy.io/?'
            ];
            
            const baseUrl = 'https://hacker-news.firebaseio.com/v0/';
            let storyIds = null;
            
            // Try each proxy until one works for top stories
            for (const proxy of proxies) {
                try {
                    const url = proxy + encodeURIComponent(baseUrl + 'topstories.json');
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        storyIds = await response.json();
                        this.workingProxy = proxy; // Remember which proxy worked
                        break;
                    }
                } catch (error) {
                    console.log(`Proxy ${proxy} failed:`, error.message);
                    continue;
                }
            }
            
            if (!storyIds || !Array.isArray(storyIds)) {
                throw new Error('Unable to fetch story IDs from any proxy service');
            }
            
            const topStoryIds = storyIds.slice(0, 10);
            
            // Use the working proxy to fetch individual stories
            const stories = [];
            for (const id of topStoryIds) {
                try {
                    const url = this.workingProxy + encodeURIComponent(baseUrl + `item/${id}.json`);
                    const response = await fetch(url);
                    
                    if (response.ok) {
                        const story = await response.json();
                        if (story && story.title) {
                            stories.push(story);
                        }
                    }
                    
                    // Small delay between requests
                    await new Promise(resolve => setTimeout(resolve, 150));
                } catch (error) {
                    console.log(`Skipped story ${id}:`, error.message);
                    continue;
                }
                
                // Stop if we have enough stories
                if (stories.length >= 8) break;
            }
            
            if (stories.length === 0) {
                throw new Error('No stories could be fetched');
            }
            
            return stories;
            
        } catch (error) {
            throw new Error(`Failed to fetch Hacker News stories: ${error.message}`);
        }
    }


    displayRSSStories({ heading = '🚀 Top Hacker News Stories', offline = false } = {}) {
        this.addToOutput(`<span class="success">${heading}</span>`, 'command-output');
        this.addToOutput('═══════════════════════════════', 'command-output');
        
        this.rssStories.forEach((story, index) => {
            const storyNumber = index + 1;
            const points = story.score ?? 0;
            const comments = story.descendants ?? 0;
            const title = story.title.length > 60 ? story.title.substring(0, 57) + '...' : story.title;
            const infoLine = story.infoLine || `↑${points} points | 💬${comments} comments`;
            
            const storyText = `
<span class="success">${storyNumber.toString().padStart(2, ' ')}.</span> ${title}
    <span class="info">${infoLine}</span>`;
            
            this.addToOutput(storyText, 'command-output');
        });
        
        this.addToOutput('', 'command-output');
        const range = this.rssStories.length;
        this.addToOutput(`<span class="warning">Type a number (1-${range}) to open ${offline ? 'a briefing' : 'a story'}, or "quit" to exit RSS mode</span>`, 'command-output');
        if (offline) {
            this.addToOutput('<span class="info">Briefings open the Joey.OS blog in a new tab.</span>', 'command-output');
        }
    }

    handleRSSInput(input) {
        if (input.toLowerCase() === 'quit' || input.toLowerCase() === 'exit') {
            this.endRSS();
            return;
        }

        const storyNumber = parseInt(input);
        if (isNaN(storyNumber) || storyNumber < 1 || storyNumber > this.rssStories.length) {
            this.addToOutput('<span class="error">Please enter a valid story number (1-10) or "quit" to exit</span>', 'command-output');
            return;
        }

        const selectedStory = this.rssStories[storyNumber - 1];
        if (selectedStory) {
            this.openStory(selectedStory);
        }
    }

    openStory(story) {
        this.addToOutput(`<span class="info">Opening: ${story.title}</span>`, 'command-output');
        
        if (story.url) {
            // External link
            window.open(story.url, '_blank');
            this.addToOutput('<span class="success">✅ Story opened in new tab</span>', 'command-output');
            if (story.isLocal) {
                this.addToOutput('<span class="info">📓 You\'re viewing a Joey.OS blog post.</span>', 'command-output');
            }
        } else {
            // HN discussion only (Ask HN, Show HN, etc.)
            const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
            window.open(hnUrl, '_blank');
            this.addToOutput('<span class="success">✅ Hacker News discussion opened in new tab</span>', 'command-output');
        }
        
        this.addToOutput('<span class="info">Type another number to open more stories, or "quit" to exit RSS mode</span>', 'command-output');
    }

    endRSS() {
        this.rssActive = false;
        this.rssStories = [];
        this.addToOutput('<span class="warning">RSS mode ended. Back to terminal.</span>', 'command-output');
        this.addToOutput('Type \'rss\' to browse Hacker News again or \'help\' for all commands.', 'info');
    }

    initNavigation() {
        const nav = document.querySelector('.floating-nav');
        const navToggle = nav ? nav.querySelector('.nav-toggle') : null;
        const navContainer = nav ? nav.querySelector('.nav-container') : null;
        const navItems = navContainer ? navContainer.querySelectorAll('.nav-item') : [];

        const setNavOpen = (open) => {
            if (!nav || !navToggle) return;
            nav.classList.toggle('nav-open', open);
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        };

        const syncNavToViewport = () => {
            if (!nav || !navToggle) return;
            const isDesktop = window.innerWidth > 768;
            setNavOpen(isDesktop);
            navToggle.disabled = isDesktop;
            navToggle.setAttribute('aria-hidden', isDesktop ? 'true' : 'false');
        };

        if (navToggle) {
            navToggle.addEventListener('click', () => {
                if (!nav) return;
                const isOpen = nav.classList.toggle('nav-open');
                navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

                if (isOpen && navContainer) {
                    const activeItem = navContainer.querySelector('.nav-item.active');
                    if (activeItem) {
                        requestAnimationFrame(() => activeItem.scrollIntoView({ block: 'center', behavior: 'smooth' }));
                    }
                }
            });
        }

        window.addEventListener('resize', () => syncNavToViewport());
        syncNavToViewport();

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navItems.forEach(navItem => navItem.classList.remove('active'));
                item.classList.add('active');

                const command = item.getAttribute('data-command');
                if (command && this.commands[command]) {
                    this.addToOutput(`${this.getPrompt()}${command}`, 'command-line');
                    this.commands[command]();
                    this.scrollToBottom();
                }

                if (nav && window.innerWidth <= 768) {
                    setNavOpen(false);
                }
            });
        });
    }

    endGame() {
        this.gameActive = false;
        this.currentGame = null;
        this.gameData = {};
        this.addToOutput('<span class="warning">Game ended. Back to terminal.</span>', 'command-output');
        this.addToOutput('Type \'games\' to see available games or \'help\' for all commands.', 'info');
    }
}

window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
        window.scrollTo(0, 0);
    }
});

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const terminal = new Terminal();
    const bootSequence = new BootSequence(terminal);
    window.joeyTerminal = terminal;
    document.dispatchEvent(new CustomEvent('joey-terminal-ready', { detail: { terminal } }));
    bootSequence.start();
});
