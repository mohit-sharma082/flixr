export interface Genre {
    id: number;
    name: string;
}

export interface ProductionCompany {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
}

export interface ProductionCountry {
    iso_3166_1: string;
    name: string;
}

export interface SpokenLanguage {
    english_name: string;
    iso_639_1: string;
    name: string;
}

export interface Collection {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
}

export interface ImageItem {
    aspect_ratio: number;
    file_path: string;
    height: number;
    iso_639_1?: string | null;
    iso_3166_1?: string | null;
    vote_average: number;
    vote_count: number;
    width: number;
}
export interface Movie {
    adult: boolean;
    backdrop_path: string | null;
    belongs_to_collection: Collection | null;
    budget: number;
    genres?: Genre[];
    genre_ids?: number[];
    homepage: string | null;
    id: number;
    media_type?: string;
    imdb_id: string | null;
    origin_country: string[];
    original_language: string;
    original_title: string;
    overview: string | null;
    popularity?: number;
    poster_path: string | null;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    release_date: string;
    revenue: number;
    runtime: number | null;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string | null;
    title: string;
    video: boolean;
    vote_average?: number;
    vote_count?: number;

    credits?: Credits;

    images?: {
        backdrops: Array<ImageItem>;
        logos: Array<ImageItem>;
        posters: Array<ImageItem>;
    };
    videos?: {
        results: Array<{
            id: string;
            iso_639_1: string;
            iso_3166_1: string;
            key: string;
            name: string;
            site: string;
            size: number;
            type: string;
            official?: boolean;
            published_at?: string;
        }>;
    };
}

export interface TVShow {
    backdrop_path: string | null;
    created_by: Array<{
        id: number;
        credit_id: string;
        name: string;
        gender: number;
        profile_path: string | null;
    }>;
    episode_run_time: number[];
    first_air_date: string;
    genres: Genre[];
    homepage: string | null;
    id: number;
    in_production: boolean;
    languages: string[];
    last_air_date: string;
    last_episode_to_air: {
        air_date: string;
        episode_number: number;
        id: number;
        name: string;
        overview: string;
        production_code: string;
        season_number: number;
        still_path: string | null;
        vote_average: number;
        vote_count: number;
    };
    name: string;
    next_episode_to_air: {
        air_date: string;
        episode_number: number;
        id: number;
        name: string;
        overview: string;
        production_code: string;
        season_number: number;
        still_path: string | null;
        vote_average: number;
        vote_count: number;
    } | null;
    networks: Array<{
        name: string;
        id: number;
        logo_path: string | null;
        origin_country: string;
    }>;
    number_of_episodes: number;
    number_of_seasons: number;
    origin_country: string[];
    original_language: string;
    original_name: string;
    overview: string | null;
    popularity?: number;
    poster_path: string | null;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    seasons: Array<{
        air_date: string;
        episode_count: number;
        id: number;
        name: string;
        overview: string;
        poster_path: string | null;
        season_number: number;
    }>;
    spoken_languages: SpokenLanguage[];
    status: string;
    tagline: string | null;
    type: string;
    vote_average?: number;
    vote_count?: number;
}

export interface Cast {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path?: string | null;
    cast_id: number;
    character: string;
    credit_id: string;
    order: number;
}

export interface Crew {
    adult: boolean;
    gender: number;
    id: number;
    known_for_department: string;
    name: string;
    original_name: string;
    popularity: number;
    profile_path?: string | null;
    credit_id: string;
    department: string;
    job: string;
}

export interface Credits {
    cast: Cast[];
    crew: Crew[];
}

export interface KnownForItem {
    id: number;
    title?: string;
    name?: string;
    media_type?: string;
    poster_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
}

export interface Person {
    id: number;
    name: string;
    media_type?: 'person';
    profile_path?: string | null;
    popularity?: number;
    known_for?: KnownForItem[];
    gender?: number;
    adult?: boolean;
}

// -------------------- Additional Interfaces --------------------

// Reviews

export interface ReviewAuthorDetails {
    name: string;
    username: string;
    avatar_path: string | null;
    rating: number | null;
}

export interface Review {
    author: string;
    author_details: ReviewAuthorDetails;
    content: string;
    created_at: string;
    id: string;
    updated_at: string;
    url: string;
}

export interface ReviewResponse {
    id: number;
    page: number;
    results: Review[];
    total_pages: number;
    total_results: number;
}

// Videos

export interface Video {
    id: string;
    iso_639_1: string;
    iso_3166_1: string;
    key: string;
    name: string;
    site: string;
    size: number;
    type: string;
}

export interface VideoResponse {
    id: number;
    results: Video[];
}

// Images

export interface ImageResponse {
    id: number;
    backdrops: ImageItem[];
    logos: ImageItem[];
    posters: ImageItem[];
}
