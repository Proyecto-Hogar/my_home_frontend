"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {useAuth} from "@/context/AuthContext";

export default function LoginPage() {
    const { signIn, state, clearError } = useAuth();
    const { loading: isLoading, error } = state;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        await signIn(email, password);
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* LADO IZQUIERDO - FORMULARIO */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <div className="w-full max-w-md">
                    {/* Logo + título */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl shadow-lg">
                            <svg viewBox="0 0 200 200" className="w-12 h-12">
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
                            Proyecta Hogar
                        </h1>
                        <p className="text-sm text-gray-600">
                            Ingresa tus credenciales para acceder
                        </p>
                    </div>

                    {/* FORMULARIO */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="h-11 text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Contraseña
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11 pr-10 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="remember"
                                checked={rememberMe}
                                onCheckedChange={(checked) =>
                                    setRememberMe(checked === true)
                                }
                            />
                            <Label htmlFor="remember" className="text-sm text-gray-700">
                                Recuérdame
                            </Label>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                                <div className="flex items-start">
                                    <ShieldAlert className="h-5 w-5 text-red-400 flex-shrink-0" />
                                    <div className="ml-3 flex-1">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Error al iniciar sesión
                                        </h3>
                                        <p className="mt-1 text-sm text-red-700">{error}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={clearError}
                                        className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 text-red-500 hover:bg-red-100 transition"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Botón submit */}
                        <Button
                            type="submit"
                            className="w-full h-11 text-sm font-medium"
                            disabled={!email || !password || isLoading}
                        >
                            {isLoading ? "Ingresando..." : "Continuar"}
                        </Button>

                        {/* Link a register */}
                        <p className="text-sm text-center text-gray-600 mt-4">
                            ¿No tienes cuenta?{" "}
                            <Link
                                href="/register"
                                className="text-green-600 hover:text-green-700 font-medium"
                            >
                                Regístrate aquí
                            </Link>
                        </p>

                        <p className="text-xs text-center text-gray-500 mt-6">
                            Al iniciar sesión, aceptas nuestros términos de servicio
                        </p>
                    </form>
                </div>
            </div>

            {/* LADO DERECHO - ILUSTRACIÓN */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 via-blue-50 to-blue-100 items-center justify-center p-12">
                <div className="max-w-lg">
                    <div className="flex justify-center gap-6 mb-12">
                        {/* Tarjeta 1 */}
                        <div className="transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                            <div className="w-28 h-36 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl shadow-2xl flex flex-col items-center justify-center p-4">
                                <div className="w-full h-8 bg-gray-600 rounded mb-2 flex items-center justify-end px-2">
                  <span className="text-green-400 text-xl font-mono">
                    123
                  </span>
                                </div>
                                <div className="grid grid-cols-3 gap-1 w-full">
                                    <div className="h-6 bg-gray-600 rounded" />
                                    <div className="h-6 bg-gray-600 rounded" />
                                    <div className="h-6 bg-gray-600 rounded" />
                                    <div className="h-6 bg-gray-600 rounded" />
                                    <div className="h-6 bg-gray-600 rounded" />
                                    <div className="h-6 bg-orange-500 rounded" />
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="transform translate-y-4 hover:translate-y-0 transition-transform duration-300">
                            <div className="w-32 h-32 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full shadow-2xl flex items-center justify-center relative">
                                <div className="text-7xl">🐷</div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <span className="text-xs">💰</span>
                                </div>
                            </div>
                        </div>

                        {/* Tarjeta 3 */}
                        <div className="transform rotate-6 hover:rotate-0 transition-transform duration-300">
                            <div className="w-28 h-36 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-2xl flex items-center justify-center p-4 border-2 border-green-300">
                                <div className="text-center">
                                    <div className="text-5xl mb-2">💵</div>
                                    <div className="text-green-700 font-bold text-xs">
                                        S/ 1000
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-bold text-gray-800 leading-tight">
                            Gestiona tus
                            <br />
                            <span className="text-green-600">propiedades</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-md mx-auto">
                            Sistema integral para la gestión de propiedades y financiamiento
                            habitacional
                        </p>

                        <div className="grid grid-cols-2 gap-4 mt-8 text-left">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Propiedades
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Catálogo completo
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Simulador
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Cálculo de préstamos
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Clientes
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Gestión completa
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <ShieldAlert className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        Seguridad
                                    </h3>
                                    <p className="text-xs text-gray-600">
                                        Datos protegidos
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
