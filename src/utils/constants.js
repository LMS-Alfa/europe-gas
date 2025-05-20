// Base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin;

// Application constants
export const APP_CONSTANTS = {
  APP_NAME: "Europe Gas",
  API_TIMEOUT: 30000, // 30 seconds
  DEFAULT_LOCALE: "en",
  SUPPORTED_LOCALES: ["en", "ru", "es", "de"],
};

// Consistent port usage
export const VITE_PORT = 3000;

// Navigation routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  ADMIN_DASHBOARD: "/admin",
  PARTS_UPLOAD: "/admin/parts",
  USER_MANAGEMENT: "/admin/users",
  BONUS_REPORTS: "/admin/reports",
  USER_DASHBOARD: "/dashboard",
};

// Chart colors
export const COLORS = {
  primary: '#1e88e5',
  secondary: '#26a69a',
  success: '#66bb6a',
  warning: '#ffa726',
  error: '#ef5350',
  purple: '#7e57c2',
  indigo: '#5c6bc0',
  pink: '#ec407a'
}; 