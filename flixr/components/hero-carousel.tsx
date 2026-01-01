import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Carousel from 'react-native-reanimated-carousel';

import {
    Dimensions,
    Image,
    Platform,
    ScaledSize,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Movie, TVShow } from '@/lib/interfaces';
import { getPopularItems } from '@/services/common.service';

const isWeb = Platform.OS === 'web';
export const MAX_WIDTH = 430;

const window: ScaledSize = isWeb
    ? { width: MAX_WIDTH, height: 800, scale: 1, fontScale: 1 }
    : Dimensions.get('screen');

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780';

interface Item {
    id: number;
    mediaType: 'movie' | 'tv';
    title: string;
    overview: string;
    backdrop?: string | null;
    poster?: string | null;
    releaseYear?: number | null;
    vote_average?: number;
    raw: any;
}

function Index(props: { movies: Movie[]; tvs: TVShow[] }) {
    const { movies, tvs } = props;

    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const response = await getPopularItems();
    //             setData(response);
    //         } catch (err) {
    //             console.error('Error fetching popular items:', err);
    //         }
    //     }
    //     fetchData();
    // }, []);

    const items: Item[] = useMemo(() => {
        if (!movies || !tvs) return [];
        const m: Item[] = movies.map((mv: Movie) => ({
            id: mv.id,
            mediaType: 'movie',
            title: mv.title || mv.original_title || 'Untitled',
            overview: mv.overview ?? '',
            backdrop: mv.backdrop_path,
            poster: mv.poster_path,
            releaseYear: mv.release_date
                ? new Date(mv.release_date).getFullYear()
                : null,
            vote_average: mv.vote_average,
            raw: mv,
        }));

        const s: Item[] = tvs.map((sh: TVShow) => ({
            id: sh.id,
            mediaType: 'tv',
            title: sh.name || sh.original_name || 'Untitled',
            overview: sh.overview ?? '',
            backdrop: sh.backdrop_path,
            poster: sh.poster_path,
            releaseYear: sh.first_air_date
                ? new Date(sh.first_air_date).getFullYear()
                : null,
            vote_average: sh.vote_average,
            raw: sh,
        }));

        return [...m, ...s]
            .sort((a, b) => (b.raw.popularity ?? 0) - (a.raw.popularity ?? 0))
            .slice(0, 20);
    }, [props]);

    return (
        <View>
            <Carousel
                data={items}
                loop
                autoPlay
                autoPlayInterval={3500}
                pagingEnabled
                snapEnabled
                width={window.width}
                height={260}
                mode='parallax'
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 60,
                }}
                renderItem={({ item, index }) => (
                    <SlideItem item={item} key={index} />
                )}
            />
        </View>
    );
}

interface SlideItemProps {
    item: Item;
}

const SlideItem: React.FC<SlideItemProps> = ({ item }) => {
    const image =
        item.backdrop || item.poster
            ? `${TMDB_IMAGE_BASE}${item.backdrop || item.poster}`
            : undefined;

    return (
        <View style={styles.slide}>
            {image && (
                <Image
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode='cover'
                />
            )}

            <View style={styles.overlay}>
                <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                </Text>

                <Text style={styles.meta}>
                    {item.mediaType.toUpperCase()}
                    {item.releaseYear ? ` • ${item.releaseYear}` : ''}
                    {item.vote_average
                        ? ` • ⭐ ${item.vote_average.toFixed(1)}`
                        : ''}
                </Text>

                {item.overview && (
                    <Text style={styles.overview} numberOfLines={3}>
                        {item.overview}
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    slide: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 14,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    meta: {
        color: '#ddd',
        fontSize: 12,
        marginTop: 4,
    },
    overview: {
        color: '#ccc',
        fontSize: 13,
        marginTop: 6,
    },
});

export default Index;
