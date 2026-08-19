/** @type {import('next').NextConfig} */
const nextConfig = {
    // Emit a self-contained server bundle (server.js + traced node_modules) so
    // the Docker runtime stage doesn't need the full dependency tree.
    output: 'standalone',

    typescript: {
        ignoreBuildErrors: false,
    },

    // NOTE: the /api/* proxy lives in app/api/[...path]/route.ts, not here.
    // `rewrites()` is evaluated at build time and its destination is frozen
    // into routes-manifest.json, which would pin the image to one backend
    // address; the route handler resolves it per request instead.

    images: {
        // Self-hosted on modest hardware: Next's optimizer would transcode every
        // poster on demand. TMDB already serves sized variants (w185/w500/...),
        // so we pass them straight through. Flip this to `false` to turn the
        // optimizer on — remotePatterns below is already configured for it.
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'image.tmdb.org',
                pathname: '/t/p/**',
            },
        ],
    },
};

export default nextConfig;
