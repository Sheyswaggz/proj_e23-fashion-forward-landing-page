/**
 * Fashion Forward Landing Page - Newsletter Form Handler
 * 
 * Handles newsletter subscription form validation, submission,
 * and user feedback with comprehensive error handling and
 * accessibility support.
 * 
 * @generated-from: task-id:TASK-005
 * @modifies: none
 * @dependencies: []
 */

(function() {
  'use strict';

  // Email validation regex (RFC 5322 simplified)
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // State management
  const state = {
    isInitialized: false,
    isSubmitting: false,
    lastSubmissionTime: 0,
    submissionCount: 0,
    rateLimitWindow: 60000, // 1 minute
    maxSubmissionsPerWindow: 3
  };

  // DOM element cache
  const elements = {
    form: null,
    emailInput: null,
    submitButton: null,
    errorMessage: null,
    successMessage: null,
    privacyCheckbox: null
  };

  // Error messages
  const ERROR_MESSAGES = {
    INVALID_EMAIL: 'Please enter a valid email address',
    EMPTY_EMAIL: 'Email address is required',
    PRIVACY_NOT_ACCEPTED: 'Please accept the privacy policy to continue',
    RATE_LIMIT: 'Too many submission attempts. Please try again later',
    NETWORK_ERROR: 'Unable to submit. Please check your connection and try again',
    GENERIC_ERROR: 'An error occurred. Please try again',
    ALREADY_SUBSCRIBED: 'This email is already subscribed to our newsletter'
  };

  // Success messages
  const SUCCESS_MESSAGES = {
    SUBSCRIPTION_SUCCESS: 'Thank you for subscribing! Check your email to confirm your subscription.'
  };

  /**
   * Initialize newsletter form functionality
   */
  function init() {
    if (state.isInitialized) {
      console.warn('[Newsletter] Already initialized');
      return;
    }

    try {
      cacheElements();
      
      if (!elements.form) {
        console.warn('[Newsletter] Newsletter form not found on page');
        return;
      }

      setupEventListeners();
      setupAccessibility();
      state.isInitialized = true;
      console.info('[Newsletter] Newsletter form initialized successfully');
    } catch (error) {
      console.error('[Newsletter] Initialization failed:', error);
      // Fail gracefully - form should still work with basic HTML5 validation
    }
  }

  /**
   * Cache DOM elements for performance
   */
  function cacheElements() {
    elements.form = document.querySelector('[data-newsletter-form]');
    
    if (!elements.form) {
      return;
    }

    elements.emailInput = elements.form.querySelector('[data-newsletter-email]');
    elements.submitButton = elements.form.querySelector('[data-newsletter-submit]');
    elements.errorMessage = elements.form.querySelector('[data-newsletter-error]');
    elements.successMessage = elements.form.querySelector('[data-newsletter-success]');
    elements.privacyCheckbox = elements.form.querySelector('[data-newsletter-privacy]');

    // Validate required elements
    if (!elements.emailInput) {
      console.error('[Newsletter] Email input not found');
    }
    if (!elements.submitButton) {
      console.error('[Newsletter] Submit button not found');
    }
  }

  /**
   * Setup all event listeners
   */
  function setupEventListeners() {
    if (!elements.form || !elements.emailInput) {
      return;
    }

    // Form submission
    elements.form.addEventListener('submit', handleFormSubmit);

    // Real-time email validation
    elements.emailInput.addEventListener('blur', handleEmailBlur);
    elements.emailInput.addEventListener('input', handleEmailInput);

    // Privacy checkbox validation
    if (elements.privacyCheckbox) {
      elements.privacyCheckbox.addEventListener('change', handlePrivacyChange);
    }

    console.debug('[Newsletter] Event listeners attached');
  }

  /**
   * Setup accessibility attributes
   */
  function setupAccessibility() {
    if (!elements.emailInput) {
      return;
    }

    // Ensure proper ARIA attributes
    if (elements.errorMessage) {
      const errorId = elements.errorMessage.id || 'newsletter-error';
      elements.errorMessage.id = errorId;
      elements.emailInput.setAttribute('aria-describedby', errorId);
      elements.errorMessage.setAttribute('role', 'alert');
      elements.errorMessage.setAttribute('aria-live', 'polite');
    }

    if (elements.successMessage) {
      elements.successMessage.setAttribute('role', 'status');
      elements.successMessage.setAttribute('aria-live', 'polite');
    }

    console.debug('[Newsletter] Accessibility attributes configured');
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  function handleFormSubmit(event) {
    event.preventDefault();

    if (state.isSubmitting) {
      console.debug('[Newsletter] Submission already in progress');
      return;
    }

    try {
      // Clear previous messages
      clearMessages();

      // Validate form
      const validationResult = validateForm();
      
      if (!validationResult.isValid) {
        showError(validationResult.error);
        focusFirstError();
        console.warn('[Newsletter] Form validation failed:', validationResult.error);
        return;
      }

      // Check rate limiting
      if (!checkRateLimit()) {
        showError(ERROR_MESSAGES.RATE_LIMIT);
        console.warn('[Newsletter] Rate limit exceeded');
        return;
      }

      // Submit form
      submitForm(validationResult.data);
    } catch (error) {
      console.error('[Newsletter] Form submission error:', error);
      showError(ERROR_MESSAGES.GENERIC_ERROR);
    }
  }

  /**
   * Validate entire form
   * @returns {Object} Validation result with isValid flag and data/error
   */
  function validateForm() {
    const email = elements.emailInput.value.trim();

    // Check if email is empty
    if (!email) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.EMPTY_EMAIL
      };
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.INVALID_EMAIL
      };
    }

    // Check privacy checkbox if present
    if (elements.privacyCheckbox && !elements.privacyCheckbox.checked) {
      return {
        isValid: false,
        error: ERROR_MESSAGES.PRIVACY_NOT_ACCEPTED
      };
    }

    return {
      isValid: true,
      data: {
        email: email,
        timestamp: Date.now(),
        source: 'landing_page'
      }
    };
  }

  /**
   * Validate email format
   * @param {string} email - Email address to validate
   * @returns {boolean} True if valid
   */
  function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
      return false;
    }

    // Check length constraints
    if (email.length > 254) {
      return false;
    }

    // Check format with regex
    if (!EMAIL_REGEX.test(email)) {
      return false;
    }

    // Additional validation: check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Check local part length (before @)
    const localPart = email.split('@')[0];
    if (localPart.length > 64) {
      return false;
    }

    return true;
  }

  /**
   * Check rate limiting
   * @returns {boolean} True if submission is allowed
   */
  function checkRateLimit() {
    const now = Date.now();
    const timeSinceLastSubmission = now - state.lastSubmissionTime;

    // Reset counter if outside window
    if (timeSinceLastSubmission > state.rateLimitWindow) {
      state.submissionCount = 0;
    }

    // Check if limit exceeded
    if (state.submissionCount >= state.maxSubmissionsPerWindow) {
      return false;
    }

    return true;
  }

  /**
   * Submit form data
   * @param {Object} data - Form data to submit
   */
  async function submitForm(data) {
    state.isSubmitting = true;
    setSubmittingState(true);

    try {
      console.info('[Newsletter] Submitting subscription:', { email: data.email });

      // Simulate API call (replace with actual API endpoint)
      const response = await simulateApiCall(data);

      // Update rate limiting
      state.lastSubmissionTime = Date.now();
      state.submissionCount++;

      if (response.success) {
        handleSubmissionSuccess(response);
      } else {
        handleSubmissionError(response);
      }
    } catch (error) {
      console.error('[Newsletter] Submission failed:', error);
      handleSubmissionError({ error: ERROR_MESSAGES.NETWORK_ERROR });
    } finally {
      state.isSubmitting = false;
      setSubmittingState(false);
    }
  }

  /**
   * Simulate API call for newsletter subscription
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} API response
   */
  function simulateApiCall(data) {
    return new Promise(function(resolve) {
      // Simulate network delay
      setTimeout(function() {
        // Simulate success (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          resolve({
            success: true,
            message: SUCCESS_MESSAGES.SUBSCRIPTION_SUCCESS,
            subscriptionId: 'sub_' + Date.now()
          });
        } else {
          resolve({
            success: false,
            error: ERROR_MESSAGES.GENERIC_ERROR
          });
        }
      }, 1000);
    });
  }

  /**
   * Handle successful submission
   * @param {Object} response - API response
   */
  function handleSubmissionSuccess(response) {
    console.info('[Newsletter] Subscription successful:', response);

    // Show success message
    showSuccess(response.message || SUCCESS_MESSAGES.SUBSCRIPTION_SUCCESS);

    // Reset form
    elements.form.reset();

    // Remove validation states
    removeValidationState(elements.emailInput);

    // Track success metric
    trackMetric('newsletter_signup_success', {
      subscriptionId: response.subscriptionId
    });

    // Focus success message for screen readers
    if (elements.successMessage) {
      elements.successMessage.focus();
    }
  }

  /**
   * Handle submission error
   * @param {Object} response - Error response
   */
  function handleSubmissionError(response) {
    console.error('[Newsletter] Subscription failed:', response);

    const errorMessage = response.error || ERROR_MESSAGES.GENERIC_ERROR;
    showError(errorMessage);

    // Track error metric
    trackMetric('newsletter_signup_error', {
      error: errorMessage
    });

    // Focus error message for screen readers
    focusFirstError();
  }

  /**
   * Handle email input blur event
   * @param {Event} event - Blur event
   */
  function handleEmailBlur(event) {
    const email = event.target.value.trim();

    if (!email) {
      removeValidationState(event.target);
      return;
    }

    if (isValidEmail(email)) {
      setValidState(event.target);
    } else {
      setInvalidState(event.target, ERROR_MESSAGES.INVALID_EMAIL);
    }
  }

  /**
   * Handle email input event for real-time feedback
   * @param {Event} event - Input event
   */
  function handleEmailInput(event) {
    // Clear error state while typing
    if (event.target.classList.contains('is-invalid')) {
      removeValidationState(event.target);
      clearMessages();
    }
  }

  /**
   * Handle privacy checkbox change
   * @param {Event} event - Change event
   */
  function handlePrivacyChange(event) {
    if (event.target.checked) {
      removeValidationState(event.target);
    }
  }

  /**
   * Set input to valid state
   * @param {HTMLElement} input - Input element
   */
  function setValidState(input) {
    if (!input) return;

    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    input.setAttribute('aria-invalid', 'false');
  }

  /**
   * Set input to invalid state
   * @param {HTMLElement} input - Input element
   * @param {string} message - Error message
   */
  function setInvalidState(input, message) {
    if (!input) return;

    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');

    if (message) {
      showError(message);
    }
  }

  /**
   * Remove validation state from input
   * @param {HTMLElement} input - Input element
   */
  function removeValidationState(input) {
    if (!input) return;

    input.classList.remove('is-valid', 'is-invalid');
    input.removeAttribute('aria-invalid');
  }

  /**
   * Set submitting state
   * @param {boolean} isSubmitting - Submitting state
   */
  function setSubmittingState(isSubmitting) {
    if (!elements.submitButton) return;

    if (isSubmitting) {
      elements.submitButton.disabled = true;
      elements.submitButton.classList.add('is-loading');
      elements.submitButton.setAttribute('aria-busy', 'true');
      
      // Store original text
      if (!elements.submitButton.dataset.originalText) {
        elements.submitButton.dataset.originalText = elements.submitButton.textContent;
      }
      elements.submitButton.textContent = 'Subscribing...';
    } else {
      elements.submitButton.disabled = false;
      elements.submitButton.classList.remove('is-loading');
      elements.submitButton.setAttribute('aria-busy', 'false');
      
      // Restore original text
      if (elements.submitButton.dataset.originalText) {
        elements.submitButton.textContent = elements.submitButton.dataset.originalText;
      }
    }
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showError(message) {
    if (!elements.errorMessage) return;

    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.remove('is-hidden');
    elements.errorMessage.setAttribute('aria-hidden', 'false');

    console.debug('[Newsletter] Error displayed:', message);
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  function showSuccess(message) {
    if (!elements.successMessage) return;

    elements.successMessage.textContent = message;
    elements.successMessage.classList.remove('is-hidden');
    elements.successMessage.setAttribute('aria-hidden', 'false');

    console.debug('[Newsletter] Success displayed:', message);
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    if (elements.errorMessage) {
      elements.errorMessage.textContent = '';
      elements.errorMessage.classList.add('is-hidden');
      elements.errorMessage.setAttribute('aria-hidden', 'true');
    }

    if (elements.successMessage) {
      elements.successMessage.textContent = '';
      elements.successMessage.classList.add('is-hidden');
      elements.successMessage.setAttribute('aria-hidden', 'true');
    }
  }

  /**
   * Focus first error element
   */
  function focusFirstError() {
    if (elements.errorMessage && !elements.errorMessage.classList.contains('is-hidden')) {
      elements.errorMessage.setAttribute('tabindex', '-1');
      elements.errorMessage.focus();
      elements.errorMessage.removeAttribute('tabindex');
    }
  }

  /**
   * Track metric for analytics
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  function trackMetric(eventName, data) {
    try {
      console.info('[Newsletter] Metric:', eventName, data);
      
      // Integration point for analytics (Google Analytics, etc.)
      if (window.gtag) {
        window.gtag('event', eventName, data);
      }
      
      // Integration point for custom analytics
      if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track(eventName, data);
      }
    } catch (error) {
      console.error('[Newsletter] Metric tracking failed:', error);
      // Don't throw - analytics failure shouldn't break functionality
    }
  }

  /**
   * Public API for external access
   */
  window.Newsletter = {
    init: init,
    isInitialized: function() {
      return state.isInitialized;
    },
    validateEmail: isValidEmail,
    clearForm: function() {
      if (elements.form) {
        elements.form.reset();
        clearMessages();
        if (elements.emailInput) {
          removeValidationState(elements.emailInput);
        }
      }
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