/* WebJugad Labs — Interactive JavaScript */

(function () {
  'use strict';

  /* ---- Navbar Scroll State ---- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });

  /* ---- Mobile Menu ---- */
  const hamburger = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = mobileNav.querySelectorAll('a');

  function toggleMobileMenu() {
    const isOpen = mobileNav.classList.contains('open');
    mobileNav.classList.toggle('open', !isOpen);
    hamburger.classList.toggle('active', !isOpen);
    hamburger.setAttribute('aria-expanded', String(!isOpen));
    document.body.style.overflow = isOpen ? '' : 'hidden';
  }

  function closeMobileMenu() {
    mobileNav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggleMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* ---- Scroll Reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ---- Particle Canvas ---- */
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animFrame;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) {
    return a + Math.random() * (b - a);
  }

  function createParticle() {
    const colors = [
      'rgba(124, 58, 237, 0.7)',
      'rgba(6, 182, 212, 0.7)',
      'rgba(167, 139, 250, 0.5)',
      'rgba(103, 232, 249, 0.5)',
      'rgba(192, 38, 211, 0.5)',
    ];
    return {
      x: randomBetween(0, canvas.width),
      y: randomBetween(0, canvas.height),
      vx: randomBetween(-0.3, 0.3),
      vy: randomBetween(-0.5, -0.1),
      size: randomBetween(1, 3),
      opacity: randomBetween(0.3, 0.9),
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      maxLife: randomBetween(120, 300),
    };
  }

  function initParticles() {
    particles = [];
    for (let i = 0; i < 60; i++) {
      const p = createParticle();
      p.life = randomBetween(0, p.maxLife); // stagger initial positions
      particles.push(p);
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function (p, i) {
      p.life++;
      if (p.life >= p.maxLife) {
        particles[i] = createParticle();
        return;
      }

      const lifeFraction = p.life / p.maxLife;
      const alpha = p.opacity * Math.sin(lifeFraction * Math.PI);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
    });

    animFrame = requestAnimationFrame(drawParticles);
  }

  // Only run particles on hero section viewport
  const heroSection = document.getElementById('hero');
  let particlesRunning = false;

  const heroObserver = new IntersectionObserver(
    function (entries) {
      if (entries[0].isIntersecting) {
        if (!particlesRunning) {
          particlesRunning = true;
          resizeCanvas();
          initParticles();
          drawParticles();
        }
      } else {
        if (particlesRunning) {
          cancelAnimationFrame(animFrame);
          particlesRunning = false;
        }
      }
    },
    { threshold: 0.01 }
  );

  heroObserver.observe(heroSection);

  window.addEventListener('resize', function () {
    if (particlesRunning) {
      resizeCanvas();
      initParticles();
    }
  }, { passive: true });

  /* ---- Portfolio Filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const filter = btn.getAttribute('data-filter');

      // Update button states
      filterBtns.forEach(function (b) {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter items
      portfolioItems.forEach(function (item) {
        const category = item.getAttribute('data-category');
        const show = filter === 'all' || category === filter;

        if (show) {
          item.style.display = '';
          setTimeout(function () {
            item.style.opacity = '1';
            item.style.transform = '';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(function () {
            item.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // Add transition to portfolio items
  portfolioItems.forEach(function (item) {
    item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  });

  /* ---- Contact Form Submission ---- */

  const contactForm = document.getElementById("contact-form");
  const submitBtn = document.getElementById("form-submit-btn");
  const formSuccess = document.getElementById("form-success"); // optional if you still use it
  const status = document.getElementById("form-status");

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("form-name").value.trim();
    const email = document.getElementById("form-email").value.trim();
    const service = document.getElementById("form-service").value;
    const message = document.getElementById("form-message").value.trim();
    if (!name || !email || !service || !message) {
      shakeForm();
      return;
    }
    if (!isValidEmail(email)) {
      document.getElementById("form-email").focus();
      shakeForm();
      return;
    }
    const status = document.getElementById("form-status");
    status.className = "form-status";
    status.innerHTML = "";

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <i data-lucide="loader-circle"></i>';
    lucide.createIcons();

    const formData = new FormData(contactForm);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        contactForm.reset();
        status.className = "form-status success";
        status.innerHTML = `
        <i data-lucide="circle-check-big"></i>
        Thank you! Your message has been sent successfully.
      `;
      } else {
        status.className = "form-status error";
        status.innerHTML = `
        <i data-lucide="triangle-alert"></i>
        ${result.message || "Unable to send your message."}
      `;
      }
    } catch (error) {
      status.className = "form-status error";
      status.innerHTML = `
      <i data-lucide="triangle-alert"></i>
      Network error. Please try again.
    `;
    }
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Send Message <i data-lucide="mail"></i>';
    lucide.createIcons();
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function shakeForm() {
    const formWrap = document.querySelector('.contact-form-wrap');
    formWrap.style.animation = 'none';
    formWrap.offsetHeight; // reflow
    formWrap.style.animation = 'shake 0.4s ease';
    setTimeout(function () {
      formWrap.style.animation = '';
    }, 500);
  }

  /* ---- Shake Keyframe (injected dynamically) ---- */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }
  `;
  document.head.appendChild(style);

  /* ---- Smooth scroll for nav links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Active Nav Highlight ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinkEls.forEach(function (link) {
            const href = link.getAttribute('href');
            link.style.color = href === '#' + id ? 'var(--text-primary)' : '';
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* ---- Service Card keyboard accessibility ---- */
  document.querySelectorAll('.service-card').forEach(function (card) {
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Navigate to contact section on activation
        document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---- Cursor Glow Effect (desktop only) ---- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      background: radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease;
      will-change: transform;
    `;
    document.body.appendChild(glow);

    let mouseX = -1000, mouseY = -1000;
    let glowX = -1000, glowY = -1000;

    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.1;
      glowY += (mouseY - glowY) * 0.1;
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }

  /* ---- Console Easter Egg ---- */
  console.log(
    '%c⚡ WebJugad Labs',
    'font-size: 20px; font-weight: bold; color: #7c3aed;'
  );
  console.log(
    '%cBuilt with ❤️ · hello@webjugadlabs.com',
    'font-size: 12px; color: #06b6d4;'
  );

})();
