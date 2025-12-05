/**
 * Fashion Forward Landing Page - Category Navigation JavaScript
 * 
 * Handles category card interactions, scroll animations, keyboard navigation,
 * and analytics tracking preparation for the product category section.
 * 
 * @generated-from: task-id:TASK-003
 * @modifies: none
 * @dependencies: []
 */

(function() {
  'use strict';

  // State management
  const state = {
    isInitialized: false,
    observer: null,
    focusedCardIndex: -1,
    categoryCards: [],
    animationQueue: new Set(),
    clickTracking: []
  };

  // Configuration
  const config = {
    observerOptions: {
      root: null,
      rootMargin: '-50px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    },
    animationDelay: 100,
    hoverTransitionDuration: 300,
    maxClickTrackingEntries: 100
  };

  // DOM element cache
  const elements = {
    categoriesSection: null,
    categoryCards: null,
    categoryImages: null
  };

  /**
   * Initialize category navigation functionality
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[Categories] Already initialized');
      return;
    }

    try {
      if (!cacheElements()) {
        console.warn('[Categories] Required elements not found, skipping initialization');
        return;
      }

      setupIntersectionObserver();
      setupKeyboardNavigation();
      setupClickTracking();
      setupHoverEffects();
      setupImageLoadHandling();
      
      state.isInitialized = true;
      console.info('[Categories] Category navigation initialized successfully');
    } catch (error) {
      console.error('[Categories] Initialization failed:', error);
      cleanup();
    }
  }

  /**
   * Cache DOM elements for performance
   * @returns {boolean} True if required elements found
   */
  function cacheElements() {
    elements.categoriesSection = document.querySelector('#categories');
    
    if (!elements.categoriesSection) {
      return false;
    }

    elements.categoryCards = elements.categoriesSection.querySelectorAll('[data-category-card]');
    elements.categoryImages = elements.categoriesSection.querySelectorAll('[data-category-image]');

    if (elements.categoryCards.length === 0) {
      console.warn('[Categories] No category cards found');
      return false;
    }

    // Convert NodeList to Array for easier manipulation
    state.categoryCards = Array.from(elements.categoryCards);

    console.debug('[Categories] Cached', state.categoryCards.length, 'category cards');
    return true;
  }

  /**
   * Setup Intersection Observer for scroll animations
   */
  function setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[Categories] IntersectionObserver not supported, skipping animations');
      // Fallback: show all cards immediately
      state.categoryCards.forEach(function(card) {
        card.classList.add('is-visible');
      });
      return;
    }

    try {
      state.observer = new IntersectionObserver(
        handleIntersection,
        config.observerOptions
      );

      // Observe each category card
      state.categoryCards.forEach(function(card, index) {
        // Add data attribute for animation delay
        card.setAttribute('data-animation-index', index);
        state.observer.observe(card);
      });

      console.debug('[Categories] Intersection observer setup complete');
    } catch (error) {
      console.error('[Categories] Failed to setup intersection observer:', error);
      // Fallback: show all cards
      state.categoryCards.forEach(function(card) {
        card.classList.add('is-visible');
      });
    }
  }

  /**
   * Handle intersection observer callback
   * @param {IntersectionObserverEntry[]} entries - Observed entries
   */
  function handleIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.25) {
        const card = entry.target;
        const animationIndex = parseInt(card.getAttribute('data-animation-index'), 10);

        // Prevent duplicate animations
        if (state.animationQueue.has(card)) {
          return;
        }

        state.animationQueue.add(card);

        // Stagger animation based on card index
        const delay = animationIndex * config.animationDelay;

        setTimeout(function() {
          try {
            card.classList.add('is-visible');
            state.animationQueue.delete(card);
            
            console.debug('[Categories] Card animated:', {
              category: card.getAttribute('data-category-card'),
              delay: delay,
              ratio: entry.intersectionRatio
            });
          } catch (error) {
            console.error('[Categories] Animation error:', error);
            state.animationQueue.delete(card);
          }
        }, delay);

        // Unobserve after animation to improve performance
        if (state.observer) {
          state.observer.unobserve(card);
        }
      }
    });
  }

  /**
   * Setup keyboard navigation for category cards
   */
  function setupKeyboardNavigation() {
    if (state.categoryCards.length === 0) {
      return;
    }

    // Make cards focusable
    state.categoryCards.forEach(function(card, index) {
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', generateAriaLabel(card));

      // Add keyboard event listeners
      card.addEventListener('keydown', function(event) {
        handleCardKeydown(event, index);
      });

      card.addEventListener('focus', function() {
        handleCardFocus(index);
      });

      card.addEventListener('blur', function() {
        handleCardBlur();
      });
    });

    console.debug('[Categories] Keyboard navigation enabled');
  }

  /**
   * Generate accessible ARIA label for card
   * @param {HTMLElement} card - Category card element
   * @returns {string} ARIA label
   */
  function generateAriaLabel(card) {
    const category = card.getAttribute('data-category-card') || 'category';
    const title = card.querySelector('h3');
    const description = card.querySelector('p');

    let label = 'Navigate to ' + category;
    
    if (title) {
      label += ': ' + title.textContent.trim();
    }
    
    if (description) {
      label += '. ' + description.textContent.trim();
    }

    return label;
  }

  /**
   * Handle keyboard navigation on category cards
   * @param {KeyboardEvent} event - Keyboard event
   * @param {number} currentIndex - Current card index
   */
  function handleCardKeydown(event, currentIndex) {
    const key = event.key;
    let handled = false;

    try {
      switch (key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          handleCardActivation(state.categoryCards[currentIndex]);
          handled = true;
          break;

        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          focusNextCard(currentIndex);
          handled = true;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          focusPreviousCard(currentIndex);
          handled = true;
          break;

        case 'Home':
          event.preventDefault();
          focusCard(0);
          handled = true;
          break;

        case 'End':
          event.preventDefault();
          focusCard(state.categoryCards.length - 1);
          handled = true;
          break;
      }

      if (handled) {
        console.debug('[Categories] Keyboard navigation:', {
          key: key,
          fromIndex: currentIndex,
          toIndex: state.focusedCardIndex
        });
      }
    } catch (error) {
      console.error('[Categories] Keyboard navigation error:', error);
    }
  }

  /**
   * Focus next category card
   * @param {number} currentIndex - Current card index
   */
  function focusNextCard(currentIndex) {
    const nextIndex = (currentIndex + 1) % state.categoryCards.length;
    focusCard(nextIndex);
  }

  /**
   * Focus previous category card
   * @param {number} currentIndex - Current card index
   */
  function focusPreviousCard(currentIndex) {
    const prevIndex = currentIndex === 0 
      ? state.categoryCards.length - 1 
      : currentIndex - 1;
    focusCard(prevIndex);
  }

  /**
   * Focus specific category card
   * @param {number} index - Card index to focus
   */
  function focusCard(index) {
    if (index < 0 || index >= state.categoryCards.length) {
      console.warn('[Categories] Invalid card index:', index);
      return;
    }

    try {
      state.categoryCards[index].focus();
      state.focusedCardIndex = index;
    } catch (error) {
      console.error('[Categories] Focus error:', error);
    }
  }

  /**
   * Handle card focus event
   * @param {number} index - Card index
   */
  function handleCardFocus(index) {
    state.focusedCardIndex = index;
    console.debug('[Categories] Card focused:', index);
  }

  /**
   * Handle card blur event
   */
  function handleCardBlur() {
    state.focusedCardIndex = -1;
  }

  /**
   * Handle card activation (click or keyboard)
   * @param {HTMLElement} card - Category card element
   */
  function handleCardActivation(card) {
    const category = card.getAttribute('data-category-card');
    const link = card.querySelector('a');

    if (link) {
      // Track click before navigation
      trackCategoryClick(category, 'keyboard');
      
      // Trigger link click
      link.click();
    } else {
      console.warn('[Categories] No link found in card:', category);
    }
  }

  /**
   * Setup click tracking for analytics preparation
   */
  function setupClickTracking() {
    state.categoryCards.forEach(function(card) {
      card.addEventListener('click', function(event) {
        const category = card.getAttribute('data-category-card');
        const isKeyboard = event.detail === 0;
        
        trackCategoryClick(category, isKeyboard ? 'keyboard' : 'mouse');
      });
    });

    console.debug('[Categories] Click tracking enabled');
  }

  /**
   * Track category click for analytics
   * @param {string} category - Category name
   * @param {string} interactionType - Type of interaction (mouse/keyboard)
   */
  function trackCategoryClick(category, interactionType) {
    const clickData = {
      category: category,
      interactionType: interactionType,
      timestamp: new Date().toISOString(),
      viewportWidth: window.innerWidth,
      scrollPosition: window.pageYOffset
    };

    state.clickTracking.push(clickData);

    // Limit tracking array size
    if (state.clickTracking.length > config.maxClickTrackingEntries) {
      state.clickTracking.shift();
    }

    console.info('[Categories] Click tracked:', clickData);

    // Prepare for future analytics integration
    if (window.dataLayer) {
      try {
        window.dataLayer.push({
          event: 'category_click',
          category: category,
          interactionType: interactionType
        });
      } catch (error) {
        console.error('[Categories] Analytics push failed:', error);
      }
    }
  }

  /**
   * Setup smooth hover effects
   */
  function setupHoverEffects() {
    state.categoryCards.forEach(function(card) {
      let hoverTimeout = null;

      card.addEventListener('mouseenter', function() {
        clearTimeout(hoverTimeout);
        card.classList.add('is-hovered');
      });

      card.addEventListener('mouseleave', function() {
        hoverTimeout = setTimeout(function() {
          card.classList.remove('is-hovered');
        }, config.hoverTransitionDuration);
      });
    });

    console.debug('[Categories] Hover effects enabled');
  }

  /**
   * Setup image load handling for performance monitoring
   */
  function setupImageLoadHandling() {
    if (!elements.categoryImages || elements.categoryImages.length === 0) {
      return;
    }

    elements.categoryImages.forEach(function(img) {
      const category = img.getAttribute('data-category-image');

      // Track load time
      const loadStartTime = performance.now();

      img.addEventListener('load', function() {
        const loadTime = performance.now() - loadStartTime;
        
        console.debug('[Categories] Image loaded:', {
          category: category,
          loadTime: Math.round(loadTime) + 'ms',
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        });

        // Mark image as loaded for CSS transitions
        img.classList.add('is-loaded');
      });

      img.addEventListener('error', function() {
        console.error('[Categories] Image load failed:', {
          category: category,
          src: img.src
        });

        // Add error class for fallback styling
        img.classList.add('has-error');
        
        // Optionally set fallback image
        const fallbackSrc = img.getAttribute('data-fallback-src');
        if (fallbackSrc && img.src !== fallbackSrc) {
          img.src = fallbackSrc;
        }
      });
    });

    console.debug('[Categories] Image load handling enabled');
  }

  /**
   * Get click tracking data for analytics
   * @returns {Array} Click tracking data
   */
  function getClickTrackingData() {
    return state.clickTracking.slice();
  }

  /**
   * Cleanup resources
   */
  function cleanup() {
    if (state.observer) {
      state.observer.disconnect();
      state.observer = null;
    }

    state.animationQueue.clear();
    state.categoryCards = [];
    state.clickTracking = [];
    state.isInitialized = false;

    console.debug('[Categories] Cleanup complete');
  }

  /**
   * Public API for external access
   */
  window.FashionForwardCategories = {
    init: init,
    getClickTrackingData: getClickTrackingData,
    isInitialized: function() {
      return state.isInitialized;
    },
    cleanup: cleanup
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

})();