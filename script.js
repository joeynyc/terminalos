class Terminal {
    constructor() {
        this.output = document.getElementById('output');
        this.input = document.getElementById('command-input');
        this.cursor = document.getElementById('cursor');
        this.commandHistory = [];
        this.historyIndex = -1;
        this.isRoot = false;
        this.currentDirectory = '~';
        
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
            resume: () => this.showResume()
        };

        this.init();
    }

    init() {
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        this.input.focus();
        
        // Keep input focused
        document.addEventListener('click', () => this.input.focus());
        
        this.typeCommand('help', 2000);
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
        div.innerHTML = content;
        this.output.appendChild(div);
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

<span class="warning">Special Commands:</span>
<span class="success">sudo su</span>      - Switch to root user (🔓)
<span class="success">matrix</span>       - Enter the Matrix
<span class="success">hack</span>         - Initiate hack sequence
<span class="success">secret</span>       - ???

<span class="info">Navigation:</span>
↑/↓ arrows for command history
Tab for autocompletion
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
}

// Initialize terminal when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Terminal();
});

