/**
 * Centralized API URL configuration
 * In local dev: defaults to http://localhost:5000
 * In Azure production: reads from environment variable VITE_API_URL
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
