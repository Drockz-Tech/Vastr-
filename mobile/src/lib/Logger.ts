/**
 * Centralized Logging Service
 * In development, this logs to the console.
 * In production, this can be wired to Sentry, DataDog, or LogRocket.
 */
export const Logger = {
  log: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.log(`[LOG] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: any[]) => {
    if (__DEV__) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  error: (error: Error | string, context?: Record<string, any>) => {
    if (__DEV__) {
      console.error(`[ERROR]`, error, context);
    } else {
      // TODO: Initialize Sentry here.
      // Sentry.captureException(error, { extra: context });
    }
  },
  
  // Breadcrumbs help trace the steps a user took before a crash
  addBreadcrumb: (category: string, message: string, data?: any) => {
    if (__DEV__) {
      console.log(`[BREADCRUMB - ${category}] ${message}`, data);
    } else {
      // Sentry.addBreadcrumb({ category, message, data });
    }
  }
};
