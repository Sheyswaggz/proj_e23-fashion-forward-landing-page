/**
 * Fashion Forward Landing Page - Main JavaScript
 * 
 * Handles core initialization, mobile navigation, smooth scrolling,
 * and basic form interactions for the landing page.
 * 
 * @generated-from: task-id:TASK-001
 * @modifies: none
 * @dependencies: []
 */

(function() {
  'use strict';

  // State management
  const state = {
    mobileMenuOpen: false,
    isInitialized: false,
    scrollThreshold: 100
  };

  // DOM element cache
  const elements = {
    mobileMenuToggle: null,
    mobileMenu: null,
    navLinks: null,
    body: null,
    header: null
  };

  /**
   * Initialize the application when DOM is ready
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[FashionForward] Already initialized');
      return;
    }

    try {
      cacheElements();
      setupEventListeners();
      setupSmoothScroll();
      setupScrollEffects();
      state.isInitialized = true;
      console.info('[FashionForward] Application initialized successfully');
    } catch (error) {
      console.error('[FashionForward] Initialization failed:', error);
      // Fail gracefully - page should still be usable
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.body = document.body;
    elements.header = document.querySelector('header');
    elements.mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
    elements.mobileMenu = document.querySelector('[data-mobile-menu]');
    elements.navLinks = document.querySelectorAll('a[href^="#"]');

    // Log warnings for missing optional elements
    if (!elements.mobileMenuToggle) {
      console.warn('[FashionForward] Mobile menu toggle not found');
    }
    if (!elements.mobileMenu) {
      console.warn('[FashionForward] Mobile menu not found');
    }
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    // Mobile menu toggle
    if (elements.mobileMenuToggle && elements.mobileMenu) {
      elements.mobileMenuToggle.addEventListener('click', handleMobileMenuToggle);
      
      // Close menu when clicking outside
      document.addEventListener('click', handleOutsideClick);
      
      // Close menu on escape key
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 150);
    });

    // Handle scroll events
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(handleScroll, 100);
    }, { passive: true });
  }

  /**
   * Toggle mobile menu open/closed
   * @param {Event} event - Click event
   */
  function handleMobileMenuToggle(event) {
    event.preventDefault();
    event.stopPropagation();

    state.mobileMenuOpen = !state.mobileMenuOpen;

    try {
      if (state.mobileMenuOpen) {
        openMobileMenu();
      } else {
        closeMobileMenu();
      }
    } catch (error) {
      console.error('[FashionForward] Error toggling mobile menu:', error);
      // Reset state on error
      state.mobileMenuOpen = false;
      closeMobileMenu();
    }
  }

  /**
   * Open mobile menu with proper ARIA attributes
   */
  function openMobileMenu() {
    if (!elements.mobileMenu || !elements.mobileMenuToggle) return;

    elements.mobileMenu.classList.add('is-open');
    elements.mobileMenu.setAttribute('aria-hidden', 'false');
    elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    elements.body.style.overflow = 'hidden';

    console.debug('[FashionForward] Mobile menu opened');
  }

  /**
   * Close mobile menu with proper ARIA attributes
   */
  function closeMobileMenu() {
    if (!elements.mobileMenu || !elements.mobileMenuToggle) return;

    elements.mobileMenu.classList.remove('is-open');
    elements.mobileMenu.setAttribute('aria-hidden', 'true');
    elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    elements.body.style.overflow = '';

    console.debug('[FashionForward] Mobile menu closed');
  }

  /**
   * Handle clicks outside mobile menu
   * @param {Event} event - Click event
   */
  function handleOutsideClick(event) {
    if (!state.mobileMenuOpen) return;
    if (!elements.mobileMenu || !elements.mobileMenuToggle) return;

    const isClickInsideMenu = elements.mobileMenu.contains(event.target);
    const isClickOnToggle = elements.mobileMenuToggle.contains(event.target);

    if (!isClickInsideMenu && !isClickOnToggle) {
      state.mobileMenuOpen = false;
      closeMobileMenu();
    }
  }

  /**
   * Handle escape key to close mobile menu
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleEscapeKey(event) {
    if (event.key === 'Escape' && state.mobileMenuOpen) {
      state.mobileMenuOpen = false;
      closeMobileMenu();
      
      // Return focus to toggle button
      if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.focus();
      }
    }
  }

  /**
   * Handle window resize events
   */
  function handleResize() {
    // Close mobile menu on desktop breakpoint
    const isDesktop = window.innerWidth >= 768;
    
    if (isDesktop && state.mobileMenuOpen) {
      state.mobileMenuOpen = false;
      closeMobileMenu();
    }

    console.debug('[FashionForward] Window resized:', window.innerWidth);
  }

  /**
   * Handle scroll events for header effects
   */
  function handleScroll() {
    if (!elements.header) return;

    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollPosition > state.scrollThreshold) {
      elements.header.classList.add('is-scrolled');
    } else {
      elements.header.classList.remove('is-scrolled');
    }
  }

  /**
   * Setup smooth scrolling for anchor links
   */
  function setupSmoothScroll() {
    if (!elements.navLinks || elements.navLinks.length === 0) {
      console.warn('[FashionForward] No anchor links found for smooth scroll');
      return;
    }

    elements.navLinks.forEach(function(link) {
      link.addEventListener('click', handleSmoothScroll);
    });

    console.debug('[FashionForward] Smooth scroll enabled for', elements.navLinks.length, 'links');
  }

  /**
   * Handle smooth scroll to anchor
   * @param {Event} event - Click event
   */
  function handleSmoothScroll(event) {
    const href = event.currentTarget.getAttribute('href');
    
    if (!href || !href.startsWith('#')) return;

    const targetId = href.substring(1);
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.warn('[FashionForward] Target element not found:', targetId);
      return;
    }

    event.preventDefault();

    // Close mobile menu if open
    if (state.mobileMenuOpen) {
      state.mobileMenuOpen = false;
      closeMobileMenu();
    }

    // Calculate offset for fixed header
    const headerHeight = elements.header ? elements.header.offsetHeight : 0;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

    try {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without triggering navigation
      if (history.pushState) {
        history.pushState(null, null, href);
      }

      // Set focus to target for accessibility
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      targetElement.removeAttribute('tabindex');

      console.debug('[FashionForward] Scrolled to:', targetId);
    } catch (error) {
      console.error('[FashionForward] Smooth scroll failed:', error);
      // Fallback to instant scroll
      window.scrollTo(0, targetPosition);
    }
  }

  /**
   * Setup scroll-based effects and animations
   */
  function setupScrollEffects() {
    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      console.warn('[FashionForward] IntersectionObserver not supported');
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Observe elements with data-animate attribute
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach(function(element) {
      observer.observe(element);
    });

    if (animatedElements.length > 0) {
      console.debug('[FashionForward] Observing', animatedElements.length, 'animated elements');
    }
  }

  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Observed entries
   */
  function handleIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        console.debug('[FashionForward] Element visible:', entry.target);
      }
    });
  }

  /**
   * Public API for external access if needed
   */
  window.FashionForward = {
    init: init,
    closeMobileMenu: function() {
      if (state.mobileMenuOpen) {
        state.mobileMenuOpen = false;
        closeMobileMenu();
      }
    },
    isInitialized: function() {
      return state.isInitialized;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

})();