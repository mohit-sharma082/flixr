/**
 * Where the browser should send API calls.
 *
 * Empty string = same origin, which is the default: `next.config.mjs` rewrites
 * `/api/*` to the backend, so the browser never needs to know the backend's
 * address. That matters because NEXT_PUBLIC_* values are inlined into the
 * bundle at BUILD time — baking one in would pin the image to a single
 * hostname. Set NEXT_PUBLIC_API_URL only if you deliberately want the browser
 * to bypass the proxy and hit the backend directly (then keep the backend's
 * CORS_ORIGINS in sync).
 */
export const CLIENT_API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
