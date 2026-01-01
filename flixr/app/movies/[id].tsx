import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Dimensions,
    Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Movie } from '@/lib/interfaces';
import { moviesApi } from '@/services/apiClient';

const { width, height } = Dimensions.get('window');
const POSTER_WIDTH = width * 0.36;
const POSTER_RATIO = 2 / 3;

export default function MovieDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [movie, setMovie] = useState<Movie | null>(null);

    useEffect(() => {
        if (!id) return;
        moviesApi
            .details(id)
            .then((res) => setMovie(res.movie))
            .catch(console.error);
    }, [id]);

    const posterUrl = useMemo(
        () =>
            movie?.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
        [movie]
    );

    const backdropUrl = useMemo(
        () =>
            movie?.backdrop_path
                ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                : 'https://images.unsplash.com/photo-1714578187377-eccdd15c4f35?w=500',
        [movie]
    );

    if (!movie) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>Loading…</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}>
            {/* HERO */}
            <View style={styles.hero}>
                {backdropUrl && (
                    <Image
                        source={{ uri: backdropUrl }}
                        style={StyleSheet.absoluteFill}
                        contentFit='cover'
                    />
                )}
                <LinearGradient
                    colors={['transparent', '#101010']}
                    style={StyleSheet.absoluteFill}
                />

                <Pressable style={styles.back} onPress={() => router.back()}>
                    <ThemedText style={styles.backText}>‹ Back</ThemedText>
                </Pressable>

                <View style={styles.heroContent}>
                    {posterUrl && (
                        <Image
                            source={{ uri: posterUrl }}
                            style={styles.poster}
                            contentFit='cover'
                        />
                    )}

                    <View style={styles.heroText}>
                        <View style={styles.genreRow}>
                            {movie?.genres?.slice(0, 5).map((g, i) => (
                                <View key={i} style={styles.genreChip}>
                                    <ThemedText style={styles.genreText}>
                                        {g.name}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>
                        <ThemedText style={styles.title}>
                            {movie.title}
                        </ThemedText>

                        <ThemedText style={styles.subtitle}>
                            {movie.release_date?.slice(0, 4)} • ⭐{' '}
                            {movie?.vote_average?.toFixed(1) ?? '?'}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* CONTENT */}
            <ThemedView style={styles.content}>
                {movie?.tagline && (
                    <ThemedView style={styles.taglineBox}>
                        <ThemedText style={styles.taglineText}>
                            {movie?.tagline}
                        </ThemedText>
                    </ThemedView>
                )}

                {/* Overview */}
                <Section title='Overview'>
                    <ThemedText style={styles.overview}>
                        {movie.overview || 'No description available.'}
                    </ThemedText>
                </Section>

                {/* Stats */}
                <Section title='Details'>
                    <View
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                        }}>
                        <InfoRow
                            label='Original Title'
                            value={movie.original_title}
                        />

                        <InfoRow
                            label='Average Vote'
                            value={
                                movie?.vote_average
                                    ? `${movie.vote_average.toFixed(1)}/10`
                                    : '?'
                            }
                        />
                        <InfoRow
                            label='Origin Country'
                            value={movie.production_countries
                                ?.map((pc) => pc.iso_3166_1)
                                .join(', ')}
                        />
                        <InfoRow
                            label='Vote Count'
                            value={movie?.vote_count?.toLocaleString() ?? '?'}
                        />
                        <InfoRow label='Status' value={movie.status} />
                        <InfoRow
                            label='Popularity'
                            value={movie?.popularity?.toFixed(1) ?? '?'}
                        />
                        <InfoRow
                            label='Release Date'
                            value={movie.release_date}
                        />
                        <InfoRow
                            label='Language'
                            value={movie.original_language?.toUpperCase()}
                        />
                        <InfoRow
                            label='Revenue'
                            value={String(movie.revenue)}
                        />
                        <InfoRow
                            label='Runtime'
                            value={String(movie.runtime)}
                        />
                        <InfoRow label='Budget' value={String(movie.budget)} />
                    </View>
                </Section>

                {/* Production */}
                {movie.production_companies?.length ? (
                    <Section title='Production Companies'>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}>
                            {movie.production_companies.map((pc) => (
                                <View key={pc.id} style={styles.companyCard}>
                                    <View
                                        style={{
                                            padding: 8,
                                            width: '100%',
                                            backgroundColor: 'white',
                                            borderRadius: 8,
                                            marginBottom: 4,
                                            minHeight: 60,
                                        }}>
                                        {pc.logo_path ? (
                                            <Image
                                                source={{
                                                    uri: `https://image.tmdb.org/t/p/w300${pc.logo_path}`,
                                                }}
                                                style={styles.companyLogo}
                                                contentFit='contain'
                                            />
                                        ) : (
                                            <ThemedText
                                                style={{
                                                    opacity: 0.6,
                                                    textAlign: 'center',
                                                    color: '#232323',
                                                }}>
                                                No Logo
                                            </ThemedText>
                                        )}
                                    </View>
                                    <ThemedText
                                        numberOfLines={2}
                                        style={styles.companyName}>
                                        {pc.name}
                                    </ThemedText>
                                </View>
                            ))}
                        </ScrollView>
                    </Section>
                ) : null}

                <View style={{ height: 32 }} />
            </ThemedView>
        </ScrollView>
    );
}

/* ----------------- Small helpers ----------------- */

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
            {children}
        </View>
    );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>{label}</ThemedText>
            <ThemedText style={styles.infoValue}>{value}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#10101010' },

    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    hero: {
        height: 460,
        justifyContent: 'flex-end',
    },

    taglineBox: {
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#212121',
        borderLeftWidth: 6,
        borderLeftColor: '#444444',
    },
    taglineText: {
        fontStyle: 'italic',
        fontSize: 18,
    },

    back: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        opacity: 0.8,
    },
    backText: {
        fontSize: 14,
        opacity: 0.9,
    },

    heroContent: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
        alignItems: 'flex-end',
    },

    poster: {
        width: POSTER_WIDTH,
        height: POSTER_WIDTH / POSTER_RATIO,
        borderRadius: 12,
        backgroundColor: '#222',
    },

    heroText: {
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        paddingBottom: 8,
    },

    title: {
        fontSize: 30,
        lineHeight: 30,
        height: 'auto',
        textOverflow: 'wrap',
        fontWeight: '700',
        wordWrap: 'break-word',
    },

    subtitle: {
        marginTop: 4,
        opacity: 0.8,
        fontWeight: '500',
        letterSpacing: 0.4,
        fontSize: 16,
    },

    genreRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 10,
        flexWrap: 'wrap',
    },

    genreChip: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: 'rgba(255,255,255,0.15)',
    },

    genreText: {
        fontSize: 12,
    },

    content: {
        padding: 16,
        gap: 24,
        backgroundColor: '#101010',
    },

    section: {
        gap: 2,
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: 0.6,
    },

    overview: {
        lineHeight: 22,
        opacity: 0.9,
    },

    infoRow: {
        paddingVertical: 6,
        width: '50%',
    },

    infoLabel: {
        opacity: 0.6,
        fontSize: 14,

        fontWeight: '500',
    },

    infoValue: {
        fontWeight: '500',
        fontSize: 18,
    },

    companyCard: {
        width: 130,
        minHeight: 50,
        marginRight: 12,
        alignItems: 'center',
        borderRadius: 12,
    },

    companyLogo: {
        width: '100%',
        minHeight: 40,
        marginBottom: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },

    companyName: {
        fontSize: 14,
        opacity: 0.9,
        lineHeight: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});
