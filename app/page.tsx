"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/context/AuthContext";

export default function HomePage() {
    const router = useRouter();
    const { state } = useAuth();

    // Si ya está autenticado → redirigir automáticamente
    useEffect(() => {
        if (state.isAuthenticated) {
            router.replace("/properties");
        }
    }, [state.isAuthenticated, router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
            <div className="max-w-xl w-full text-center space-y-8">
                {/* Logo */}
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-3xl font-bold">🏡</span>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900">
                    Bienvenido a <span className="text-green-600">Proyecta Hogar</span>
                </h1>

                <p className="text-gray-600 text-lg">
                    Sistema integral para la gestión de propiedades y financiamiento
                    habitacional.
                </p>

                <div className="flex items-center justify-center">
                    <Button
                        size="lg"
                        className="px-10 bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => router.push("/login")}
                    >
                        Ingresar
                    </Button>
                </div>

                <p className="text-sm text-gray-500">
                    ¿No tienes cuenta?{" "}
                    <button
                        onClick={() => router.push("/register")}
                        className="text-green-600 hover:underline"
                    >
                        Regístrate aquí
                    </button>
                </p>
            </div>
        </div>
    );
}
