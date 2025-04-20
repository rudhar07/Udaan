/**
 * CORS Proxy Utility
 * 
 * Provides functions to help with CORS issues when making API requests
 */

// Determine if we need a CORS proxy based on the environment
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
const useProxy = isDevelopment; // Only use proxy in development

// List of CORS proxy services we can use
const proxies = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
];

/**
 * Wrap a URL with a CORS proxy if needed
 * @param {string} url - The URL to wrap
 * @returns {string} - The proxied URL
 */
export function proxyUrl(url) {
  // If we don't need a proxy, return the original URL
  if (!useProxy) return url;
  
  // Choose a proxy service (we're using the first one for now)
  const proxyService = proxies[0];
  
  // Encode the URL if needed
  if (proxyService.includes('?url=')) {
    return `${proxyService}${encodeURIComponent(url)}`;
  }
  
  // Otherwise just prepend the proxy
  return `${proxyService}${url}`;
}

/**
 * Create fetch options for a proxied request
 * @param {Object} options - Original fetch options
 * @returns {Object} - Enhanced fetch options
 */
export function createFetchOptions(options = {}) {
  const fetchOptions = {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      ...(options.headers || {})
    },
    mode: 'cors'
  };
  
  return fetchOptions;
}

/**
 * Make a fetch request with CORS proxy if needed
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function proxiedFetch(url, options = {}) {
  try {
    // First try without a proxy
    const response = await fetch(url, createFetchOptions(options));
    return response;
  } catch (error) {
    console.warn('Direct fetch failed, trying with proxy:', error);
    
    // If direct fetch fails, try with a proxy
    const proxiedUrl = proxyUrl(url);
    console.log('Using proxied URL:', proxiedUrl);
    return fetch(proxiedUrl, createFetchOptions(options));
  }
}

export default {
  proxyUrl,
  createFetchOptions,
  proxiedFetch
}; 