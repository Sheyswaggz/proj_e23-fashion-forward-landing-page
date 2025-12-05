/**
 * Fashion Forward Landing Page - Performance Optimization Module
 * 
 * Implements comprehensive performance optimizations including:
 * - Intersection Observer-based lazy loading for images
 * - Performance timing measurements and monitoring
 * - Touch event optimizations for mobile devices
 * - Efficient DOM manipulation techniques
 * - Resource loading optimization
 * 
 * @generated-from: task-id:TASK-006
 * @modifies: none
 * @dependencies: []
 */

(function() {
  'use strict';

  // Performance state management
  const performanceState = {
    isInitialized: false,
    lazyLoadObserver: null,
    performanceMetrics: {
      navigationStart: 0,
      domContentLoaded: 0,
      loadComplete: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    },
    touchOptimizations: {
      enabled: false,
      passiveSupported: false
    },
    lazyLoadConfig: {
      rootMargin: '50px',
      threshold: 0.01,
      loadedClass: 'is-loaded',
      loadingClass: 'is-loading',
      errorClass: 'has-error'
    }
  };

  // DOM element cache for performance
  const elements = {
    lazyImages: null,
    lazyBackgrounds: null,
    touchElements: null
  };

  /**
   * Initialize performance optimizations
   */
  function init() {
    if (performanceState.isInitialized) {
      console.warn('[Performance] Already initialized');
      return;
    }

    try {
      detectFeatureSupport();
      cacheElements();
      initLazyLoading();
      initTouchOptimizations();
      measurePerformanceMetrics();
      setupPerformanceObservers();
      
      performanceState.isInitialized = true;
      console.info('[Performance] Optimizations initialized successfully');
    } catch (error) {
      console.error('[Performance] Initialization failed:', error);
    }
  }

  /**
   * Detect browser feature support
   */
  function detectFeatureSupport() {
    // Check for passive event listener support
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          performanceState.touchOptimizations.passiveSupported = true;
          return true;
        }
      });
      window.addEventListener('testPassive', null, opts);
      window.removeEventListener('testPassive', null, opts);
    } catch (e) {
      performanceState.touchOptimizations.passiveSupported = false;
    }

    console.debug('[Performance] Feature support:', {
      intersectionObserver: 'IntersectionObserver' in window,
      performanceObserver: 'PerformanceObserver' in window,
      passiveEvents: performanceState.touchOptimizations.passiveSupported
    });
  }

  /**
   * Cache DOM elements for lazy loading and touch optimization
   */
  function cacheElements() {
    elements.lazyImages = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    elements.lazyBackgrounds = document.querySelectorAll('[data-bg]');
    elements.touchElements = document.querySelectorAll('button, a, [role="button"]');

    console.debug('[Performance] Cached elements:', {
      lazyImages: elements.lazyImages.length,
      lazyBackgrounds: elements.lazyBackgrounds.length,
      touchElements: elements.touchElements.length
    });
  }

  /**
   * Initialize Intersection Observer for lazy loading
   */
  function initLazyLoading() {
    if (!('IntersectionObserver' in window)) {
      console.warn('[Performance] IntersectionObserver not supported, loading all images');
      loadAllImagesImmediately();
      return;
    }

    const config = performanceState.lazyLoadConfig;

    performanceState.lazyLoadObserver = new IntersectionObserver(
      handleLazyLoadIntersection,
      {
        root: null,
        rootMargin: config.rootMargin,
        threshold: config.threshold
      }
    );

    // Observe lazy images
    elements.lazyImages.forEach(function(img) {
      if (img.dataset.src || img.loading === 'lazy') {
        performanceState.lazyLoadObserver.observe(img);
      }
    });

    // Observe lazy background images
    elements.lazyBackgrounds.forEach(function(element) {
      if (element.dataset.bg) {
        performanceState.lazyLoadObserver.observe(element);
      }
    });

    console.info('[Performance] Lazy loading initialized for', 
      elements.lazyImages.length + elements.lazyBackgrounds.length, 'elements');
  }

  /**
   * Handle intersection observer callback for lazy loading
   * @param {IntersectionObserverEntry[]} entries - Observed entries
   */
  function handleLazyLoadIntersection(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) {
        return;
      }

      const element = entry.target;
      const config = performanceState.lazyLoadConfig;

      try {
        if (element.tagName === 'IMG') {
          loadLazyImage(element);
        } else if (element.dataset.bg) {
          loadLazyBackground(element);
        }

        // Stop observing once loaded
        performanceState.lazyLoadObserver.unobserve(element);
      } catch (error) {
        console.error('[Performance] Error loading lazy element:', error);
        element.classList.add(config.errorClass);
      }
    });
  }

  /**
   * Load lazy image with proper error handling
   * @param {HTMLImageElement} img - Image element to load
   */
  function loadLazyImage(img) {
    const config = performanceState.lazyLoadConfig;
    const startTime = performance.now();

    img.classList.add(config.loadingClass);

    // Handle data-src attribute
    if (img.dataset.src) {
      const tempImg = new Image();

      tempImg.onload = function() {
        img.src = img.dataset.src;
        
        // Handle srcset if present
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }

        img.classList.remove(config.loadingClass);
        img.classList.add(config.loadedClass);

        const loadTime = performance.now() - startTime;
        console.debug('[Performance] Image loaded:', img.dataset.src, 'in', loadTime.toFixed(2), 'ms');

        // Clean up data attributes
        delete img.dataset.src;
        delete img.dataset.srcset;
      };

      tempImg.onerror = function() {
        img.classList.remove(config.loadingClass);
        img.classList.add(config.errorClass);
        console.error('[Performance] Failed to load image:', img.dataset.src);
      };

      tempImg.src = img.dataset.src;
    } else if (img.loading === 'lazy') {
      // Native lazy loading fallback
      img.classList.remove(config.loadingClass);
      img.classList.add(config.loadedClass);
    }
  }

  /**
   * Load lazy background image
   * @param {HTMLElement} element - Element with background image
   */
  function loadLazyBackground(element) {
    const config = performanceState.lazyLoadConfig;
    const bgUrl = element.dataset.bg;
    const startTime = performance.now();

    element.classList.add(config.loadingClass);

    const tempImg = new Image();

    tempImg.onload = function() {
      element.style.backgroundImage = 'url(' + bgUrl + ')';
      element.classList.remove(config.loadingClass);
      element.classList.add(config.loadedClass);

      const loadTime = performance.now() - startTime;
      console.debug('[Performance] Background loaded:', bgUrl, 'in', loadTime.toFixed(2), 'ms');

      delete element.dataset.bg;
    };

    tempImg.onerror = function() {
      element.classList.remove(config.loadingClass);
      element.classList.add(config.errorClass);
      console.error('[Performance] Failed to load background:', bgUrl);
    };

    tempImg.src = bgUrl;
  }

  /**
   * Fallback: Load all images immediately if IntersectionObserver not supported
   */
  function loadAllImagesImmediately() {
    elements.lazyImages.forEach(function(img) {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }
        delete img.dataset.src;
        delete img.dataset.srcset;
      }
    });

    elements.lazyBackgrounds.forEach(function(element) {
      if (element.dataset.bg) {
        element.style.backgroundImage = 'url(' + element.dataset.bg + ')';
        delete element.dataset.bg;
      }
    });
  }

  /**
   * Initialize touch event optimizations for mobile
   */
  function initTouchOptimizations() {
    if (!elements.touchElements || elements.touchElements.length === 0) {
      console.warn('[Performance] No touch elements found');
      return;
    }

    const eventOptions = performanceState.touchOptimizations.passiveSupported
      ? { passive: true }
      : false;

    // Add touch-action CSS property via JavaScript for better control
    elements.touchElements.forEach(function(element) {
      // Prevent 300ms tap delay
      element.style.touchAction = 'manipulation';
      
      // Add visual feedback for touch
      element.addEventListener('touchstart', handleTouchStart, eventOptions);
      element.addEventListener('touchend', handleTouchEnd, eventOptions);
      element.addEventListener('touchcancel', handleTouchEnd, eventOptions);
    });

    // Optimize scroll performance
    const scrollElements = document.querySelectorAll('[data-scroll-optimize]');
    scrollElements.forEach(function(element) {
      element.style.willChange = 'transform';
      element.style.webkitOverflowScrolling = 'touch';
    });

    performanceState.touchOptimizations.enabled = true;
    console.info('[Performance] Touch optimizations enabled for', 
      elements.touchElements.length, 'elements');
  }

  /**
   * Handle touch start for visual feedback
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchStart(event) {
    const element = event.currentTarget;
    element.classList.add('is-touching');
  }

  /**
   * Handle touch end to remove visual feedback
   * @param {TouchEvent} event - Touch event
   */
  function handleTouchEnd(event) {
    const element = event.currentTarget;
    element.classList.remove('is-touching');
  }

  /**
   * Measure and log performance metrics
   */
  function measurePerformanceMetrics() {
    if (!('performance' in window)) {
      console.warn('[Performance] Performance API not supported');
      return;
    }

    try {
      const perfData = performance.timing;
      const metrics = performanceState.performanceMetrics;

      // Navigation timing
      metrics.navigationStart = perfData.navigationStart;
      metrics.domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      metrics.loadComplete = perfData.loadEventEnd - perfData.navigationStart;

      // Paint timing
      if ('PerformancePaintTiming' in window) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(function(entry) {
          if (entry.name === 'first-paint') {
            metrics.firstPaint = entry.startTime;
          } else if (entry.name === 'first-contentful-paint') {
            metrics.firstContentfulPaint = entry.startTime;
          }
        });
      }

      console.info('[Performance] Metrics:', {
        domContentLoaded: metrics.domContentLoaded + 'ms',
        loadComplete: metrics.loadComplete + 'ms',
        firstPaint: metrics.firstPaint ? metrics.firstPaint.toFixed(2) + 'ms' : 'N/A',
        firstContentfulPaint: metrics.firstContentfulPaint ? metrics.firstContentfulPaint.toFixed(2) + 'ms' : 'N/A'
      });
    } catch (error) {
      console.error('[Performance] Error measuring metrics:', error);
    }
  }

  /**
   * Setup Performance Observers for Core Web Vitals
   */
  function setupPerformanceObservers() {
    if (!('PerformanceObserver' in window)) {
      console.warn('[Performance] PerformanceObserver not supported');
      return;
    }

    try {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver(function(entryList) {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceState.performanceMetrics.largestContentfulPaint = lastEntry.renderTime || lastEntry.loadTime;
        
        console.debug('[Performance] LCP:', 
          performanceState.performanceMetrics.largestContentfulPaint.toFixed(2), 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift (CLS)
      const clsObserver = new PerformanceObserver(function(entryList) {
        const entries = entryList.getEntries();
        entries.forEach(function(entry) {
          if (!entry.hadRecentInput) {
            performanceState.performanceMetrics.cumulativeLayoutShift += entry.value;
          }
        });
        
        console.debug('[Performance] CLS:', 
          performanceState.performanceMetrics.cumulativeLayoutShift.toFixed(4));
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver(function(entryList) {
        const entries = entryList.getEntries();
        entries.forEach(function(entry) {
          performanceState.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
          
          console.debug('[Performance] FID:', 
            performanceState.performanceMetrics.firstInputDelay.toFixed(2), 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      console.info('[Performance] Performance observers initialized');
    } catch (error) {
      console.error('[Performance] Error setting up observers:', error);
    }
  }

  /**
   * Get current performance metrics
   * @returns {Object} Current performance metrics
   */
  function getMetrics() {
    return Object.assign({}, performanceState.performanceMetrics);
  }

  /**
   * Log performance summary
   */
  function logPerformanceSummary() {
    const metrics = performanceState.performanceMetrics;
    
    console.group('[Performance] Summary');
    console.log('DOM Content Loaded:', metrics.domContentLoaded, 'ms');
    console.log('Load Complete:', metrics.loadComplete, 'ms');
    console.log('First Paint:', metrics.firstPaint ? metrics.firstPaint.toFixed(2) + ' ms' : 'N/A');
    console.log('First Contentful Paint:', metrics.firstContentfulPaint ? metrics.firstContentfulPaint.toFixed(2) + ' ms' : 'N/A');
    console.log('Largest Contentful Paint:', metrics.largestContentfulPaint ? metrics.largestContentfulPaint.toFixed(2) + ' ms' : 'N/A');
    console.log('Cumulative Layout Shift:', metrics.cumulativeLayoutShift ? metrics.cumulativeLayoutShift.toFixed(4) : 'N/A');
    console.log('First Input Delay:', metrics.firstInputDelay ? metrics.firstInputDelay.toFixed(2) + ' ms' : 'N/A');
    console.groupEnd();
  }

  /**
   * Cleanup and disconnect observers
   */
  function cleanup() {
    if (performanceState.lazyLoadObserver) {
      performanceState.lazyLoadObserver.disconnect();
      performanceState.lazyLoadObserver = null;
    }

    performanceState.isInitialized = false;
    console.info('[Performance] Cleanup complete');
  }

  /**
   * Public API
   */
  window.FashionForwardPerformance = {
    init: init,
    getMetrics: getMetrics,
    logSummary: logPerformanceSummary,
    cleanup: cleanup,
    isInitialized: function() {
      return performanceState.isInitialized;
    }
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Log performance summary on page load
  window.addEventListener('load', function() {
    setTimeout(logPerformanceSummary, 1000);
  });

})();