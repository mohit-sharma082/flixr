'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '@/store/slices/authSlice';
import { createApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
    Star,
    Film,
    Calendar,
    BarChart3,
    TrendingUp,
    ArrowRight,
    Clapperboard,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserReview {
    id: string;
    movieId: number;
    movieTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

function getRatingColor(rating: number) {
    if (rating >= 7.5) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
}

function getRatingBadgeClass(rating: number) {
    if (rating >= 7.5) return 'bg-green-500/15 border-green-500/30 text-green-400';
    if (rating >= 6) return 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400';
    return 'bg-red-500/15 border-red-500/30 text-red-400';
}

function getInitials(str: string) {
    return str
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

function UserAvatar({ name, email }: { name?: string; email?: string }) {
    const initials = name
        ? getInitials(name)
        : (email?.charAt(0) ?? '?').toUpperCase();

    return (
        <div className='relative shrink-0'>
            <div className='h-24 w-24 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-white/20 flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl select-none'>
                {initials}
            </div>
            <div className='absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-black' />
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
}) {
    return (
        <div className='flex flex-col gap-1 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm'>
            <Icon className='h-4 w-4 text-white/40 mb-1' />
            <span className='text-2xl font-bold text-white'>{value}</span>
            <span className='text-xs text-white/50'>{label}</span>
            {sub && <span className='text-xs text-white/70 font-medium'>{sub}</span>}
        </div>
    );
}

function RatingBar({
    label,
    count,
    total,
    colorClass,
}: {
    label: string;
    count: number;
    total: number;
    colorClass: string;
}) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className='flex items-center gap-3'>
            <span className='text-xs text-white/40 w-10 text-right shrink-0'>
                {label}
            </span>
            <div className='flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden'>
                <div
                    className={cn('h-full rounded-full transition-all duration-700', colorClass)}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className='text-xs text-white/50 w-5 text-right shrink-0'>
                {count}
            </span>
        </div>
    );
}

function ReviewCard({ review }: { review: UserReview }) {
    return (
        <Link href={`/movie/${review.movieId}`}>
            <article className='group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all duration-300 p-5'>
                <div className='flex items-start justify-between gap-4 mb-3'>
                    <h3 className='font-semibold text-base leading-snug group-hover:text-white transition-colors line-clamp-2 flex-1 text-white/90'>
                        {review.movieTitle}
                    </h3>
                    <div
                        className={cn(
                            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-sm font-bold shrink-0',
                            getRatingBadgeClass(review.rating)
                        )}>
                        <Star className='h-3 w-3 fill-current' />
                        <span>{review.rating}/10</span>
                    </div>
                </div>

                {review.comment && (
                    <p className='text-sm text-white/50 leading-relaxed line-clamp-3 mb-4'>
                        {review.comment}
                    </p>
                )}

                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-1.5 text-xs text-white/30'>
                        <Calendar className='h-3 w-3' />
                        <span>
                            {new Date(review.createdAt).toLocaleDateString(
                                'en-US',
                                {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                }
                            )}
                        </span>
                    </div>
                    <ArrowRight className='h-4 w-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all duration-200' />
                </div>
            </article>
        </Link>
    );
}

function LoadingSkeleton() {
    return (
        <main className='min-h-screen bg-black flex items-center justify-center'>
            <div className='flex flex-col items-center gap-6'>
                <div className='h-24 w-24 rounded-full bg-white/10 animate-pulse' />
                <div className='space-y-2 flex flex-col items-center'>
                    <div className='h-5 w-40 bg-white/10 rounded-full animate-pulse' />
                    <div className='h-3 w-28 bg-white/5 rounded-full animate-pulse' />
                </div>
                <div className='grid grid-cols-4 gap-3 mt-4'>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className='h-24 w-28 rounded-2xl bg-white/5 animate-pulse'
                        />
                    ))}
                </div>
            </div>
        </main>
    );
}

function EmptyState() {
    return (
        <div className='flex flex-col items-center justify-center py-32 gap-5'>
            <div className='h-20 w-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10'>
                <Clapperboard className='h-9 w-9 text-white/20' />
            </div>
            <div className='text-center space-y-2'>
                <h3 className='text-lg font-semibold text-white'>
                    No reviews yet
                </h3>
                <p className='text-sm text-white/40 max-w-xs'>
                    Start watching and sharing your take — your reviews will
                    appear here.
                </p>
            </div>
            <Link
                href='/'
                className='mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-sm text-white font-medium transition-colors border border-white/10'>
                <Film className='h-4 w-4' />
                Browse Movies
            </Link>
        </div>
    );
}

