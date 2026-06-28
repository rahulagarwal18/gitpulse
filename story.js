/**
 * GitPulse — Cinematic Story Transitions
 * Handles GSAP animations, slides progression, and interactive counters
 */

class StoryController {
    constructor() {
        this.slides = document.querySelectorAll('.slide-item');
        this.prevBtn = document.getElementById('prevSlide');
        this.nextBtn = document.getElementById('nextSlide');
        this.progressBar = document.getElementById('storyProgressBar');
        this.indicatorsContainer = document.getElementById('slideIndicators');
        this.exitBtn = document.getElementById('exitStory');
        
        this.currentIndex = 0;
        this.totalSlides = this.slides.length;
        this.isTransitioning = false;
        
        this.initEventListeners();
    }

    setupIndicators() {
        // Clear previous indicators
        this.indicatorsContainer.innerHTML = '';
        
        // Add new dots
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
            dot.dataset.index = i;
            dot.addEventListener('click', () => this.goToSlide(i));
            this.indicatorsContainer.appendChild(dot);
        }
        
        this.updateControls();
    }

    initEventListeners() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        this.exitBtn.addEventListener('click', () => {
            // Return to landing page
            gsap.to('#storyView', {
                opacity: 0,
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                    document.getElementById('storyView').classList.remove('active');
                    const landing = document.getElementById('landingView');
                    landing.classList.add('active');
                    gsap.fromTo(landing, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.8 });
                }
            });
        });

        // Key navigation
        window.addEventListener('keydown', (e) => {
            if (!document.getElementById('storyView').classList.contains('active')) return;
            if (e.key === 'ArrowRight' || e.key === ' ') {
                this.next();
            } else if (e.key === 'ArrowLeft') {
                this.prev();
            } else if (e.key === 'Escape') {
                this.exitBtn.click();
            }
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides || index === this.currentIndex) return;
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        const currentSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];
        
        // Trigger particle burst on slide switch
        if (window.triggerCanvasBurst) {
            window.triggerCanvasBurst(null, null, 15);
        }

        // Animate Out Current
        const tlOut = gsap.timeline();
        tlOut.to(currentSlide.querySelectorAll('.slide-badge, .slide-title, .dev-name, .dev-username, .dev-bio, .meta-row, .stats-grid, .repos-wrapper, .summary-details, .summary-stats-box, .chart-col, .legend-item'), {
            opacity: 0,
            y: -15,
            stagger: 0.03,
            duration: 0.4,
            ease: 'power2.in'
        });
        tlOut.to(currentSlide, {
            opacity: 0,
            scale: 0.96,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: () => {
                currentSlide.classList.remove('active');
                nextSlide.classList.add('active');
                
                // Animate In Next
                const tlIn = gsap.timeline({
                    onComplete: () => {
                        this.isTransitioning = false;
                    }
                });
                tlIn.fromTo(nextSlide, 
                    { opacity: 0, scale: 0.98, y: 10 },
                    { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                );

                // Target children animations specifically inside next slide
                const elements = nextSlide.querySelectorAll('.slide-badge, .slide-title, .dev-name, .dev-username, .dev-bio, .meta-row, .avatar-glow-ring, .stats-grid > *, .repos-wrapper > *, .summary-details > *, .summary-stats-box, .chart-col, .legend-item');
                
                tlIn.fromTo(elements,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' }
                );

                // Specific Slide Triggers (Only for Single Explorer mode)
                const isDuel = document.getElementById('duelSlidesDeck')?.style.display === 'block';
                if (!isDuel) {
                    if (index === 1) { // Stats counter
                        this.animateCounters(nextSlide);
                    } else if (index === 2) { // Languages
                        if (window.renderLanguagesChart) {
                            window.renderLanguagesChart();
                        }
                    } else if (index === 4) { // Summary Assessment
                        this.animateGradeProgress(nextSlide);
                    }
                }
            }
        });

        this.currentIndex = index;
        this.updateControls();
    }

    animateCounters(slide) {
        const counters = slide.querySelectorAll('.stat-value');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target || '0', 10);
            if (isNaN(target)) return;
            
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target,
                duration: 1.5,
                ease: 'power3.out',
                onUpdate: () => {
                    counter.innerText = Math.floor(obj.val).toLocaleString();
                }
            });
        });
    }

    animateGradeProgress(slide) {
        const gradeText = slide.querySelector('.grade-val');
        const targetText = gradeText.dataset.grade || 'A+';
        
        gsap.fromTo(slide.querySelector('.grade-circle'),
            { scale: 0.8, rotate: -15, opacity: 0 },
            { scale: 1, rotate: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        }
    }

    next() {
        if (this.currentIndex < this.totalSlides - 1) {
            this.goToSlide(this.currentIndex + 1);
        }
    }

    updateControls() {
        // Buttons state
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
        
        // Progress bar percentage
        const pct = (this.currentIndex / (this.totalSlides - 1)) * 100;
        this.progressBar.style.width = `${pct}%`;
        
        // Indicators active class
        const dots = this.indicatorsContainer.querySelectorAll('.indicator-dot');
        dots.forEach((dot, i) => {
            if (i === this.currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    reset() {
        // Dynamically bind to the active slide deck
        const duelDeck = document.getElementById('duelSlidesDeck');
        if (duelDeck && duelDeck.style.display === 'block') {
            this.slides = document.querySelectorAll('#duelSlidesDeck .slide-item');
        } else {
            this.slides = document.querySelectorAll('#singleSlidesDeck .slide-item');
        }
        this.totalSlides = this.slides.length;

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.slides.forEach((slide, i) => {
            if (i === 0) {
                slide.classList.add('active');
                slide.style.opacity = 1;
                slide.style.transform = 'scale(1)';
            } else {
                slide.classList.remove('active');
                slide.style.opacity = 0;
                slide.style.transform = 'scale(0.96)';
            }
        });
        this.setupIndicators();
        
        // Animate first slide elements
        const activeSlide = this.slides[0];
        gsap.fromTo(activeSlide.querySelectorAll('.slide-badge, .avatar-glow-ring, .dev-name, .dev-username, .dev-bio, .meta-row'),
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, stagger: 0.06, duration: 0.8, ease: 'power3.out' }
        );
    }
}

// Global hook
window.StoryPlayer = new StoryController();
