import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/context/AuthContext";
import {Toaster} from "sonner";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Proyecta Hogar",
    description: "Sistema de gestión inmobiliaria",
};

export default function RootLayout({children,}: { children: React.ReactNode; }) {
    return (
        <html lang="es">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
        >
        <AuthProvider>{children}</AuthProvider>
        <Toaster richColors position="top-right" />
        </body>
        </html>
    );
}
