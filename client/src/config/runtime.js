const trimTrailingSlash = (value) => value.replace(/\/+$/, '');
const stripApiSuffix = (value) => value.replace(/\/api$/i, '');
const isAbsoluteHttp = (value) => /^https?:\/\//i.test(value);

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const defaultHostedApi = 'https://backend-pedros-projects-06014566.vercel.app/api';
const fallbackApiBase = runtimeOrigin.includes('1cbas-public-20260304.vercel.app')
    ? defaultHostedApi
    : '/api';
const rawApiBase = import.meta.env.VITE_API_BASE_URL || fallbackApiBase;
export const API_BASE = trimTrailingSlash(rawApiBase);

const isLocalBrowser =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const defaultSocketUrl = isLocalBrowser
    ? 'http://localhost:3000'
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

const socketFromApiBase = isAbsoluteHttp(API_BASE) ? stripApiSuffix(API_BASE) : null;
const rawSocketUrl = import.meta.env.VITE_SOCKET_URL || socketFromApiBase || defaultSocketUrl;
export const SOCKET_URL = trimTrailingSlash(rawSocketUrl);
