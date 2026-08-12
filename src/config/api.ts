/// <reference types="vite/client" />

/**
 * Centralized API URL configuration
 * In local dev: defaults to http://localhost:5000
 * In Azure production: reads from environment variable VITE_API_URL
 */
const env = (import.meta as unknown as { env: Record<string, string> }).env;
export const API_URL = (env && env.VITE_API_URL) || "http://localhost:5000";
