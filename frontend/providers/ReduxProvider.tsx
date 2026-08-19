// src/providers/ReduxProvider.tsx
'use client';
import React, { PropsWithChildren, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { hydrateFromStorage } from '../store/slices/authSlice';

export default function ReduxProvider({ children }: PropsWithChildren) {
    // Restore the persisted session *after* mount, not at store creation.
    // The server has no localStorage, so seeding the store synchronously would
    // make the first client render disagree with the server HTML wherever the
    // UI branches on auth (header, floating nav, review composer) — a hydration
    // mismatch. The cost is one extra render for signed-in users; components
    // that care can gate on `selectAuthHydrated`.
    useEffect(() => {
        store.dispatch(hydrateFromStorage());
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
