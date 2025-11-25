"use client";
import {useAuth} from "@/context/AuthContext";
import {useRouter} from "next/navigation";
import React, {useEffect} from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
    const { state } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!state.loading && !state.isAuthenticated) {
            router.replace("/login");
        }
    }, [state.loading, state.isAuthenticated, router]);

    if (state.loading) return <div>Cargando...</div>;

    return <>{state.isAuthenticated ? children : null}</>;
}
