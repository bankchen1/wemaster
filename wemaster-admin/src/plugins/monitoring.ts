import { App } from 'vue';
import { initializeMonitoring, trackPageView } from '@/utils/monitoring';
import axios from 'axios';

// Axios interceptor for API monitoring
export const setupAxiosMonitoring = () => {
  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => {
      const endTime = Date.now();
      const startTime = response.config.metadata?.startTime || endTime;
      const duration = endTime - startTime;

      window.performanceMonitor?.trackApiCall(
        response.config.method?.toUpperCase() || 'UNKNOWN',
        response.config.url || 'unknown',
        response.status,
        duration
      );

      return response;
    },
    (error) => {
      const endTime = Date.now();
      const startTime = error.config?.metadata?.startTime || endTime;
      const duration = endTime - startTime;

      window.performanceMonitor?.trackApiCall(
        error.config?.method?.toUpperCase() || 'UNKNOWN',
        error.config?.url || 'unknown',
        error.response?.status || 0,
        duration
      );

      window.performanceMonitor?.recordError('api_error', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        response: error.response?.data,
      });

      return Promise.reject(error);
    }
  );
};

// Vue Router monitoring
export const setupRouterMonitoring = (router: any) => {
  router.beforeEach((to: any, from: any, next: any) => {
    // Track route change
    window.performanceMonitor?.trackUserInteraction('navigation', {
      from: from.path,
      to: to.path,
      from_name: from.name,
      to_name: to.name,
    });
    
    next();
  });

  router.afterEach((to: any) => {
    // Track page view after navigation
    setTimeout(() => {
      window.performanceMonitor?.trackPageView();
    }, 0);
  });
};

// Vue component monitoring
export const setupComponentMonitoring = (app: App) => {
  app.config.errorHandler = (error, instance, info) => {
    window.performanceMonitor?.recordError('vue_component_error', {
      error: error.message,
      stack: error.stack,
      component_name: instance?.$options?.name || 'unknown',
      error_info: info,
    });
  };

  app.config.warnHandler = (msg, instance, trace) => {
    window.performanceMonitor?.recordError('vue_warning', {
      message: msg,
      component_name: instance?.$options?.name || 'unknown',
      trace,
    });
  };
};

// Monitoring plugin
export const MonitoringPlugin = {
  install(app: App, options: { router?: any } = {}) {
    // Initialize monitoring
    const monitor = initializeMonitoring();
    
    // Setup Axios monitoring
    setupAxiosMonitoring();
    
    // Setup Vue component monitoring
    setupComponentMonitoring(app);
    
    // Setup router monitoring if provided
    if (options.router) {
      setupRouterMonitoring(options.router);
    }
    
    // Add global properties
    app.config.globalProperties.$monitor = monitor;
    app.provide('monitor', monitor);
  }
};

// Export for manual setup
export {
  setupAxiosMonitoring,
  setupRouterMonitoring,
  setupComponentMonitoring,
};