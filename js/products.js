/**
 * Fashion Forward Landing Page - Products JavaScript
 * 
 * Handles product showcase interactions including hover animations,
 * category filtering, lazy loading, and engagement tracking.
 * 
 * @generated-from: task-id:TASK-004
 * @modifies: none
 * @dependencies: []
 */

(function() {
  'use strict';

  // State management
  const state = {
    isInitialized: false,
    activeFilter: 'all',
    visibleProducts: new Set(),
    interactionMetrics: {
      cardHovers: 0,
      cardClicks: 0,
      filterChanges: 0,
      imageLoads: 0
    },
    observers: {
      intersection: null,
      performance: null
    }
  };

  // DOM element cache
  const elements = {
    productsSection: null,
    productCards: null,
    filterButtons: null,
    productGrid: null,
    images: null
  };

  // Configuration
  const config = {
    animationDuration: 300,
    hoverDebounceMs: 100,
    lazyLoadRootMargin: '50px',
    lazyLoadThreshold: 0.1,
    trackingDebounceMs: 500
  };

  /**
   * Initialize products module when DOM is ready
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[Products] Already initialized');
      return;
    }

    try {
      cacheElements();
      
      if (!elements.productsSection) {
        console.warn('[Products] Products section not found, skipping initialization');
        return;
      }

      setupProductCardInteractions();
      setupCategoryFiltering();
      setupLazyLoading();
      setupEngagementTracking();
      
      state.isInitialized = true;
      console.info('[Products] Module initialized successfully');
    } catch (error) {
      console.error('[Products] Initialization failed:', error);
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.productsSection = document.querySelector('[data-products-section]') || 
                               document.querySelector('.featured-products') ||
                               document.getElementById('featured');
    
    if (!elements.productsSection) {
      return;
    }

    elements.productGrid = elements.productsSection.querySelector('[data-product-grid]') ||
                          elements.productsSection.querySelector('.product-grid');
    
    elements.productCards = elements.productsSection.querySelectorAll('[data-product-card]') ||
                           elements.productsSection.querySelectorAll('.product-card');
    
    elements.filterButtons = elements.productsSection.querySelectorAll('[data-filter]') ||
                            elements.productsSection.querySelectorAll('.filter-button');
    
    elements.images = elements.productsSection.querySelectorAll('img[data-src]');

    console.debug('[Products] Cached elements:', {
      cards: elements.productCards.length,
      filters: elements.filterButtons.length,
      images: elements.images.length
    });
  }

  /**
   * Setup product card hover animations and interactions
   */
  function setupProductCardInteractions() {
    if (!elements.productCards || elements.productCards.length === 0) {
      console.warn('[Products] No product cards found');
      return;
    }

    let hoverTimeout = null;

    elements.productCards.forEach(function(card) {
      // Hover enter with debounce
      card.addEventListener('mouseenter', function(event) {
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(function() {
          handleCardHoverEnter(card, event);
        }, config.hoverDebounceMs);
      });

      // Hover leave
      card.addEventListener('mouseleave', function(event) {
        clearTimeout(hoverTimeout);
        handleCardHoverLeave(card, event);
      });

      // Click tracking
      card.addEventListener('click', function(event) {
        handleCardClick(card, event);
      });

      // Keyboard accessibility
      card.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleCardClick(card, event);
        }
      });

      // Ensure cards are keyboard focusable
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      // Add ARIA labels if missing
      if (!card.hasAttribute('role')) {
        card.setAttribute('role', 'article');
      }
    });

    console.debug('[Products] Product card interactions enabled for', elements.productCards.length, 'cards');
  }

  /**
   * Handle card hover enter with animation
   * @param {HTMLElement} card - Product card element
   * @param {Event} event - Mouse event
   */
  function handleCardHoverEnter(card, event) {
    try {
      card.classList.add('is-hovered');
      
      // Show additional info if available
      const additionalInfo = card.querySelector('[data-additional-info]') ||
                            card.querySelector('.product-additional-info');
      
      if (additionalInfo) {
        additionalInfo.style.opacity = '1';
        additionalInfo.style.transform = 'translateY(0)';
        additionalInfo.setAttribute('aria-hidden', 'false');
      }

      // Track hover interaction
      state.interactionMetrics.cardHovers++;
      
      console.debug('[Products] Card hover enter:', {
        productId: card.dataset.productId || 'unknown',
        category: card.dataset.category || 'unknown'
      });
    } catch (error) {
      console.error('[Products] Error handling card hover enter:', error);
    }
  }

  /**
   * Handle card hover leave with animation
   * @param {HTMLElement} card - Product card element
   * @param {Event} event - Mouse event
   */
  function handleCardHoverLeave(card, event) {
    try {
      card.classList.remove('is-hovered');
      
      // Hide additional info
      const additionalInfo = card.querySelector('[data-additional-info]') ||
                            card.querySelector('.product-additional-info');
      
      if (additionalInfo) {
        additionalInfo.style.opacity = '0';
        additionalInfo.style.transform = 'translateY(10px)';
        additionalInfo.setAttribute('aria-hidden', 'true');
      }

      console.debug('[Products] Card hover leave');
    } catch (error) {
      console.error('[Products] Error handling card hover leave:', error);
    }
  }

  /**
   * Handle card click for engagement tracking
   * @param {HTMLElement} card - Product card element
   * @param {Event} event - Click or keyboard event
   */
  function handleCardClick(card, event) {
    try {
      const productId = card.dataset.productId || 'unknown';
      const productName = card.querySelector('[data-product-name]')?.textContent || 
                         card.querySelector('.product-name')?.textContent || 
                         'unknown';
      const category = card.dataset.category || 'unknown';

      state.interactionMetrics.cardClicks++;

      console.info('[Products] Product card clicked:', {
        productId: productId,
        productName: productName,
        category: category,
        timestamp: new Date().toISOString()
      });

      // Dispatch custom event for analytics integration
      const clickEvent = new CustomEvent('productCardClick', {
        detail: {
          productId: productId,
          productName: productName,
          category: category,
          element: card
        },
        bubbles: true
      });
      
      card.dispatchEvent(clickEvent);
    } catch (error) {
      console.error('[Products] Error handling card click:', error);
    }
  }

  /**
   * Setup category filtering functionality
   */
  function setupCategoryFiltering() {
    if (!elements.filterButtons || elements.filterButtons.length === 0) {
      console.debug('[Products] No filter buttons found, skipping filter setup');
      return;
    }

    elements.filterButtons.forEach(function(button) {
      button.addEventListener('click', function(event) {
        event.preventDefault();
        handleFilterChange(button);
      });

      // Keyboard accessibility
      button.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleFilterChange(button);
        }
      });
    });

    console.debug('[Products] Category filtering enabled for', elements.filterButtons.length, 'filters');
  }

  /**
   * Handle category filter change
   * @param {HTMLElement} button - Filter button element
   */
  function handleFilterChange(button) {
    try {
      const filterValue = button.dataset.filter || 'all';
      
      if (state.activeFilter === filterValue) {
        console.debug('[Products] Filter already active:', filterValue);
        return;
      }

      state.activeFilter = filterValue;
      state.interactionMetrics.filterChanges++;

      // Update button states
      elements.filterButtons.forEach(function(btn) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('is-active');
      button.setAttribute('aria-pressed', 'true');

      // Filter products
      filterProducts(filterValue);

      console.info('[Products] Filter changed to:', filterValue);
    } catch (error) {
      console.error('[Products] Error handling filter change:', error);
    }
  }

  /**
   * Filter products based on category
   * @param {string} category - Category to filter by ('all' or specific category)
   */
  function filterProducts(category) {
    if (!elements.productCards || elements.productCards.length === 0) {
      return;
    }

    let visibleCount = 0;

    elements.productCards.forEach(function(card) {
      const cardCategory = card.dataset.category || '';
      const shouldShow = category === 'all' || cardCategory === category;

      if (shouldShow) {
        card.style.display = '';
        card.classList.remove('is-filtered-out');
        card.setAttribute('aria-hidden', 'false');
        visibleCount++;
        
        // Animate in
        setTimeout(function() {
          card.classList.add('is-visible');
        }, 50);
      } else {
        card.classList.add('is-filtered-out');
        card.classList.remove('is-visible');
        card.setAttribute('aria-hidden', 'true');
        
        // Hide after animation
        setTimeout(function() {
          card.style.display = 'none';
        }, config.animationDuration);
      }
    });

    console.debug('[Products] Filtered products:', {
      category: category,
      visible: visibleCount,
      total: elements.productCards.length
    });

    // Announce to screen readers
    announceFilterResults(visibleCount, category);
  }

  /**
   * Announce filter results to screen readers
   * @param {number} count - Number of visible products
   * @param {string} category - Active category
   */
  function announceFilterResults(count, category) {
    const announcement = category === 'all' 
      ? `Showing all ${count} products`
      : `Showing ${count} products in ${category} category`;

    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;

    document.body.appendChild(liveRegion);

    setTimeout(function() {
      document.body.removeChild(liveRegion);
    }, 1000);
  }

  /**
   * Setup lazy loading for product images
   */
  function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[Products] IntersectionObserver not supported, loading all images');
      loadAllImages();
      return;
    }

    if (!elements.images || elements.images.length === 0) {
      console.debug('[Products] No lazy-loadable images found');
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: config.lazyLoadRootMargin,
      threshold: config.lazyLoadThreshold
    };

    state.observers.intersection = new IntersectionObserver(handleImageIntersection, observerOptions);

    elements.images.forEach(function(img) {
      state.observers.intersection.observe(img);
    });

    console.debug('[Products] Lazy loading enabled for', elements.images.length, 'images');
  }

  /**
   * Handle image intersection for lazy loading
   * @param {IntersectionObserverEntry[]} entries - Observed entries
   */
  function handleImageIntersection(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const img = entry.target;
        loadImage(img);
        state.observers.intersection.unobserve(img);
      }
    });
  }

  /**
   * Load a single image
   * @param {HTMLImageElement} img - Image element to load
   */
  function loadImage(img) {
    const src = img.dataset.src;
    
    if (!src) {
      console.warn('[Products] Image missing data-src attribute');
      return;
    }

    const startTime = performance.now();

    img.addEventListener('load', function() {
      const loadTime = performance.now() - startTime;
      img.classList.add('is-loaded');
      img.removeAttribute('data-src');
      
      state.interactionMetrics.imageLoads++;

      console.debug('[Products] Image loaded:', {
        src: src,
        loadTime: Math.round(loadTime) + 'ms'
      });
    });

    img.addEventListener('error', function() {
      console.error('[Products] Image failed to load:', src);
      img.classList.add('is-error');
      
      // Set fallback image if available
      const fallback = img.dataset.fallback;
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      }
    });

    img.src = src;
  }

  /**
   * Load all images immediately (fallback for no IntersectionObserver)
   */
  function loadAllImages() {
    if (!elements.images || elements.images.length === 0) {
      return;
    }

    elements.images.forEach(function(img) {
      loadImage(img);
    });
  }

  /**
   * Setup engagement tracking with debounced reporting
   */
  function setupEngagementTracking() {
    let trackingTimeout = null;

    // Track scroll engagement
    const productsObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && entry.target === elements.productsSection) {
          console.info('[Products] Section entered viewport');
          
          clearTimeout(trackingTimeout);
          trackingTimeout = setTimeout(function() {
            reportEngagementMetrics();
          }, config.trackingDebounceMs);
        }
      });
    }, {
      threshold: 0.5
    });

    if (elements.productsSection) {
      productsObserver.observe(elements.productsSection);
    }

    // Report metrics on page unload
    window.addEventListener('beforeunload', function() {
      reportEngagementMetrics();
    });

    console.debug('[Products] Engagement tracking enabled');
  }

  /**
   * Report engagement metrics
   */
  function reportEngagementMetrics() {
    const metrics = {
      cardHovers: state.interactionMetrics.cardHovers,
      cardClicks: state.interactionMetrics.cardClicks,
      filterChanges: state.interactionMetrics.filterChanges,
      imageLoads: state.interactionMetrics.imageLoads,
      activeFilter: state.activeFilter,
      timestamp: new Date().toISOString()
    };

    console.info('[Products] Engagement metrics:', metrics);

    // Dispatch custom event for analytics integration
    const metricsEvent = new CustomEvent('productsEngagement', {
      detail: metrics,
      bubbles: true
    });
    
    document.dispatchEvent(metricsEvent);
  }

  /**
   * Public API for external access
   */
  window.FashionForwardProducts = {
    init: init,
    filterProducts: function(category) {
      if (!state.isInitialized) {
        console.warn('[Products] Module not initialized');
        return;
      }
      filterProducts(category);
    },
    getMetrics: function() {
      return Object.assign({}, state.interactionMetrics);
    },
    isInitialized: function() {
      return state.isInitialized;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();