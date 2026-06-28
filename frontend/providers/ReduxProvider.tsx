// src/providers/ReduxProvider.tsx
'use client';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';

export default function ReduxProvider({ children }: PropsWithChildren) {
    // No auth-resolved gate needed: the auth slice synchronously rehydrates the
    // token from localStorage at store init (client-side), so the first client
    // render already has the correct auth state — no logged-out flash.
    return <Provider store={store}>{children}</Provider>;
}
