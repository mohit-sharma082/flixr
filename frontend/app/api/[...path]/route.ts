import { NextRequest } from 'next/server';
import { serverApiBase } from '@/lib/api-base.server';

/**
 * Same-origin proxy to the Express BFF.
 *
 * Why a route handler and not a `rewrites()` entry: Next serialises rewrite
 * destinations into routes-manifest.json at BUILD time, so the backend address
 * would be frozen into the image. Resolving it per request keeps one image
 * deployable anywhere — change BACKEND_INTERNAL_URL and restart, no rebuild.
 *
 * The browser therefore only ever talks to this origin, which means no CORS
 * preflights and no backend hostname inlined into the client bundle.
 */

export const dynamic = 'force-dynamic';

// Hop-by-hop headers are connection-scoped and must not be forwarded; `host`
// would point the backend at the wrong vhost, and the body framing headers are
// recomputed by fetch.
const STRIPPED_REQUEST_HEADERS = new Set([
    'host',
    'connection',
    'keep-alive',
    'transfer-encoding',
    'upgrade',
    'proxy-authorization',
    'proxy-connection',
    'te',
    'trailer',
    'content-length',
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
    'connection',
    'keep-alive',
    'transfer-encoding',
    'upgrade',
    'content-encoding',
    'content-length',
]);

function buildForwardHeaders(req: NextRequest): Headers {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
        if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    // The backend rate-limits per client IP and runs with TRUST_PROXY=1, so it
    // reads the rightmost X-Forwarded-For entry. Forward it: without one, every
    // visitor would collapse into this container's IP — one shared bucket, and
    // users 429-ing each other.
    //
    // Caveat, stated plainly: Next populates X-Forwarded-For from the socket
    // only when the client didn't send one, and passes a client-supplied value
    // through unchanged. It is therefore forgeable, and this hop cannot tell the
    // two apart to re-anchor the chain. Per-IP limits here are a fair-use
    // guardrail for honest traffic, not an anti-abuse control. If that matters,
    // terminate at a real reverse proxy (nginx/Caddy/Traefik) that overwrites
    // the header, and raise TRUST_PROXY to match the hop count.
    const clientIp =
        req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip');
    if (clientIp) headers.set('x-forwarded-for', clientIp);

    const proto = req.headers.get('x-forwarded-proto') ?? req.nextUrl.protocol.replace(':', '');
    headers.set('x-forwarded-proto', proto);

    const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host');
    if (host) headers.set('x-forwarded-host', host);

    return headers;
}

async function proxy(req: NextRequest) {
    const target = `${serverApiBase()}${req.nextUrl.pathname}${req.nextUrl.search}`;

    // GET/HEAD must not carry a body; everything else streams straight through.
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

    let upstream: Response;
    try {
        upstream = await fetch(target, {
            method: req.method,
            headers: buildForwardHeaders(req),
            body: hasBody ? await req.arrayBuffer() : undefined,
            redirect: 'manual',
            cache: 'no-store',
        });
    } catch (err) {
        console.error(`[api-proxy] ${req.method} ${req.nextUrl.pathname} failed:`, err);
        return Response.json(
            { error: true, message: 'Upstream API unreachable', statusCode: 502 },
            { status: 502 }
        );
    }

    const headers = new Headers();
    upstream.headers.forEach((value, key) => {
        if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers,
    });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
