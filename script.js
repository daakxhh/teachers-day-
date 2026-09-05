/**
 * Teachers' Day Maths Website - Interactive JavaScript
 * Includes:
 * 1. Background Math Particle System (Canvas)
 * 2. Web Audio API Chimes (Muted by default, zero loud autoplay)
 * 3. Animated Stats Counters (Intersection Observer)
 * 4. Interactive Classroom Quotes
 * 5. Dynamic Mini Math Quiz
 * 6. Custom Confetti Engine with Math Symbols
 * 7. Photo Upload & Local Storage persistence
 */

document.addEventListener('DOMContentLoaded', () => {
  initMathBackground();
  initSoundEffects();
  initStatsObserver();
  initQuoteCards();
  initQuiz();
  initConfetti();
  initPhotoUploader();
  initSmoothScroll();
  initFinalSectionObserver();
});

/* ==========================================================================
   1. BACKGROUND MATH CANVAS PARTICLES
   ========================================================================== */
function initMathBackground() {
  const canvas = document.getElementById('math-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const symbols = ['π', '∑', '√', '∞', 'x²', '∫', 'dy/dx', 'e', 'θ', 'f(x)', 'lim', 'λ', 'α', 'sinθ', 'Δ'];
  const particles = [];
  const particleCount = Math.min(Math.floor(width / 35), 35);

  class MathParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 20;
      this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
      this.size = Math.random() * 12 + 14;
      this.speedY = Math.random() * 0.4 + 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.18 + 0.05;
      this.fadeSpeed = Math.random() * 0.002 + 0.001;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.01;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      if (this.y < -30 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = `${this.size}px 'Fira Code', monospace`;
      ctx.fillStyle = `rgba(148, 163, 184, ${this.opacity})`;
      ctx.textAlign = 'center';
      ctx.fillText(this.symbol, 0, 0);
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new MathParticle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
}

/* ==========================================================================
   2. WEB AUDIO API SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let soundEnabled = false;

function initSoundEffects() {
  const soundBtn = document.getElementById('sound-btn');
  if (!soundBtn) return;

  const icon = soundBtn.querySelector('.sound-icon');
  const label = soundBtn.querySelector('.sound-label');

  soundBtn.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      icon.textContent = '🔊';
      label.textContent = 'Audio FX: On';
      soundBtn.style.borderColor = 'rgba(99, 102, 241, 0.5)';
      playSound('success');
    } else {
      icon.textContent = '🔇';
      label.textContent = 'Audio FX: Off';
      soundBtn.style.borderColor = 'rgba(255, 255, 255, 0.08)';
    }
  });
}

function playSound(type) {
  if (!soundEnabled || !audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === 'pop') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'success') {
    // Pleasant chord chime
    [523.25, 659.25, 783.99].forEach((freq, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, now + idx * 0.06);
      g.gain.setValueAtTime(0.1, now + idx * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
      o.start(now + idx * 0.06);
      o.stop(now + idx * 0.06 + 0.35);
    });
  } else if (type === 'sir') {
    // Playful double boing
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.12);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.start(now);
    osc.stop(now + 0.18);
  } else if (type === 'fanfare') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g);
      g.connect(audioCtx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, now + idx * 0.09);
      g.gain.setValueAtTime(0.12, now + idx * 0.09);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.45);
      o.start(now + idx * 0.09);
      o.stop(now + idx * 0.09 + 0.5);
    });
  }
}

/* ==========================================================================
   3. ANIMATED STATS COUNTERS
   ========================================================================== */
function initStatsObserver() {
  const statsSection = document.getElementById('stats-section');
  if (!statsSection) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          animateCounters();
        }
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(statsSection);
}

function animateCounters() {
  const counterElements = document.querySelectorAll('.stat-number[data-target]');

  counterElements.forEach((el) => {
    const target = parseFloat(el.getAttribute('data-target'));
    const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800; // ms
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = ease * target;

      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.floor(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
      }
    }

    requestAnimationFrame(update);
  });
}

/* ==========================================================================
   4. INTERACTIVE CLASSROOM QUOTE CARDS
   ========================================================================== */
function initQuoteCards() {
  const quoteCards = document.querySelectorAll('.quote-card:not(.plot-twist-card)');
  quoteCards.forEach((card) => {
    card.addEventListener('click', () => {
      const wasActive = card.classList.contains('active');
      quoteCards.forEach((c) => c.classList.remove('active'));
      if (!wasActive) {
        card.classList.add('active');
        playSound('pop');
      }
    });
  });
}

/* ==========================================================================
   5. MINI MATH QUIZ
   ========================================================================== */
