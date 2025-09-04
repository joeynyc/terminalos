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
        
        // Mobile detection and device capabilities
        this.deviceInfo = this.detectDevice();
        this.isMobile = this.deviceInfo.isMobile;
        this.isTablet = this.deviceInfo.isTablet;
        this.hasTouch = this.deviceInfo.hasTouch;
        
        // Game state management
        this.gameActive = false;
        this.currentGame = null;
        this.gameData = {};
        
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
            pwd: () => this.showCurrentDir(),
            whoami: () => this.showUser(),
            date: () => this.showDate(),
            uname: () => this.showSystem(),
            cat: (args) => this.catFile(args),
            echo: (args) => this.echo(args),
            sudo: (args) => this.sudo(args),
            exit: () => this.exit(),
            matrix: () => this.matrixEffect(),
            hack: () => this.hackEffect(),
            secret: () => this.showSecret(),
            skills: () => this.showSkills(),
            projects: () => this.showProjects(),
            github: () => this.openGithub(),
            linkedin: () => this.openLinkedIn(),
            resume: () => this.showResume(),
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
            touch: () => this.showTouchCommands()
        };

        this.init();
        this.loadTheme();
        this.initMobileFeatures();
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
            this.input.focus();
            this.scrollToBottom();
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
        this.input.focus();
        
        // Keep input focused
        document.addEventListener('click', () => this.input.focus());
        
        // Initial cursor positioning
        this.updateCursorPosition();
        
        // Different welcome commands based on device
        if (this.isMobile) {
            this.typeCommand('mobile_help', 2000);
        } else {
            this.typeCommand('help', 2000);
        }
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
<span class="success">projects</span>     - View portfolio projects
<span class="success">resume</span>       - Display resume information
<span class="success">github</span>       - Open GitHub profile
<span class="success">linkedin</span>     - Open LinkedIn profile

<span class="info">System Commands:</span>
<span class="success">clear</span>        - Clear the terminal
<span class="success">ls</span>           - List directory contents
<span class="success">pwd</span>          - Show current directory
<span class="success">whoami</span>       - Show current user
<span class="success">date</span>         - Display current date
<span class="success">uname</span>        - System information
<span class="success">cat [file]</span>   - Display file contents
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

Hey there! I'm Joey, a passionate developer who loves creating 
innovative solutions and exploring new technologies.

<span class="success">Background:</span>
• Full-stack developer with expertise in modern web technologies
• Problem solver with a keen eye for detail
• Always learning and adapting to new challenges

<span class="success">Interests:</span>
• Web Development & Software Engineering
• Open Source Contribution
• Cybersecurity & Ethical Hacking
• Terminal/CLI Applications
• Automation & DevOps

<span class="success">Philosophy:</span>
"Code is poetry, and every bug is just a misplaced semicolon in the 
grand symphony of software development."

<span class="warning">Fun Fact:</span> I built this entire terminal interface because 
I believe the command line is the most elegant user interface ever created!
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
<span class="info">Contact Information</span>
═══════════════════════

<span class="success">📧 Email:</span>     joey@terminal.dev
<span class="success">🌐 Website:</span>   https://joey-terminal.dev
<span class="success">💼 LinkedIn:</span>  linkedin.com/in/joey-dev
<span class="success">🐙 GitHub:</span>    github.com/joey-terminal
<span class="success">🐦 Twitter:</span>   @joey_codes

<span class="success">📍 Location:</span>   Available for remote work globally
<span class="success">⏰ Timezone:</span>   Always online in cyberspace

<span class="warning">Preferred Contact Method:</span>
Email is the best way to reach me. I typically respond 
within 24 hours (or faster if you include a good coding joke).

<span class="info">Open for:</span>
• Full-time opportunities
• Freelance projects
• Collaboration on open source
• Tech discussions over coffee (virtual or real)
        `;
        this.addToOutput(contactText, 'command-output');
    }

    showSkills() {
        const skillsText = `
<span class="info">Programming Skills Matrix</span>
═══════════════════════════════

<span class="success">Python</span>           ████████████████████ 100%
<span class="success">JavaScript</span>       ██████████████████░░  90%
<span class="success">HTML/CSS</span>         ████████████████████ 100%
<span class="success">React</span>            ████████████████░░░░  80%
<span class="success">SQL</span>              ██████████████████░░  90%
<span class="success">Git</span>              ████████████████████ 100%
<span class="success">Linux</span>            ██████████████████░░  90%
<span class="success">Docker</span>           ████████████░░░░░░░░  60%
<span class="success">TypeScript</span>       ██████████████░░░░░░  70%
<span class="success">Node.js</span>          ████████████████░░░░  80%

