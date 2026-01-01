// src/store/slices/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/src/store'; // adjust path if needed

export type User = {
    id: string;
    email: string;
    name?: string;
};

export type AuthState = {
    token: string | null;
    user: User | null;
};

const STORAGE_KEY = 'tmdb_auth_v1';

const loadInitial = (): AuthState => {
    try {
        const raw =
            typeof window !== 'undefined'
                ? localStorage.getItem(STORAGE_KEY)
                : null;
        if (!raw) return { token: null, user: null };
        return JSON.parse(raw) as AuthState;
    } catch {
        return { token: null, user: null };
    }
};

const initialState: AuthState = loadInitial();

const slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials(
            state,
            action: PayloadAction<{ token: string; user: User }>
        ) {
            state.token = action.payload.token;
            state.user = action.payload.user;
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ token: state.token, user: state.user })
                );
            } catch {}
        },
        logout(state) {
            state.token = null;
            state.user = null;
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch {}
        },
        updateUser(state, action: PayloadAction<Partial<User>>) {
            state.user = state.user
                ? { ...state.user, ...action.payload }
                : state.user;
            try {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify({ token: state.token, user: state.user })
                );
            } catch {}
        },
    },
});

export const { setCredentials, logout, updateUser } = slice.actions;
export default slice.reducer;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
