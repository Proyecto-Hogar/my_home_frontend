import type {UserEntity} from "@/types/user.types";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const StorageService = {
    setToken(token: string) {
        if (typeof window !== "undefined") {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },

    getToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem(TOKEN_KEY);
        }
        return null;
    },

    removeToken() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(TOKEN_KEY);
        }
    },

    setUser(user: UserEntity) {
        if (typeof window !== "undefined") {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
        }
    },

    getUser(): UserEntity | null {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        }
        return null;
    },

    removeUser() {
        if (typeof window !== "undefined") {
            localStorage.removeItem(USER_KEY);
        }
    },

    clearAuthData() {
        this.removeToken();
        this.removeUser();
    },

    hasStoredAuth(): boolean {
        return !!(this.getToken() && this.getUser());
    },
};