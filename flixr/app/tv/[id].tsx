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
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TVShow } from '@/lib/interfaces';
import { tvApi } from '@/services/apiClient';

const { width, height } = Dimensions.get('window');
const POSTER_WIDTH = width * 0.36;
const POSTER_RATIO = 2 / 3;

export default function TVShowDetailsPage() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [show, setShow] = useState<TVShow | null>(null);

    useEffect(() => {
        if (!id) return;
        tvApi
            .details(id)
            .then((res) => setShow(res.show))
            .catch(console.error);
    }, [id]);

    const posterUrl = useMemo(
        () =>
            show?.poster_path
                ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
                : null,
        [show]
    );

    const backdropUrl = useMemo(
        () =>
            show?.backdrop_path
                ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
                : null,
        [show]
    );

    if (!show) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>Loading…</ThemedText>
            </ThemedView>
        );
    }

    return (
        <View style={{ width, height }}>
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
                            {show.genres?.slice(0, 5).map((g) => (
                                <View key={g.id} style={styles.genreChip}>
                                    <ThemedText style={styles.genreText}>
                                        {g.name}
                                    </ThemedText>
                                </View>
                            ))}
                        </View>

                        <ThemedText style={styles.title}>
                            {show.name}
                        </ThemedText>

                        <ThemedText style={styles.subtitle}>
                            {show.first_air_date?.slice(0, 4)} • ⭐{' '}
                            {show.vote_average?.toFixed(1) ?? '?'}
                        </ThemedText>
                    </View>
                </View>
            </View>

            {/* CONTENT */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <ThemedView style={styles.content}>
                    {show.tagline && (
                        <ThemedView style={styles.taglineBox}>
                            <ThemedText style={styles.taglineText}>
                                {show.tagline}
                            </ThemedText>
                        </ThemedView>
                    )}

                    {/* Overview */}
                    <Section title='Overview'>
                        <ThemedText style={styles.overview}>
                            {show.overview || 'No description available.'}
                        </ThemedText>
                    </Section>

                    {/* TV Details */}
                    <Section title='Details'>
                        <View style={styles.detailsGrid}>
                            <InfoRow
                                label='Original Name'
                                value={show.original_name}
                            />
                            <InfoRow
                                label='First Air Date'
                                value={show.first_air_date}
                            />
                            <InfoRow
                                label='Last Air Date'
                                value={show.last_air_date}
                            />
                            <InfoRow
                                label='Seasons'
                                value={String(show.number_of_seasons)}
                            />
                            <InfoRow
                                label='Episodes'
                                value={String(show.number_of_episodes)}
                            />
                            <InfoRow label='Status' value={show.status} />
                            <InfoRow
                                label='In Production'
                                value={show.in_production ? 'Yes' : 'No'}
                            />
                            <InfoRow
                                label='Language'
                                value={show.original_language?.toUpperCase()}
                            />
                        </View>
                    </Section>

                    {/* Next / Last Episode */}
                    {show.next_episode_to_air || show.last_episode_to_air ? (
                        <Section title='Episodes'>
                            {show.next_episode_to_air && (
                                <EpisodeCard
                                    label='Next Episode'
                                    episode={show.next_episode_to_air}
                                />
                            )}
                            {show.last_episode_to_air && (
                                <EpisodeCard
                                    label='Last Episode'
                                    episode={show.last_episode_to_air}
                                />
                            )}
                        </Section>
                    ) : null}

                    {/* Networks */}
                    {show.networks?.length ? (
                        <Section title='Networks'>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}>
                                {show.networks.map((n) => (
                                    <View key={n.id} style={styles.companyCard}>
                                        {n.logo_path && (
                                            <Image
                                                source={{
                                                    uri: `https://image.tmdb.org/t/p/w300${n.logo_path}`,
                                                }}
                                                style={styles.companyLogo}
                                                contentFit='contain'
                                            />
                                        )}
                                        <ThemedText style={styles.companyName}>
                                            {n.name}
                                        </ThemedText>
                                    </View>
                                ))}
                            </ScrollView>
                        </Section>
                    ) : null}

                    <View style={{ height: 32 }} />
                </ThemedView>
            </ScrollView>
        </View>
    );
}

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

function EpisodeCard({
    label,
    episode,
}: {
    label: string;
    episode: TVShow['last_episode_to_air'];
}) {
    return (
        <View style={styles.episodeCard}>
            <ThemedText style={styles.episodeLabel}>{label}</ThemedText>
            <ThemedText style={styles.episodeTitle}>
                S{episode.season_number} • E{episode.episode_number} —{' '}
                {episode.name}
            </ThemedText>
            <ThemedText style={styles.episodeOverview} numberOfLines={3}>
                {episode.overview}
            </ThemedText>
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

    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    episodeCard: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#1c1c1c',
        marginBottom: 12,
    },

    episodeLabel: {
        opacity: 0.6,
        fontSize: 12,
    },

    episodeTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginVertical: 4,
    },

    episodeOverview: {
        opacity: 0.8,
        fontSize: 14,
    },
});