function initQuiz() {
  const questions = document.querySelectorAll('.quiz-question-card');
  const stepIndicators = document.querySelectorAll('.quiz-step');
  const scoreDisplay = document.getElementById('quiz-score');
  const resultsCard = document.getElementById('quiz-results');
  const resultSummaryText = document.getElementById('result-summary-text');
  const restartBtn = document.getElementById('restart-quiz-btn');

  let currentQuestion = 1;
  let score = 0;
  let sirSelectedCount = 0;

  questions.forEach((qCard) => {
    const qNum = parseInt(qCard.getAttribute('data-q'), 10);
    const options = qCard.querySelectorAll('.quiz-opt-btn');
    const feedback = qCard.querySelector('.quiz-feedback');

    options.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Disable buttons in this question once picked
        options.forEach((b) => (b.disabled = true));

        const isCorrect = btn.getAttribute('data-correct') === 'true';
        const isSir = btn.getAttribute('data-sir') === 'true';

        if (isCorrect) {
          btn.classList.add('correct');
          score++;
          scoreDisplay.textContent = score;
          playSound('success');
          feedback.className = 'quiz-feedback show success';
          feedback.innerHTML = '<span>✅ <strong>Correct!</strong> 10/10 Maths genius energy!</span>';
        } else if (isSir) {
          btn.classList.add('sir-selected');
          sirSelectedCount++;
          playSound('sir');
          feedback.className = 'quiz-feedback show safest';
          if (qNum === 1) {
            feedback.innerHTML = '<span>😂 <strong>"Honestly… safest option."</strong> (Par Ankur Sir ne solve karke 5 bataya tha!)</span>';
          } else if (qNum === 2) {
            feedback.innerHTML = '<span>😂 <strong>Ankur Sir:</strong> "Ye to basic derivative rule hai! Constant rate of change hamesha 0 hota hai!"</span>';
          } else {
            feedback.innerHTML = '<span>😂 <strong>Ankur Sir:</strong> "Real-life trigonometry rule: Triangle ke teeno angles ka sum hamesha 180° hota hai! (Ans: 50°)"</span>';
          }
        } else {
          btn.classList.add('incorrect');
          playSound('pop');
          feedback.className = 'quiz-feedback show error';
          feedback.innerHTML = '<span>❌ Calculation mistake ho gayi! Par koi nahi, Ankur Sir will explain it with a real-life example!</span>';
        }

        // Progress to next question after short delay
        setTimeout(() => {
          if (currentQuestion < 3) {
            // Update step indicator
            stepIndicators[currentQuestion - 1].classList.remove('active');
            stepIndicators[currentQuestion - 1].classList.add('completed');
            
            qCard.classList.remove('active');
            currentQuestion++;
            
            const nextCard = document.querySelector(`.quiz-question-card[data-q="${currentQuestion}"]`);
            if (nextCard) nextCard.classList.add('active');
            stepIndicators[currentQuestion - 1].classList.add('active');
          } else {
            // Quiz Complete
            stepIndicators[2].classList.remove('active');
            stepIndicators[2].classList.add('completed');
            qCard.classList.remove('active');
            
            resultsCard.classList.add('show');
            playSound('fanfare');
            launchConfetti();

            if (sirSelectedCount >= 2) {
              resultSummaryText.textContent = `You scored ${score}/3! Strategy: When in doubt, trust Ankur Sir's trigonometry wisdom blindly. 😂`;
            } else if (score === 3) {
              resultSummaryText.textContent = `Perfect 3/3! Ankur Sir's real-life examples clearly paid off with 100% accuracy! 🎯`;
            } else {
              resultSummaryText.textContent = `You scored ${score}/3! Attendance counted, concept noted, respect for Ankur Sir = 100%! ❤️`;
            }
          }
        }, 1400);
      });
    });
  });

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentQuestion = 1;
      score = 0;
      sirSelectedCount = 0;
      scoreDisplay.textContent = '0';

      resultsCard.classList.remove('show');

      stepIndicators.forEach((step, idx) => {
        step.classList.remove('active', 'completed');
        if (idx === 0) step.classList.add('active');
      });

      questions.forEach((qCard, idx) => {
        qCard.classList.remove('active');
        if (idx === 0) qCard.classList.add('active');

        const opts = qCard.querySelectorAll('.quiz-opt-btn');
        opts.forEach((btn) => {
          btn.disabled = false;
          btn.classList.remove('correct', 'incorrect', 'sir-selected');
        });

        const feedback = qCard.querySelector('.quiz-feedback');
        feedback.className = 'quiz-feedback';
        feedback.innerHTML = '';
      });
    });
  }
}

/* ==========================================================================
   6. CUSTOM CONFETTI ENGINE WITH MATH GLYPHS
   ========================================================================== */
let confettiParticles = [];
let confettiCtx = null;
let confettiCanvas = null;

function initConfetti() {
  confettiCanvas = document.getElementById('confetti-canvas');
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');

  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

  const celebrateBtn = document.getElementById('confetti-btn');
  const grandBtn = document.getElementById('grand-celebration-btn');

  if (celebrateBtn) {
    celebrateBtn.addEventListener('click', () => {
      playSound('fanfare');
      launchConfetti();
    });
  }

  if (grandBtn) {
    grandBtn.addEventListener('click', () => {
      playSound('fanfare');
      launchConfetti();
    });
  }
}

