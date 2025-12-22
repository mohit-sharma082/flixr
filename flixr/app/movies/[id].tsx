import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useImageColors } from '@/hooks/use-image-colors';
import { Movie } from '@/lib/interfaces';
import { moviesApi } from '@/services/apiClient';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function MovieDetailsPage() {
    const { id } = useLocalSearchParams();
    const [movie, setMovie] = useState<Movie | null>(null);
    // const colors = useImageColors(
    //     movie?.poster_path
    //         ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    //         : null
    // );
    const fetchMovieDetails = async (movieId: string) => {
        try {
            const response = await moviesApi.details(movieId);
            setMovie(response);
        } catch (error: any) {
            console.log('Error fetching movie details:', error.message);
        }
    };

    useEffect(() => {
        if (id) {
            fetchMovieDetails(id as string);
        }
    }, [id]);
    return (
        <ScrollView style={styles.container}>
            <ThemedView>
                <ThemedText>Movie details page - {id}</ThemedText>
                <ThemedText>
                    {movie ? JSON.stringify({ movie }, null, 4) : 'Loading...'}
                </ThemedText>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
    },
});
