import type { AxiosInstance } from 'axios';
import { ROUTES, api } from './index';
import type { Movie, TVShow } from '../lib/interfaces';

const getPopularItems = async (): Promise<{
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
} | null> => {
    try {
        const resp = await api.get(ROUTES.common.trending);
        return resp?.data?.data ?? resp?.data ?? resp;
    } catch (error: any) {
        console.log('Error fetching popular items:', error?.message, error);
        return null;
    }
};

export { getPopularItems };
