/**
 * Ben Squire — Portfolio Script
 * Features:
 *  - Custom cursor with hover/click states
 *  - Navbar scroll behaviour (glassmorphism on scroll)
 *  - Active nav link highlighting on scroll
 *  - Theme toggle (dark ↔ light, persisted in localStorage)
 *  - Typewriter cycling through roles
 *  - Scroll-reveal via IntersectionObserver
 *  - Smooth scroll polyfill for older browsers
 *  - Project card subtle 3-D tilt on mouse-move
 */

'use strict';

/* ══════════════════════════════════════
   UTILITIES
══════════════════════════════════════ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
(function initCursor() {
  const cursor = $('#cursor');
  if (!cursor) return;

  // Only show on fine-pointer devices
  if (!window.matchMedia('(pointer: fine)').matches) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let currentX = 0, currentY = 0;
  let raf;

  // Smooth lerp following
  function lerp(a, b, t) { return a + (b - a) * t; }

  function moveCursor() {
    currentX = lerp(currentX, mouseX, 0.18);
    currentY = lerp(currentY, mouseY, 0.18);
    cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
    raf = requestAnimationFrame(moveCursor);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!raf) moveCursor();
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });

  // Hover state on interactive elements
  const hoverTargets = 'a, button, [data-tilt], .skill-tag, .stack-tag, .tag';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.add('is-hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) {
      cursor.classList.remove('is-hovering');
    }
  });

  // Click state
  document.addEventListener('mousedown', () => cursor.classList.add('is-clicking'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('is-clicking'));
})();

/* ══════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════ */
(function initTheme() {
  const html   = document.documentElement;
  const toggle = $('#themeToggle');
  if (!toggle) return;

  // Restore persisted preference, then check system preference
  const stored = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored ?? (systemDark ? 'dark' : 'light');

  html.setAttribute('data-theme', initial);

  toggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();

/* ══════════════════════════════════════
   NAVBAR — scroll glass + active links
══════════════════════════════════════ */
(function initNav() {
  const nav   = $('#nav');
  const links = $$('.nav-link');
  if (!nav) return;

  // Scrolled state
  function onScroll() {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
    updateActiveLink();
  }

  // Highlight nav link whose section is in view
  function updateActiveLink() {
    const sections = links.map(l => document.querySelector(l.getAttribute('href')));
    let current = null;

    sections.forEach(sec => {
      if (!sec) return;
      const top = sec.getBoundingClientRect().top;
      if (top <= 120) current = sec.id;
    });

    links.forEach(l => {
      l.classList.toggle('is-active', l.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   TYPEWRITER — cycles through roles
══════════════════════════════════════ */
(function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  // ✏️ CUSTOMIZE: Edit these roles to match your profile
  const roles = [
    'build software',
    'solve hard problems',
    'ship products fast',
    'craft interfaces',
    'architect systems',
    'write clean code',
  ];

  let roleIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;
  let isPaused   = false;

  const TYPING_SPEED   = 80;
  const DELETING_SPEED = 45;
  const PAUSE_AFTER    = 1800;
  const PAUSE_BEFORE   = 400;

  function type() {
    const current = roles[roleIndex];

    if (isPaused) {
      isPaused = false;
      setTimeout(type, PAUSE_BEFORE);
      return;
    }

    if (!isDeleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // Finished typing — pause then start deleting
        setTimeout(() => { isDeleting = true; type(); }, PAUSE_AFTER);
        return;
      }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        isPaused   = true;
        roleIndex  = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
  }

  // Small delay before starting so the hero animation has time to play
  setTimeout(type, 1200);
})();

/* ══════════════════════════════════════
   SCROLL REVEAL — IntersectionObserver
══════════════════════════════════════ */
(function initScrollReveal() {
  // Trigger hero elements immediately (they use CSS animation delays)
  $$('.reveal-up').forEach(el => {
    el.classList.add('is-visible');
  });

  // Observe section elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px',
  });

  $$('.reveal-element').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════
   STAGGERED CHILDREN — auto delay
══════════════════════════════════════ */
(function initStaggered() {
  // Give list-of-cards a staggered reveal delay
  const groups = [
    '.timeline',
    '.projects-grid',
    '.about-stats',
    '.skills-grid',
  ];

  groups.forEach(selector => {
    const container = $(selector);
    if (!container) return;

    const children = $$('.reveal-element', container);
    children.forEach((child, i) => {
      child.style.transitionDelay = `${i * 0.1}s`;
    });
  });
})();

/* ══════════════════════════════════════
   PROJECT CARD — subtle 3-D tilt
══════════════════════════════════════ */
(function initTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  $$('.project-card').forEach(card => {
    const TILT_MAX = 8; // degrees

    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotateY =  dx * TILT_MAX;
      const rotateX = -dy * TILT_MAX;

      card.style.transform = `
        perspective(800px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(-5px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.38s, box-shadow 0.38s';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, border-color 0.38s, box-shadow 0.38s';
    });
  });
})();

/* ══════════════════════════════════════
   SKILL TAGS — staggered entrance
══════════════════════════════════════ */
(function initSkillTags() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tags = $$('.skill-tag', entry.target);
      tags.forEach((tag, i) => {
        tag.style.transitionDelay = `${i * 0.04}s`;
        tag.style.opacity = '1';
        tag.style.transform = 'translateY(0)';
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  // Set initial hidden state
  $$('.skill-group').forEach(group => {
    $$('.skill-tag', group).forEach(tag => {
      tag.style.opacity = '0';
      tag.style.transform = 'translateY(10px)';
      tag.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out';
    });
    observer.observe(group);
  });
})();

/* ══════════════════════════════════════
   PARALLAX — hero orbs on scroll
══════════════════════════════════════ */
(function initParallax() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const orbs = $$('.orb');
  const speeds = [0.04, -0.06, 0.08];

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    orbs.forEach((orb, i) => {
      orb.style.transform = `translateY(${y * speeds[i]}px)`;
    });
  }, { passive: true });
})();

/* ══════════════════════════════════════
   SMOOTH SCROLL — nav links
══════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
