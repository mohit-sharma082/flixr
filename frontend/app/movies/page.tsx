import { redirect } from 'next/navigation';

// `/movies` is a legacy alias for the movies discovery page. Redirect on the
// server (the old version called router.replace during render, which flashed an
// empty page before bouncing).
export default function MoviesAliasPage() {
    redirect('/movie');
}
