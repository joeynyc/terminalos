// Main JavaScript file for portfolio website
// Handles animations, interactions, and dynamic functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initEmailProtection();
    initScrollAnimations();
    initTypewriterEffect();
    initMobileMenu();
    initContactForm();
    initBlogFilters();
    initSmoothScrolling();
    initParallaxEffects();

    // Initialize text splitting for advanced animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
});

// Email obfuscation for privacy protection
function initEmailProtection() {
    const emailLinks = document.querySelectorAll('[data-email-user]');
    emailLinks.forEach(link => {
        const user = link.dataset.emailUser;
        const domain = link.dataset.emailDomain;
        const email = `${user}@${domain}`;
        link.href = `mailto:${email}`;
        if (link.dataset.showEmail === 'true') {
            link.textContent = email;
        }
    });
}

// Scroll-triggered animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Add staggered animation for child elements
                const staggerElements = entry.target.querySelectorAll('.stagger-delay-1, .stagger-delay-2, .stagger-delay-3, .stagger-delay-4, .stagger-delay-5, .stagger-delay-6');
                staggerElements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('revealed');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);

    // Observe all elements with reveal-text class
    document.querySelectorAll('.reveal-text').forEach(el => {
        observer.observe(el);
    });
}

// Typewriter effect for hero tagline
function initTypewriterEffect() {
    const typedElement = document.getElementById('typed-tagline');
    if (typedElement && typeof Typed !== 'undefined') {
        new Typed('#typed-tagline', {
            strings: [
                'I code through agents, not just lines of code',
                'Building the future with AI and web technologies',
                'Transforming ideas into intelligent systems'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            showCursor: true,
            cursorChar: '|'
        });
    }
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('translate-x-full');
        });
        
        // Close mobile menu when clicking on links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                mobileMenu.classList.add('translate-x-full');
            }
        });
    }
}

// Contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);
            
            // Validate form
            if (validateContactForm(data)) {
                // Simulate form submission
                submitContactForm(data)
                    .then(() => {
                        showMessage(successMessage);
                        contactForm.reset();
                    })
                    .catch(() => {
                        showMessage(errorMessage);
                    });
            } else {
                showMessage(errorMessage);
            }
        });
        
        // Add input animations
        const inputs = contactForm.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.style.transform = 'scale(1)';
            });
        });
    }
}

// Input sanitization
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Form validation with security checks
let lastSubmissionTime = 0;
const RATE_LIMIT_MS = 60000; // 1 minute

function validateContactForm(data) {
    // Better email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Honeypot check - if website field is filled, it's a bot
    if (data.website) {
        console.warn('Bot detected via honeypot');
        return false;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastSubmissionTime < RATE_LIMIT_MS) {
        console.warn('Rate limit exceeded');
        return false;
    }

    // Sanitize all inputs
    data.name = sanitizeInput(data.name || '');
    data.email = sanitizeInput(data.email || '');
    data.subject = sanitizeInput(data.subject || '');
    data.message = sanitizeInput(data.message || '');

    // Validate name
    if (!data.name || data.name.trim().length < 2 || data.name.length > 100) {
        return false;
    }

    // Validate email
    if (!data.email || !emailRegex.test(data.email)) {
        return false;
    }

    // Validate subject
    if (!data.subject || data.subject.trim().length < 3 || data.subject.length > 200) {
        return false;
    }

    // Validate message
    if (!data.message || data.message.trim().length < 10 || data.message.length > 5000) {
        return false;
    }

    // Validate budget if provided
    if (data.budget) {
        const validBudgets = ['under-5k', '5k-15k', '15k-50k', '50k-plus', 'discuss', ''];
        if (!validBudgets.includes(data.budget)) {
            return false;
        }
    }

    // Update last submission time
    lastSubmissionTime = now;

    return true;
}

// Submit form via EmailJS
function submitContactForm(data) {
    return new Promise((resolve, reject) => {
        // EmailJS configuration
        const serviceID = 'service_zhabk3t';
        const templateID = 'template_fmyj74w';

        // Prepare template parameters
        const templateParams = {
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            budget: data.budget || 'Not specified'
        };

        // Send email via EmailJS
        emailjs.send(serviceID, templateID, templateParams)
            .then((response) => {
                console.log('Email sent successfully!', response.status, response.text);
                resolve({ success: true, data });
            })
            .catch((error) => {
                console.error('Failed to send email:', error);
                reject(error);
            });
    });
}

// Show message function
function showMessage(messageElement) {
    if (messageElement) {
        messageElement.classList.add('show');
        setTimeout(() => {
            messageElement.classList.remove('show');
        }, 5000);
    }
}

// Blog filters functionality
function initBlogFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const blogCards = document.querySelectorAll('.blog-card');
    const searchInput = document.getElementById('search-input');
    
    // Filter button functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter cards
            const filter = button.dataset.filter;
            filterBlogCards(filter, searchInput ? searchInput.value : '');
        });
    });
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            filterBlogCards(activeFilter, e.target.value);
        });
    }
}

// Filter blog cards
function filterBlogCards(filter, searchTerm) {
    const blogCards = document.querySelectorAll('.blog-card');
    
    blogCards.forEach(card => {
        const category = card.dataset.category;
        const title = card.querySelector('h3').textContent.toLowerCase();
        const excerpt = card.querySelector('.blog-excerpt').textContent.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        const matchesFilter = filter === 'all' || category === filter;
        const matchesSearch = searchTerm === '' || 
                            title.includes(searchLower) || 
                            excerpt.includes(searchLower);
        
        if (matchesFilter && matchesSearch) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
            }, 100);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 100;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects for background elements
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.text-layer, .shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            if (element.classList.contains('text-layer')) {
                element.style.transform = `translateY(${rate * 0.3}px)`;
            } else {
                element.style.transform = `translateY(${rate * 0.2}px) rotate(${scrolled * 0.1}deg)`;
            }
        });
    });
}

// Enhanced hover effects for project cards
function initProjectCardEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            // Add subtle tilt effect
            this.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(5deg) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
        
        // Add mouse move effect
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
    });
}

// Timeline animation for about page
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach((item, index) => {
        item.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                translateX: 20,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
        
        item.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                translateX: 0,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });
}

// Form input animations
function initFormAnimations() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            anime({
                targets: this,
                scale: 1.02,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
        
        input.addEventListener('blur', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
    });
}

// Button hover effects
function initButtonEffects() {
    const buttons = document.querySelectorAll('.submit-btn, .social-link, .filter-btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
    });
}

// Initialize additional effects when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initProjectCardEffects();
    initTimelineAnimations();
    initFormAnimations();
    initButtonEffects();
});

// Performance optimization: Throttle scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Apply throttling to scroll events
window.addEventListener('scroll', throttle(function() {
    // Scroll-based animations here
}, 16)); // ~60fps

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'resources/hero-portrait.jpg',
        'resources/project-1.jpg',
        'resources/project-2.jpg',
        'resources/project-3.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize image preloading
preloadImages();

// Error handling for missing elements
window.addEventListener('error', function(e) {
    console.warn('Portfolio website error:', e.error);
});

// Console message for developers
console.log('%c👋 Hello, fellow developer!', 'color: #ffffff; background: #000000; padding: 10px; font-size: 16px; font-weight: bold;');
console.log('%cThis portfolio was built with modern web technologies and AI-assisted development.', 'color: #666666; font-size: 14px;');
console.log('%cInterested in the code? Check out the GitHub repository!', 'color: #666666; font-size: 14px;');