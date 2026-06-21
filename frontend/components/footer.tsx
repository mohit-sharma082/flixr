/**
 * Site footer with the TMDB attribution + non-endorsement notice required by the
 * TMDB API Terms of Use. The statement text is mandatory; the official TMDB logo
 * should also be added here when available (drop the SVG in /public and render it).
 */
export function Footer() {
    return (
        <footer className='border-t border-white/10 bg-black px-4 py-8 text-center text-xs text-white/50 sm:px-6 lg:px-8'>
            <p className='mx-auto max-w-2xl leading-relaxed'>
                Flixr uses the{' '}
                <a
                    href='https://www.themoviedb.org/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='underline underline-offset-2 transition-colors hover:text-white'>
                    TMDB
                </a>{' '}
                API but is not endorsed or certified by TMDB.
            </p>
            <p className='mt-2 text-white/40'>
                Movie &amp; TV metadata and images © The Movie Database (TMDB).
            </p>
        </footer>
    );
}

export default Footer;
