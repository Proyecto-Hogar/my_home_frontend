"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {getAuthenticationService} from "@/services/authentication.service";

interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
}

export default function RegisterPage() {
    const router = useRouter();
    const authService = getAuthenticationService();

    const [form, setForm] = useState<RegisterForm>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isFormValid =
        form.username &&
        form.email &&
        form.password &&
        form.password === form.confirmPassword &&
        form.password.length >= 8 &&
        form.acceptTerms;

    function handleChange<T extends keyof RegisterForm>(field: T, value: RegisterForm[T]) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);

        try {
            await authService.signUp({
                username: form.username,
                email: form.email,
                password: form.password,
            });

            setSuccess("¡Cuenta creada exitosamente! Redirigiendo...");

            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error al crear la cuenta";
            setError(message);
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* LEFT FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    {/* LOGO */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                            <svg viewBox="0 0 200 200" className="w-10 h-10">
                                <path
                                    d="M100 40 L160 80 L160 160 L40 160 L40 80 Z"
                                    fill="white"
                                    opacity="0.9"
                                />
                                <path
                                    d="M70 160 L70 110 L130 110 L130 160"
                                    fill="white"
                                    opacity="0.7"
                                />
                                <circle cx="100" cy="25" r="12" fill="#FBBF24" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Crear Cuenta
                        </h1>
                        <p className="text-sm text-gray-600">
                            Completa el formulario para registrarte
                        </p>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* USERNAME */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Nombre de Usuario *</label>
                            <input
                                type="text"
                                required
                                disabled={isLoading}
                                value={form.username}
                                onChange={(e) => handleChange("username", e.target.value)}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="juanperez"
                            />
                        </div>

                        {/* EMAIL */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Email *</label>
                            <input
                                type="email"
                                required
                                disabled={isLoading}
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* PASSWORD */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Contraseña *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    disabled={isLoading}
                                    value={form.password}
                                    onChange={(e) =>
                                        handleChange("password", e.target.value)
                                    }
                                    className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="••••••••"
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">Confirmar Contraseña *</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                disabled={isLoading}
                                value={form.confirmPassword}
                                onChange={(e) =>
                                    handleChange("confirmPassword", e.target.value)
                                }
                                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* TERMS */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={form.acceptTerms}
                                onChange={(e) =>
                                    handleChange("acceptTerms", e.target.checked)
                                }
                                className="h-4 w-4 mt-1 text-green-600"
                            />
                            <label className="ml-2 text-sm">
                                Acepto los{" "}
                                <a className="text-green-600 hover:underline">términos y condiciones</a>
                            </label>
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {/* SUCCESS */}
                        {success && (
                            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={!isFormValid || isLoading}
                            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {isLoading ? "Registrando..." : "Crear Cuenta"}
                        </button>

                        {/* LOGIN LINK */}
                        <p className="text-sm text-center text-gray-600 mt-3">
                            ¿Ya tienes cuenta?{" "}
                            <a href="/login" className="text-green-600 font-medium">
                                Inicia sesión
                            </a>
                        </p>
                    </form>
                </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 via-blue-50 to-green-100 items-center justify-center p-12">
                <div className="max-w-lg text-center space-y-4">
                    <h2 className="text-4xl font-bold text-gray-800">
                        ¡Bienvenido a <span className="text-green-600">Proyecta Hogar</span>!
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Únete y empieza a gestionar tus propiedades como un profesional
                    </p>
                </div>
            </div>
        </div>
    );
}
