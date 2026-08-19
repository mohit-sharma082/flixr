// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export type User = {
    id: string;
    email: string;
    name?: string;
};

export type AuthState = {
    token: string | null;
    user: User | null;
    /** False until the client has read localStorage; lets the UI hold off on
     *  "signed out" messaging during the first paint. */
    hydrated: boolean;
};

const STORAGE_KEY = 'tmdb_auth_v1';

const persist = (state: AuthState) => {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ token: state.token, user: state.user })
        );
    } catch {}
};

/**
 * Deliberately empty, even in the browser.
 *
 * Reading localStorage here would give the client store a token the server
 * never had, so the first client render would disagree with the server HTML
 * (header, floating nav and the review composer all branch on it) and React
 * would throw a hydration mismatch and re-render the tree. The token is loaded
 * instead by `hydrateFromStorage`, dispatched after mount by ReduxProvider.
 */
const initialState: AuthState = { token: null, user: null, hydrated: false };

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        /** Client-only: restore a persisted session after hydration. */
        hydrateFromStorage(state) {
            state.hydrated = true;
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) return;
                const saved = JSON.parse(raw) as Partial<AuthState>;
                state.token = saved.token ?? null;
                state.user = saved.user ?? null;
            } catch {
                /* corrupt or unavailable storage — stay signed out */
            }
        },
        setCredentials(
            state,
            action: PayloadAction<{ token: string; user: User }>
        ) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            state.hydrated = true;
            persist(state);
        },
        logout(state) {
            state.token = null;
            state.user = null;
            state.hydrated = true;
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {}
        },
        updateUser(state, action: PayloadAction<Partial<User>>) {
            state.user = state.user
                ? { ...state.user, ...action.payload }
                : state.user;
            persist(state);
        },
    },
});

export const { hydrateFromStorage, setCredentials, logout, updateUser } =
    slice.actions;
export default slice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthHydrated = (state: RootState) => state.auth.hydrated;
