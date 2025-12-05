/**
 * Fashion Forward Landing Page - Hero Section JavaScript
 * 
 * Handles hero section interactions including smooth scroll for CTA buttons,
 * dynamic text animations on page load, and responsive image loading optimization.
 * 
 * @generated-from: task-id:TASK-002
 * @modifies: none
 * @dependencies: ["js/main.js"]
 */

(function() {
  'use strict';

  // State management
  const state = {
    isInitialized: false,
    animationsComplete: false,
    imageLoaded: false,
    ctaButtons: [],
    heroSection: null
  };

  // Configuration
  const config = {
    animationDelay: 100,
    textAnimationDuration: 800,
    imageLoadTimeout: 5000,
    scrollOffset: 80,
    observerThreshold: 0.2
  };

  // DOM element cache
  const elements = {
    hero: null,
    heroTitle: null,
    heroTagline: null,
    ctaButtons: null,
    heroImage: null,
    heroOverlay: null
  };

  /**
   * Initialize hero section functionality
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[Hero] Already initialized');
      return;
    }

    try {
      cacheElements();
      
      if (!elements.hero) {
        console.warn('[Hero] Hero section not found, skipping initialization');
        return;
      }

      setupImageLoading();
      setupCTAButtons();
      setupTextAnimations();
      setupIntersectionObserver();
      
      state.isInitialized = true;
      console.info('[Hero] Hero section initialized successfully');
    } catch (error) {
      console.error('[Hero] Initialization failed:', error);
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.hero = document.querySelector('.hero');
    elements.heroTitle = document.querySelector('.hero__title');
    elements.heroTagline = document.querySelector('.hero__tagline');
    elements.ctaButtons = document.querySelectorAll('.hero__cta');
    elements.heroImage = document.querySelector('.hero__image');
    elements.heroOverlay = document.querySelector('.hero__overlay');

    if (elements.hero) {
      state.heroSection = elements.hero;
    }
  }

  /**
   * Setup responsive image loading with optimization
   */
  function setupImageLoading() {
    if (!elements.hero) return;

    const heroBackground = window.getComputedStyle(elements.hero).backgroundImage;
    
    if (heroBackground && heroBackground !== 'none') {
      const imageUrl = heroBackground.match(/url\(['"]?([^'"]+)['"]?\)/);
      
      if (imageUrl && imageUrl[1]) {
        preloadImage(imageUrl[1]);
      }
    }

    // Handle responsive image sources if using picture element
    const pictureElement = elements.hero.querySelector('picture');
    if (pictureElement) {
      setupPictureElementLoading(pictureElement);
    }

    // Add loading class for visual feedback
    if (elements.hero && !state.imageLoaded) {
      elements.hero.classList.add('hero--loading');
    }
  }

  /**
   * Preload background image for better performance
   * @param {string} imageUrl - URL of the image to preload
   */
  function preloadImage(imageUrl) {
    const img = new Image();
    let timeoutId;

    const handleImageLoad = function() {
      clearTimeout(timeoutId);
      state.imageLoaded = true;
      
      if (elements.hero) {
        elements.hero.classList.remove('hero--loading');
        elements.hero.classList.add('hero--loaded');
      }
      
      console.debug('[Hero] Background image loaded successfully');
    };

    const handleImageError = function(error) {
      clearTimeout(timeoutId);
      console.error('[Hero] Failed to load background image:', error);
      
      if (elements.hero) {
        elements.hero.classList.remove('hero--loading');
        elements.hero.classList.add('hero--error');
      }
    };

    img.addEventListener('load', handleImageLoad);
    img.addEventListener('error', handleImageError);

    // Set timeout for slow connections
    timeoutId = setTimeout(function() {
      console.warn('[Hero] Image loading timeout exceeded');
      handleImageLoad();
    }, config.imageLoadTimeout);

    img.src = imageUrl;
  }

  /**
   * Setup picture element loading with source selection
   * @param {HTMLPictureElement} pictureElement - Picture element to setup
   */
  function setupPictureElementLoading(pictureElement) {
    const imgElement = pictureElement.querySelector('img');
    
    if (!imgElement) return;

    imgElement.addEventListener('load', function() {
      state.imageLoaded = true;
      
      if (elements.hero) {
        elements.hero.classList.remove('hero--loading');
        elements.hero.classList.add('hero--loaded');
      }
      
      console.debug('[Hero] Picture element loaded successfully');
    });

    imgElement.addEventListener('error', function(error) {
      console.error('[Hero] Picture element failed to load:', error);
      
      if (elements.hero) {
        elements.hero.classList.remove('hero--loading');
        elements.hero.classList.add('hero--error');
      }
    });
  }

  /**
   * Setup CTA button click handlers with smooth scroll
   */
  function setupCTAButtons() {
    if (!elements.ctaButtons || elements.ctaButtons.length === 0) {
      console.warn('[Hero] No CTA buttons found');
      return;
    }

    elements.ctaButtons.forEach(function(button) {
      const targetId = button.getAttribute('data-target');
      
      if (!targetId) {
        console.warn('[Hero] CTA button missing data-target attribute');
        return;
      }

      button.addEventListener('click', function(event) {
        handleCTAClick(event, targetId);
      });

      state.ctaButtons.push(button);
    });

    console.debug('[Hero] Setup', state.ctaButtons.length, 'CTA buttons');
  }

  /**
   * Handle CTA button click with smooth scroll
   * @param {Event} event - Click event
   * @param {string} targetId - ID of target section
   */
  function handleCTAClick(event, targetId) {
    event.preventDefault();

    const targetElement = document.getElementById(targetId);
    
    if (!targetElement) {
      console.warn('[Hero] Target section not found:', targetId);
      return;
    }

    try {
      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const targetPosition = targetElement.getBoundingClientRect().top + 
                           window.pageYOffset - 
                           headerHeight - 
                           config.scrollOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });

      // Update URL without triggering navigation
      if (history.pushState) {
        history.pushState(null, null, '#' + targetId);
      }

      // Set focus for accessibility
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus();
      
      setTimeout(function() {
        targetElement.removeAttribute('tabindex');
      }, 1000);

      console.debug('[Hero] Scrolled to section:', targetId);
    } catch (error) {
      console.error('[Hero] Smooth scroll failed:', error);
      
      // Fallback to instant scroll
      targetElement.scrollIntoView();
    }
  }

  /**
   * Setup text animations on page load
   */
  function setupTextAnimations() {
    if (state.animationsComplete) return;

    // Add initial animation classes
    if (elements.heroTitle) {
      elements.heroTitle.classList.add('hero__title--animate');
    }

    if (elements.heroTagline) {
      elements.heroTagline.classList.add('hero__tagline--animate');
    }

    // Stagger CTA button animations
    if (elements.ctaButtons && elements.ctaButtons.length > 0) {
      elements.ctaButtons.forEach(function(button, index) {
        const delay = config.animationDelay * (index + 1);
        
        setTimeout(function() {
          button.classList.add('hero__cta--animate');
        }, delay);
      });
    }

    // Mark animations as complete after duration
    setTimeout(function() {
      state.animationsComplete = true;
      console.debug('[Hero] Text animations complete');
    }, config.textAnimationDuration);
  }

  /**
   * Setup intersection observer for scroll-based animations
   */
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[Hero] IntersectionObserver not supported');
      triggerAnimationsImmediately();
      return;
    }

    if (!elements.hero) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: config.observerThreshold
    };

    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('hero--visible');
          console.debug('[Hero] Hero section visible in viewport');
          
          // Disconnect after first observation
          observer.disconnect();
        }
      });
    }, observerOptions);

    observer.observe(elements.hero);
  }

  /**
   * Trigger animations immediately as fallback
   */
  function triggerAnimationsImmediately() {
    if (elements.hero) {
      elements.hero.classList.add('hero--visible');
    }
    
    if (elements.heroTitle) {
      elements.heroTitle.classList.add('hero__title--visible');
    }
    
    if (elements.heroTagline) {
      elements.heroTagline.classList.add('hero__tagline--visible');
    }
    
    if (elements.ctaButtons) {
      elements.ctaButtons.forEach(function(button) {
        button.classList.add('hero__cta--visible');
      });
    }
  }

  /**
   * Public API for external access
   */
  window.FashionForwardHero = {
    init: init,
    isInitialized: function() {
      return state.isInitialized;
    },
    scrollToSection: function(targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        handleCTAClick({ preventDefault: function() {} }, targetId);
      }
    },
    getState: function() {
      return {
        initialized: state.isInitialized,
        animationsComplete: state.animationsComplete,
        imageLoaded: state.imageLoaded
      };
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();