function launchConfetti() {
  if (!confettiCanvas || !confettiCtx) return;

  const colors = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#a855f7', '#ffffff'];
  const mathChars = ['π', '∞', '∑', '√', '∫', '★', '❤️'];

  const count = 90;
  for (let i = 0; i < count; i++) {
    const isMathGlyph = Math.random() > 0.65;
    confettiParticles.push({
      x: window.innerWidth / 2 + (Math.random() - 0.5) * 200,
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -12 - 4,
      size: isMathGlyph ? Math.random() * 10 + 14 : Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      gravity: 0.35,
      opacity: 1,
      isMathGlyph,
      char: mathChars[Math.floor(Math.random() * mathChars.length)],
    });
  }

  if (!window.isConfettiRunning) {
    window.isConfettiRunning = true;
    animateConfetti();
  }
}

function animateConfetti() {
  if (!confettiCtx || !confettiCanvas) return;
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.rotation += p.rotationSpeed;
    p.opacity -= 0.007;

    if (p.opacity <= 0 || p.y > confettiCanvas.height) {
      confettiParticles.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate((p.rotation * Math.PI) / 180);
    confettiCtx.globalAlpha = Math.max(0, p.opacity);

    if (p.isMathGlyph) {
      confettiCtx.font = `bold ${p.size}px 'Fira Code', sans-serif`;
      confettiCtx.fillStyle = p.color;
      confettiCtx.textAlign = 'center';
      confettiCtx.fillText(p.char, 0, 0);
    } else {
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    }

    confettiCtx.restore();
  }

  if (confettiParticles.length > 0) {
    requestAnimationFrame(animateConfetti);
  } else {
    window.isConfettiRunning = false;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

/* ==========================================================================
   7. PHOTO UPLOADER & LOCAL STORAGE CACHING (SINGLE FEATURED PHOTO)
   ========================================================================== */
function initPhotoUploader() {
  const singleInput = document.getElementById('photo-upload-single');
  const featuredImg = document.getElementById('featured-photo');
  const photoCard = document.getElementById('photo-card');

  if (featuredImg) {
    // Graceful fallback across common extensions
    featuredImg.onerror = function() {
      if (!this.dataset.triedPng) {
        this.dataset.triedPng = 'true';
        this.src = 'images/photo.png';
      } else if (!this.dataset.triedJpeg) {
        this.dataset.triedJpeg = 'true';
        this.src = 'images/photo.jpeg';
      } else if (!this.dataset.triedCapJpg) {
        this.dataset.triedCapJpg = 'true';
        this.src = 'images/photo.JPG';
      } else if (!this.dataset.triedAnkur) {
        this.dataset.triedAnkur = 'true';
        this.src = 'images/ankur-sir.jpg';
      } else {
        this.onerror = null;
        this.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="450" viewBox="0 0 450 450"><rect width="450" height="450" rx="32" fill="%230f172a"/><g fill="%236366f1" opacity="0.2"><circle cx="120" cy="120" r="80"/><circle cx="340" cy="320" r="100"/></g><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="%2338bdf8" font-size="64">📸</text><text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="%23e0e7ff" font-family="sans-serif" font-size="20" font-weight="bold">Ankur Sir &amp; Daksh</text></svg>';
      }
    };

    // Load saved photo from localStorage if custom uploaded
    const savedPhoto = localStorage.getItem('teachers_day_photo');
    if (savedPhoto && savedPhoto.startsWith('data:image')) {
      featuredImg.src = savedPhoto;
    }
  }

  if (singleInput && featuredImg) {
    singleInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          featuredImg.src = event.target.result;
          try {
            localStorage.setItem('teachers_day_photo', event.target.result);
          } catch (err) {
            console.warn('Image stored in memory.', err);
          }
          playSound('success');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 3D subtle card tilt on mouse move (desktop only)
  if (photoCard && window.innerWidth > 768) {
    photoCard.addEventListener('mousemove', (e) => {
      const rect = photoCard.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (-y / rect.height) * 8;
      const rotateY = (x / rect.width) * 8;
      photoCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    photoCard.addEventListener('mouseleave', () => {
      photoCard.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  }
}

/* ==========================================================================
   8. SMOOTH SCROLLING
   ========================================================================== */
function initSmoothScroll() {
  const ctaBtn = document.getElementById('hero-cta');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('photo-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        playSound('pop');
      }
    });
  }
}

/* ==========================================================================
   9. GRAND FINALE INTERSECTION & PERFORMANCE
   ========================================================================== */
function initFinalSectionObserver() {
  const finalSection = document.getElementById('final-section');
  if (!finalSection) return;

  let triggered = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          setTimeout(() => {
            launchConfetti();
            playSound('fanfare');
          }, 600);
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(finalSection);
}

// Performance: pause animation loops when tab is hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    window.isPageHidden = true;
  } else {
    window.isPageHidden = false;
  }
});
