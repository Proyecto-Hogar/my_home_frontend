"use client";

import React, {createContext, useContext, useEffect, useReducer} from "react";
import {StorageService} from "@/utils/storage";
import {AuthenticationService} from "@/services/authentication.service";
import type {UserEntity} from "@/types/user.types";

interface AuthState {
    user: UserEntity | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

type AuthAction =
    | { type: "SET_AUTH"; user: UserEntity; token: string }
    | { type: "LOGOUT" }
    | { type: "SET_ERROR"; error: string | null }
    | { type: "SET_LOADING"; loading: boolean };

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "SET_AUTH":
            return {
                ...state,
                user: action.user,
                token: action.token,
                isAuthenticated: true,
                loading: false,
                error: null,
            };
        case "LOGOUT":
            return { ...initialState };
        case "SET_ERROR":
            return { ...state, error: action.error };
        case "SET_LOADING":
            return { ...state, loading: action.loading };
        default:
            return state;
    }
}

const AuthContext = createContext<{
    state: AuthState;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
}>({
    state: initialState,
    signIn: async () => {},
    signOut: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    const authService = new AuthenticationService();

    // Cargar sesión desde localStorage
    useEffect(() => {
        const token = StorageService.getToken();
        const user = StorageService.getUser();

        if (token && user) {
            dispatch({ type: "SET_AUTH", user, token });
        }
    }, []);

    async function signIn(email: string, password: string) {
        dispatch({ type: "SET_LOADING", loading: true });

        try {
            const user = await authService.signIn({ email, password });
            const token = StorageService.getToken()!;

            dispatch({ type: "SET_AUTH", user, token });
        } catch (error: unknown) {
            let message = "Error al iniciar sesión";

            if (error instanceof Error) {
                message = error.message;
            }

            dispatch({
                type: "SET_ERROR",
                error: message,
            });
        }
    }


    function signOut() {
        StorageService.clearAuthData();
        dispatch({ type: "LOGOUT" });
    }

    return (
        <AuthContext.Provider value={{ state, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
