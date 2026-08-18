/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: false,
    },
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
