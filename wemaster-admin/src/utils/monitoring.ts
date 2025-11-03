import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Performance monitoring utilities
export class PerformanceMonitor {
  private tracer = trace.getTracer('wemaster-frontend');

  constructor() {
    this.initializeWebVitals();
    this.initializeErrorTracking();
    this.initializeUserInteractionTracking();
  }

  // Initialize Web Vitals monitoring
  private initializeWebVitals() {
    const sendMetric = (metric: any) => {
      this.recordCustomMetric(`web_vital_${metric.name}`, metric.value, {
        rating: metric.rating,
        navigation_type: metric.navigationType,
      });
    };

    getCLS(sendMetric);
    getFID(sendMetric);
    getFCP(sendMetric);
    getLCP(sendMetric);
    getTTFB(sendMetric);
  }

  // Initialize error tracking
  private initializeErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordError('unhandled_promise_rejection', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }

  // Initialize user interaction tracking
  private initializeUserInteractionTracking() {
    // Track page views
    this.trackPageView();

    // Track route changes
    if (window.history?.pushState) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        setTimeout(() => window.performanceMonitor?.trackPageView(), 0);
      };
    }

    // Track click events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const element = target.closest('[data-track]') as HTMLElement;
      
      if (element) {
        this.trackUserInteraction('click', {
          element: element.tagName.toLowerCase(),
          id: element.id,
          class: element.className,
          text: element.textContent?.slice(0, 50),
          track_data: element.dataset.track,
        });
      }
    });
  }

  // Create a span for tracing
  createSpan(name: string, kind: SpanKind = SpanKind.INTERNAL) {
    return this.tracer.startSpan(name, { kind });
  }

  // Record custom metrics
  recordCustomMetric(name: string, value: number, labels: Record<string, any> = {}) {
    const span = this.createSpan(`metric_${name}`);
    span.setAttributes({
      'metric.name': name,
      'metric.value': value,
      ...Object.fromEntries(
        Object.entries(labels).map(([key, val]) => [`metric.label.${key}`, String(val)])
      ),
    });
    span.end();

    // Also send to backend if available
    this.sendMetricToBackend(name, value, labels);
  }

  // Record errors
  recordError(errorType: string, details: Record<string, any>) {
    const span = this.createSpan(`error_${errorType}`);
    span.recordException(details.message || errorType);
    span.setStatus({ code: SpanStatusCode.ERROR, message: details.message });
    span.setAttributes({
      'error.type': errorType,
      'error.details': JSON.stringify(details),
      'user_agent': navigator.userAgent,
      'url': window.location.href,
    });
    span.end();

    console.error(`[Monitoring] ${errorType}:`, details);
  }

  // Track page views
  trackPageView() {
    const span = this.createSpan('page_view', SpanKind.SERVER);
    span.setAttributes({
      'page.url': window.location.href,
      'page.path': window.location.pathname,
      'page.title': document.title,
      'page.referrer': document.referrer,
      'user_agent': navigator.userAgent,
    });
    span.end();

    this.recordCustomMetric('page_view', 1, {
      path: window.location.pathname,
      referrer: document.referrer,
    });
  }

  // Track user interactions
  trackUserInteraction(action: string, details: Record<string, any>) {
    const span = this.createSpan(`user_interaction_${action}`);
    span.setAttributes({
      'interaction.action': action,
      'interaction.details': JSON.stringify(details),
    });
    span.end();

    this.recordCustomMetric(`user_interaction_${action}`, 1, details);
  }

  // Track API calls
  trackApiCall(method: string, url: string, statusCode: number, duration: number) {
    const span = this.createSpan(`api_call_${method}`, SpanKind.CLIENT);
    span.setAttributes({
      'http.method': method,
      'http.url': url,
      'http.status_code': statusCode,
      'http.duration': duration,
    });
    
    if (statusCode >= 400) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: `HTTP ${statusCode}` 
      });
    }
    
    span.end();

    this.recordCustomMetric('api_call', 1, {
      method,
      status_code: statusCode.toString(),
      status_category: statusCode < 300 ? 'success' : statusCode < 500 ? 'client_error' : 'server_error',
    });

    this.recordCustomMetric('api_duration', duration, {
      method,
      status_code: statusCode.toString(),
    });
  }

  // Track user sessions
  trackSessionStart() {
    const sessionId = this.generateSessionId();
    localStorage.setItem('wemaster_session_id', sessionId);
    
    this.recordCustomMetric('session_start', 1, {
      session_id: sessionId,
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
    });

    return sessionId;
  }

  trackSessionEnd(sessionId: string) {
    const duration = Date.now() - parseInt(sessionId);
    this.recordCustomMetric('session_duration', duration, {
      session_id: sessionId,
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, details: Record<string, any> = {}) {
    this.recordCustomMetric(`feature_${feature}_${action}`, 1, {
      feature,
      action,
      ...details,
    });
  }

  // Track form submissions
  trackFormSubmission(formName: string, success: boolean, errors?: string[]) {
    this.recordCustomMetric('form_submission', 1, {
      form_name: formName,
      success,
      error_count: errors?.length || 0,
    });

    if (!success && errors) {
      this.recordError('form_validation_error', {
        form_name: formName,
        errors,
      });
    }
  }

  // Track performance metrics
  trackPerformanceMetric(name: string, value: number, details: Record<string, any> = {}) {
    this.recordCustomMetric(`performance_${name}`, value, details);
  }

  // Send metrics to backend
  private async sendMetricToBackend(name: string, value: number, labels: Record<string, any>) {
    try {
      // Only send in production or when explicitly enabled
      if (import.meta.env.PROD || import.meta.env.VITE_ENABLE_MONITORING) {
        await fetch('/api/v1/metrics/frontend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            value,
            labels,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        });
      }
    } catch (error) {
      // Silently fail to avoid affecting user experience
      console.warn('[Monitoring] Failed to send metric to backend:', error);
    }
  }

  // Generate session ID
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Get current user info for metrics
  private getUserInfo() {
    try {
      const userStr = localStorage.getItem('wemaster_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Get tenant info for metrics
  private getTenantInfo() {
    try {
      const tenantStr = localStorage.getItem('wemaster_tenant');
      return tenantStr ? JSON.parse(tenantStr) : null;
    } catch {
      return null;
    }
  }
}

// Create global instance
declare global {
  interface Window {
    performanceMonitor?: PerformanceMonitor;
  }
}

// Initialize monitoring
export const initializeMonitoring = () => {
  if (!window.performanceMonitor) {
    window.performanceMonitor = new PerformanceMonitor();
  }
  return window.performanceMonitor;
};

// Export convenience functions
export const trackPageView = () => window.performanceMonitor?.trackPageView();
export const trackUserInteraction = (action: string, details: Record<string, any>) => 
  window.performanceMonitor?.trackUserInteraction(action, details);
export const trackApiCall = (method: string, url: string, statusCode: number, duration: number) => 
  window.performanceMonitor?.trackApiCall(method, url, statusCode, duration);
export const trackFeatureUsage = (feature: string, action: string, details?: Record<string, any>) => 
  window.performanceMonitor?.trackFeatureUsage(feature, action, details);
export const trackFormSubmission = (formName: string, success: boolean, errors?: string[]) => 
  window.performanceMonitor?.trackFormSubmission(formName, success, errors);
export const recordError = (errorType: string, details: Record<string, any>) => 
  window.performanceMonitor?.recordError(errorType, details);