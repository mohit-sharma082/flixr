/**
 * Server-side only — never import this from a 'use client' module.
 *
 * Where server-side code (RSC fetches, metadata generation) should send API
 * calls. This runs inside the container, so it needs an absolute URL on the
 * internal network — `http://backend:4000` under Docker Compose — which is
 * exactly the address the visitor's browser cannot resolve. Hence the split
 * from CLIENT_API_BASE.
 *
 * A function, not a const: it must read the environment at request time so the
 * same image can be deployed anywhere without a rebuild.
 */
export function serverApiBase(): string {
    return (
        process.env.BACKEND_INTERNAL_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        'http://localhost:4000'
    );
}
