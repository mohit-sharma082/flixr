import { Image } from 'expo-image';
import { Dimensions, Platform, ScrollView, StyleSheet } from 'react-native';

import HeroCarousel from '@/components/hero-carousel';
import { useEffect, useState } from 'react';
import { getPopularItems } from '@/services/common.service';
import { Movie, TVShow } from '@/lib/interfaces';
import { ThemedView } from '@/components/themed-view';
import Grid from '@/components/grid';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
    const [data, setData] = useState<{
        movies: {
            results: Movie[];
            total_pages: number;
            page: number;
            total_results: number;
        };
        tvs: {
            results: TVShow[];
            total_results: number;
            page: number;
            total_pages: number;
        };
    } | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getPopularItems();
                if (response) {
                    setData({
                        movies: response.movies,
                        tvs: response.tvs,
                    });
                }
            } catch (err) {
                console.error('Error fetching popular items:', err);
            }
        }
        fetchData();
    }, []);

    return (
        <ScrollView style={styles.container}>
            {data ? (
                <HeroCarousel
                    movies={data?.movies.results}
                    tvs={data?.tvs.results}
                />
            ) : null}
            {data ? (
                <ThemedView style={{ flex: 1, backgroundColor: '#101010' }}>
                    <ThemedText style={styles.heading}>
                        Popular Movies
                    </ThemedText>
                    <Grid
                        data={data?.movies?.results.map((m) => ({
                            id: m.id,
                            image: m.poster_path
                                ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
                                : null,
                            title: m.title,
                        }))}
                        columns={3}
                        bottomSpacing={24}
                        onItemPress={(item) => {
                            router.push(`/movies/${item.id}`);
                        }}
                    />

                    <ThemedText style={styles.heading}>
                        Popular Tv Shows
                    </ThemedText>
                    <Grid
                        data={data?.tvs?.results.map((m) => ({
                            id: m.id,
                            image: m.poster_path
                                ? `https://image.tmdb.org/t/p/w342${m.poster_path}`
                                : null,
                            title: m.name,
                        }))}
                        columns={3}
                        bottomSpacing={24}
                        onItemPress={(item) => {
                            router.push(`/tv/${item.id}`);
                        }}
                    />
                </ThemedView>
            ) : null}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {},
    gridContainer: {
        borderWidth: 2,
        borderColor: 'orange',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: 14,
    },
    image: {
        width: Dimensions.get('window').width / 2 - 30,
        height: 250, // optional but safer
        borderRadius: 8,
        marginBottom: 10,
    },
    heading: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 10,
        marginLeft: 14,
    },
});