export default function ProfilePage() {
    const router = useRouter();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            router.push('/auth/login');
            return;
        }

        const fetchUserReviews = async () => {
            try {
                const api = createApi();
                const response = await api.get(
                    '/api/reviews?userId=' + user?.id
                );
                setReviews(response.data || []);
            } catch {
                // silently degrade — empty state handles it
            } finally {
                setLoading(false);
            }
        };

        fetchUserReviews();
    }, [token, user, router]);

    const stats = useMemo(() => {
        const total = reviews.length;
        if (!total) return { avg: 0, great: 0, mid: 0, low: 0, bad: 0, thisYear: 0 };

        const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;
        const thisYear = new Date().getFullYear();

        return {
            avg,
            great: reviews.filter((r) => r.rating >= 8).length,
            mid: reviews.filter((r) => r.rating >= 6 && r.rating < 8).length,
            low: reviews.filter((r) => r.rating >= 4 && r.rating < 6).length,
            bad: reviews.filter((r) => r.rating < 4).length,
            thisYear: reviews.filter(
                (r) => new Date(r.createdAt).getFullYear() === thisYear
            ).length,
        };
    }, [reviews]);

    const criticLabel = useMemo(() => {
        if (!reviews.length) return null;
        if (stats.avg >= 8) return 'Easy crowd';
        if (stats.avg >= 6.5) return 'Fair critic';
        if (stats.avg >= 5) return 'Discerning';
        return 'Tough critic';
    }, [reviews.length, stats.avg]);

    if (loading) return <LoadingSkeleton />;

    const displayName = user?.name || user?.email?.split('@')[0] || 'Viewer';

    return (
        <main className='min-h-screen bg-black text-white'>
            {/* ── Hero Banner ───────────────────────────────────────── */}
            <div className='relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-b from-white/5 via-black/50 to-black pointer-events-none' />
                <div className='absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(255,255,255,0.08),transparent)] pointer-events-none' />

                <div className='relative z-10 px-4 sm:px-6 lg:px-8 pt-28 pb-10'>
                    <div className='max-w-5xl mx-auto'>
                        {/* Identity row */}
                        <div className='flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-10'>
                            <UserAvatar name={user?.name} email={user?.email} />
                            <div className='text-center sm:text-left'>
                                <h1 className='text-3xl sm:text-4xl font-extrabold tracking-tight'>
                                    {displayName}
                                </h1>
                                <p className='text-white/40 text-sm mt-1'>
                                    {user?.email}
                                </p>
                                <div className='flex items-center justify-center sm:justify-start gap-2 mt-3'>
                                    <Badge
                                        variant='outline'
                                        className='border-white/20 text-white/60 bg-white/5 text-xs'>
                                        <Film className='h-3 w-3 mr-1' />
                                        Flixr Member
                                    </Badge>
                                    {criticLabel && (
                                        <Badge
                                            variant='outline'
                                            className='border-white/20 text-white/60 bg-white/5 text-xs'>
                                            {criticLabel}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                            <StatCard
                                icon={Film}
                                label='Total Reviews'
                                value={reviews.length}
                            />
                            <StatCard
                                icon={Star}
                                label='Avg Rating'
                                value={
                                    reviews.length
                                        ? stats.avg.toFixed(1)
                                        : '—'
                                }
                                sub={
                                    reviews.length
                                        ? `out of 10`
                                        : undefined
                                }
                            />
                            <StatCard
                                icon={TrendingUp}
                                label='Loved It'
                                value={stats.great}
                                sub='8+ stars'
                            />
                            <StatCard
                                icon={BarChart3}
                                label='This Year'
                                value={stats.thisYear}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ──────────────────────────────────────────────── */}
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
                {reviews.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {/* Sidebar — rating breakdown */}
                        <aside className='md:col-span-1'>
                            <div className='sticky top-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-5'>
                                <h2 className='font-semibold text-sm text-white/70 flex items-center gap-2 uppercase tracking-widest'>
                                    <BarChart3 className='h-4 w-4' />
                                    Ratings
                                </h2>

                                <div className='space-y-3'>
                                    <RatingBar
                                        label='8–10'
                                        count={stats.great}
                                        total={reviews.length}
                                        colorClass='bg-green-500'
                                    />
                                    <RatingBar
                                        label='6–7'
                                        count={stats.mid}
                                        total={reviews.length}
                                        colorClass='bg-yellow-500'
                                    />
                                    <RatingBar
                                        label='4–5'
                                        count={stats.low}
                                        total={reviews.length}
                                        colorClass='bg-orange-500'
                                    />
                                    <RatingBar
                                        label='< 4'
                                        count={stats.bad}
                                        total={reviews.length}
                                        colorClass='bg-red-500'
                                    />
                                </div>

                                <div className='pt-4 border-t border-white/10 text-center'>
                                    <div
                                        className={cn(
                                            'text-5xl font-extrabold tabular-nums',
                                            getRatingColor(stats.avg)
                                        )}>
                                        {stats.avg.toFixed(1)}
                                    </div>
                                    <div className='text-xs text-white/30 mt-1'>
                                        average score
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Main — reviews list */}
                        <section className='md:col-span-2 space-y-4'>
                            <h2 className='font-semibold text-lg flex items-center gap-2.5'>
                                <Film className='h-5 w-5 text-white/50' />
                                Your Reviews
                                <Badge
                                    variant='secondary'
                                    className='text-xs bg-white/10 text-white/60 border-none'>
                                    {reviews.length}
                                </Badge>
                            </h2>

                            <div className='space-y-3'>
                                {reviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>

            <div className='h-20' />
        </main>
    );
}