<span class="warning">Soft Skills:</span>
• Problem Solving: Expert Level
• Team Collaboration: Highly Effective
• Communication: Clear & Concise
• Learning Agility: Rapid Adaptation
        `;
        this.addToOutput(skillsText, 'command-output');
    }

    showProjects() {
        const projectsText = `
<span class="info">Featured Projects</span>
═══════════════════

<span class="success">1. Terminal Portfolio Website</span>
   ├── Tech: HTML, CSS, JavaScript
   ├── Features: Interactive CLI, Easter eggs
   └── Status: You're using it right now! 🎉

<span class="success">2. Full-Stack E-commerce Platform</span>
   ├── Tech: Python/Django, PostgreSQL, React
   ├── Features: Payment integration, Admin dashboard
   └── Status: Production Ready

<span class="success">3. Real-time Chat Application</span>
   ├── Tech: Node.js, Socket.io, MongoDB
   ├── Features: Group chats, File sharing
   └── Status: Live Demo Available

<span class="success">4. Data Visualization Dashboard</span>
   ├── Tech: Python, Elasticsearch, D3.js
   ├── Features: Real-time analytics, Custom charts
   └── Status: Client Project - Confidential

<span class="warning">Open Source Contributions:</span>
• Various Python libraries on GitHub
• Documentation improvements
• Bug fixes and feature requests

Type 'github' to view my complete portfolio!
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
-rw-r--r--  joey  staff   resume.pdf
-rw-r--r--  joey  staff   secret.encrypted
-rwxr-xr-x  root  admin   sudo_access.sh
        `;
        this.addToOutput(files, 'command-output');
    }

    showCurrentDir() {
        this.addToOutput(this.currentDirectory, 'command-output');
    }

    showUser() {
        const user = this.isRoot ? 'root' : 'joey';
        this.addToOutput(user, 'command-output');
    }

    showDate() {
        const now = new Date();
        this.addToOutput(now.toString(), 'command-output');
    }

    showSystem() {
        const systemInfo = `
Linux terminal-portfolio 5.15.0 #1 SMP
Build: Terminal-OS v2.0.1 (Hacker Edition)
Architecture: x86_64
Kernel: Advanced-Shell-Interface
        `;
        this.addToOutput(systemInfo.trim(), 'command-output');
    }

    catFile(args) {
        if (!args.length) {
            this.addToOutput('Usage: cat [filename]', 'error');
            return;
        }

        const file = args[0];
        const fileContents = {
            'about_me.txt': 'Passionate developer | Problem solver | Terminal enthusiast',
            'contact.info': 'Email: joey@terminal.dev\nLocation: Cyberspace',
            'resume.pdf': 'PDF content cannot be displayed in terminal. Use \'resume\' command instead.',
            'secret.encrypted': '���ḧ̸̖́e̴̩̽l̷̰̈́l̴̰̇o̸͇̎_̷̣̈́w̶̱̌o̷̰͊r̷̰̄l̶̰̇d̷̰̈́_̸̰̄2̴̹̇0̸̰̅2̷̰̀4̸̰̅���'
        };

        if (fileContents[file]) {
            this.addToOutput(fileContents[file], 'command-output');
        } else {
            this.addToOutput(`cat: ${file}: No such file or directory`, 'error');
        }
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

    openGithub() {
        this.addToOutput('Opening GitHub profile in new tab...', 'info');
        // In a real implementation, you'd use: window.open('https://github.com/yourusername', '_blank');
        this.addToOutput('GitHub: https://github.com/joey-terminal', 'success');
    }

    openLinkedIn() {
        this.addToOutput('Opening LinkedIn profile in new tab...', 'info');
        // In a real implementation, you'd use: window.open('https://linkedin.com/in/yourprofile', '_blank');
        this.addToOutput('LinkedIn: https://linkedin.com/in/joey-dev', 'success');
    }

    showResume() {
        const resumeText = `
<span class="info">Joey's Resume</span>
═══════════════

<span class="success">EXPERIENCE</span>
──────────────
Senior Full-Stack Developer | Tech Corp (2022-2024)
├── Led development of scalable web applications
├── Mentored junior developers
└── Improved system performance by 40%

Full-Stack Developer | StartupCo (2020-2022)
├── Built MVP from scratch using Python/React
├── Implemented CI/CD pipelines
└── Collaborated with cross-functional teams

<span class="success">EDUCATION</span>
─────────────
Computer Science Degree | University of Code (2020)
├── Graduated Summa Cum Laude
├── Focus: Software Engineering & Algorithms
└── Relevant Coursework: Data Structures, Web Dev

<span class="success">CERTIFICATIONS</span>
─────────────────
├── AWS Certified Developer
├── Python Professional Certification
└── Certified Ethical Hacker (CEH)

<span class="warning">Download full resume:</span> joey-resume.pdf
        `;
        this.addToOutput(resumeText, 'command-output');
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
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});

