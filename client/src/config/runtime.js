const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const rawApiBase = import.meta.env.VITE_API_BASE_URL || '/api';
export const API_BASE = trimTrailingSlash(rawApiBase);

const isLocalBrowser =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const defaultSocketUrl = isLocalBrowser
    ? 'http://localhost:3000'
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;
export const SOCKET_URL = trimTrailingSlash(rawSocketUrl);
